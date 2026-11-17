using HardwareSet.Contracts.Events;
using MassTransit;

namespace HardwareSet.Order.Api.Consumers;

public class ProcessOrderPaymentConsumer : IConsumer<ProcessOrderPaymentCommand>
{
    private readonly ILogger<ProcessOrderPaymentConsumer> _logger;

    public ProcessOrderPaymentConsumer(ILogger<ProcessOrderPaymentConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ProcessOrderPaymentCommand> context)
    {
        var command = context.Message;

        _logger.LogInformation(
            "Processando pagamento do pedido {OrderId} no valor de R$ {Amount:N2} via {Method}...",
            command.OrderId,
            command.Amount,
            command.PaymentMethod);

        // Simula latência de gateway de pagamento
        await Task.Delay(350, context.CancellationToken);

        if (command.SimulatePaymentFailure)
        {
            _logger.LogWarning(
                "Simulação de recusa de pagamento acionada para o pedido {OrderId}.",
                command.OrderId);

            await context.Publish(new OrderPaymentFailedEvent
            {
                OrderId = command.OrderId,
                Reason = "Transação não autorizada pela operadora do cartão",
                FailedAt = DateTime.UtcNow
            }, context.CancellationToken);

            return;
        }

        var transactionId = $"TX-{Guid.NewGuid().ToString("N")[..10].ToUpperInvariant()}";

        await context.Publish(new OrderPaymentApprovedEvent
        {
            OrderId = command.OrderId,
            TransactionId = transactionId,
            ApprovedAt = DateTime.UtcNow
        }, context.CancellationToken);
    }
}
