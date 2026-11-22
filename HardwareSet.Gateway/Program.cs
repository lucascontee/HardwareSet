using Yarp.ReverseProxy.Transforms;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks();

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddTransforms(builderContext =>
    {
        // Obrigatório em ambientes como Azure Container Apps / Kubernetes Ingress:
        // Usa o Host do microsserviço de destino em vez de repassar o Host do Gateway (evita loop infinito no Envoy da Azure).
        builderContext.AddOriginalHost(false);
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactAppPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("ReactAppPolicy");
app.MapHealthChecks("/health");
app.MapReverseProxy();

app.Run();
