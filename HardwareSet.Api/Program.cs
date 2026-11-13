using HardwareSet.Api.Converters;
using HardwareSet.Api.Data;
using HardwareSet.Api.Repositories;
using HardwareSet.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection(MongoDbSettings.SectionName));
builder.Services.AddSingleton<MongoDbContext>();

// Register Repositories and Services
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

// Configure Controllers and JSON Serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new BsonDocumentJsonConverter());
    });

// Configure CORS for React front-end integration
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
    var mongoContext = app.Services.GetRequiredService<MongoDbContext>();
    await DatabaseSeeder.SeedAsync(mongoContext);
}
catch (Exception ex)
{
    app.Logger.LogWarning(ex, "Não foi possível executar o seed automático inicial.");
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("ReactAppPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();
