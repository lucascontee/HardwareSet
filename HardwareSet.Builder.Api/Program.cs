using HardwareSet.Builder.Api.Clients;
using HardwareSet.Builder.Api.Data;
using HardwareSet.Builder.Api.Repositories;
using HardwareSet.Builder.Api.Rules;
using HardwareSet.Builder.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Redis
builder.Services.Configure<RedisDbSettings>(
    builder.Configuration.GetSection(RedisDbSettings.SectionName));
builder.Services.AddSingleton<RedisDbContext>();

// Register Repositories
builder.Services.AddScoped<IBuildRepository, BuildRepository>();

// Regras de negócio e validação de compatibilidade de hardware (Strategy / Rule Engine)
builder.Services.AddSingleton<ICompatibilityRule, CpuMotherboardSocketRule>();
builder.Services.AddSingleton<ICompatibilityRule, MemoryCompatibilityRule>();
builder.Services.AddSingleton<ICompatibilityRule, PowerSupplyRule>();
builder.Services.AddSingleton<ICompatibilityRule, PcieAndStorageBandwidthRule>();
builder.Services.AddSingleton<ICompatibilityRule, MissingComponentsRule>();

// Serviços de domínio do Builder.Api
builder.Services.AddScoped<ICompatibilityService, CompatibilityService>();
builder.Services.AddScoped<IBuilderService, BuilderService>();

// Cliente HTTP para comunicação síncrona com o microsserviço de Catálogo (HardwareSet.Api)
builder.Services.AddHttpClient<ICatalogClient, CatalogHttpClient>(client =>
{
    var catalogBaseUrl = builder.Configuration["CatalogApi:BaseUrl"] ?? "http://localhost:5188";
    client.BaseAddress = new Uri(catalogBaseUrl);
    client.Timeout = TimeSpan.FromSeconds(5);
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

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("ReactAppPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();
