# Estágio 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["HardwareSet.Contracts/HardwareSet.Contracts.csproj", "HardwareSet.Contracts/"]
COPY ["HardwareSet.Order.Api/HardwareSet.Order.Api.csproj", "HardwareSet.Order.Api/"]
RUN dotnet restore "HardwareSet.Order.Api/HardwareSet.Order.Api.csproj"

COPY ["HardwareSet.Contracts/", "HardwareSet.Contracts/"]
COPY ["HardwareSet.Order.Api/", "HardwareSet.Order.Api/"]
WORKDIR "/src/HardwareSet.Order.Api"
RUN dotnet publish "HardwareSet.Order.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio 2: Runtime enxuto
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
RUN apk add --no-cache icu-libs
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HardwareSet.Order.Api.dll"]
