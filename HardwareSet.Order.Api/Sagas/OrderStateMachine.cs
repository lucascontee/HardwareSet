using HardwareSet.Contracts.Events;
using HardwareSet.Order.Api.Entities;
using HardwareSet.Order.Api.Repositories;
using MassTransit;

namespace HardwareSet.Order.Api.Sagas;

/// <summary>
/// Orquestrador da Saga de Fechamento de Pedido (MassTransit State Machine):
/// 1. OrderSubmitted -> Solicita reserva das peças no Inventory.Api
/// 2. OrderStockReserved -> Solicita processamento de pagamento
/// 3. OrderPaymentApproved -> Confirma o pedido para montagem
/// 4. OrderPaymentFailed -> Dispara Transação Compensatória (ReleaseOrderStockCommand) devolvendo as peças ao estoque
/// </summary>
public class OrderStateMachine : MassTransitStateMachine<OrderSagaState>
{
    public State ReservingStock { get; private set; } = null!;
    public State ProcessingPayment { get; private set; } = null!;
    public State Completed { get; private set; } = null!;
    public State Failed { get; private set; } = null!;

    public Event<OrderSubmittedEvent> OrderSubmitted { get; private set; } = null!;
    public Event<OrderStockReservedEvent> StockReserved { get; private set; } = null!;
    public Event<OrderStockReservationFailedEvent> StockReservationFailed { get; private set; } = null!;
    public Event<OrderPaymentApprovedEvent> PaymentApproved { get; private set; } = null!;
    public Event<OrderPaymentFailedEvent> PaymentFailed { get; private set; } = null!;

    public OrderStateMachine(IServiceScopeFactory scopeFactory, ILogger<OrderStateMachine> logger)
    {
        InstanceState(x => x.CurrentState);

        Event(() => OrderSubmitted, x => x.CorrelateById(m => m.Message.OrderId));
        Event(() => StockReserved, x => x.CorrelateById(m => m.Message.OrderId));
        Event(() => StockReservationFailed, x => x.CorrelateById(m => m.Message.OrderId));
        Event(() => PaymentApproved, x => x.CorrelateById(m => m.Message.OrderId));
        Event(() => PaymentFailed, x => x.CorrelateById(m => m.Message.OrderId));

        Initially(
            When(OrderSubmitted)
                .ThenAsync(async context =>
                {
                    context.Saga.TotalAmount = context.Message.TotalAmount;
                    context.Saga.PaymentMethod = context.Message.PaymentMethod;
                    context.Saga.SimulatePaymentFailure = context.Message.SimulatePaymentFailure;
                    context.Saga.Items = context.Message.Items;
                    context.Saga.UpdatedAt = DateTime.UtcNow;

                    logger.LogInformation(
                        "[Saga] Pedido {OrderId} iniciado. Solicitando reserva de {Count} componentes no estoque...",
                        context.Saga.CorrelationId,
                        context.Message.Items.Count);

                    using var scope = scopeFactory.CreateScope();
                    var repo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
                    await repo.UpdateStatusAsync(
                        context.Saga.CorrelationId,
                        OrderStatus.ReservingStock,
                        "Reservando componentes no estoque...");
                })
                .Publish(context => new ReserveOrderStockCommand
                {
                    OrderId = context.Saga.CorrelationId,
                    Items = context.Saga.Items
                })
                .TransitionTo(ReservingStock)
        );

        During(ReservingStock,
            When(StockReserved)
                .ThenAsync(async context =>
                {
                    context.Saga.UpdatedAt = DateTime.UtcNow;

                    logger.LogInformation(
                        "[Saga] Estoque reservado para o pedido {OrderId}. Acionando processamento de pagamento...",
                        context.Saga.CorrelationId);

                    using var scope = scopeFactory.CreateScope();
                    var repo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
                    await repo.UpdateStatusAsync(
                        context.Saga.CorrelationId,
                        OrderStatus.ProcessingPayment,
                        "Estoque reservado. Processando pagamento...");
                })
                .Publish(context => new ProcessOrderPaymentCommand
                {
                    OrderId = context.Saga.CorrelationId,
                    Amount = context.Saga.TotalAmount,
                    PaymentMethod = context.Saga.PaymentMethod,
                    SimulatePaymentFailure = context.Saga.SimulatePaymentFailure
                })
                .TransitionTo(ProcessingPayment),

            When(StockReservationFailed)
                .ThenAsync(async context =>
                {
                    context.Saga.UpdatedAt = DateTime.UtcNow;

                    logger.LogWarning(
                        "[Saga] Pedido {OrderId} cancelado por falta de estoque: {Reason}",
                        context.Saga.CorrelationId,
                        context.Message.Reason);

                    using var scope = scopeFactory.CreateScope();
                    var repo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
                    await repo.UpdateStatusAsync(
                        context.Saga.CorrelationId,
                        OrderStatus.FailedOutOfStock,
                        $"Pedido não concluído: {context.Message.Reason}");
                })
                .TransitionTo(Failed)
                .Finalize()
        );

        During(ProcessingPayment,
            When(PaymentApproved)
                .ThenAsync(async context =>
                {
                    context.Saga.UpdatedAt = DateTime.UtcNow;

                    logger.LogInformation(
                        "[Saga] Pagamento aprovado para o pedido {OrderId} (Transação {TxId}). Pedido confirmado!",
                        context.Saga.CorrelationId,
                        context.Message.TransactionId);

                    using var scope = scopeFactory.CreateScope();
                    var repo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
                    await repo.UpdateStatusAsync(
                        context.Saga.CorrelationId,
                        OrderStatus.Confirmed,
                        "Pagamento confirmado e peças reservadas. Seu computador entrou na fila de montagem.",
                        context.Message.TransactionId);
                })
                .TransitionTo(Completed)
                .Finalize(),

            When(PaymentFailed)
                .ThenAsync(async context =>
                {
                    context.Saga.UpdatedAt = DateTime.UtcNow;

                    logger.LogWarning(
                        "[Saga] Pagamento recusado para o pedido {OrderId} ({Reason}). Disparando transação compensatória para devolver peças ao estoque...",
                        context.Saga.CorrelationId,
                        context.Message.Reason);

                    using var scope = scopeFactory.CreateScope();
                    var repo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
                    await repo.UpdateStatusAsync(
                        context.Saga.CorrelationId,
                        OrderStatus.FailedPaymentCompensated,
                        $"Pagamento recusado ({context.Message.Reason}). As peças reservadas foram automaticamente devolvidas ao estoque.");
                })
                .Publish(context => new ReleaseOrderStockCommand
                {
                    OrderId = context.Saga.CorrelationId,
                    Items = context.Saga.Items,
                    Reason = context.Message.Reason
                })
                .TransitionTo(Failed)
                .Finalize()
        );

        SetCompletedWhenFinalized();
    }
}
