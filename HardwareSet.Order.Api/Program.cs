using HardwareSet.Order.Api.Consumers;
using HardwareSet.Order.Api.Data;
using HardwareSet.Order.Api.Repositories;
using HardwareSet.Order.Api.Sagas;
using HardwareSet.Order.Api.Services;
using MassTransit;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks();

// Configure PostgreSQL with Entity Framework Core
builder.Services.AddDbContext<OrderDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("OrderPostgres")));

// Register Repositories and Services
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();

// Configure MassTransit State Machine Saga + Payment Consumer with RabbitMQ
builder.Services.AddMassTransit(bus =>
{
    bus.AddConsumer<ProcessOrderPaymentConsumer>();

    bus.AddSagaStateMachine<OrderStateMachine, OrderSagaState>()
        .InMemoryRepository();

    bus.UsingRabbitMq((context, cfg) =>
    {
        var host = builder.Configuration["RabbitMq:Host"] ?? "localhost";
        var virtualHost = builder.Configuration["RabbitMq:VirtualHost"] ?? "/";

        cfg.Host(host, virtualHost, h =>
        {
            h.Username(builder.Configuration["RabbitMq:Username"] ?? "admin");
            h.Password(builder.Configuration["RabbitMq:Password"] ?? "password123");
        });

        cfg.ConfigureEndpoints(context);
    });
});

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactAppPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
}
catch (Exception ex)
{
    app.Logger.LogWarning(ex, "Não foi possível conectar ao PostgreSQL na inicialização do Order.Api.");
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("ReactAppPolicy");

app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
