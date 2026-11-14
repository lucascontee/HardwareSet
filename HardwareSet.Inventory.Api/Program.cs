using HardwareSet.Inventory.Api.Consumers;
using HardwareSet.Inventory.Api.Data;
using HardwareSet.Inventory.Api.Repositories;
using HardwareSet.Inventory.Api.Services;
using MassTransit;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure PostgreSQL with Entity Framework Core
builder.Services.AddDbContext<InventoryDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("InventoryPostgres")));

// Register Repositories and Services
builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
builder.Services.AddScoped<IInventoryService, InventoryService>();


builder.Services.AddMassTransit(bus =>
{
    bus.AddConsumer<ProductCreatedConsumer>();

    bus.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Host"] ?? "localhost", "/", h =>
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

// Garante a criação automática da tabela inventory_items no PostgreSQL na inicialização
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
}
catch (Exception ex)
{
    app.Logger.LogWarning(ex, "Não foi possível conectar ao PostgreSQL na inicialização para EnsureCreatedAsync.");
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("ReactAppPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();
