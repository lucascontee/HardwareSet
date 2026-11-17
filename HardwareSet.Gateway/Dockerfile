# Estágio 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["HardwareSet.Gateway/HardwareSet.Gateway.csproj", "HardwareSet.Gateway/"]
RUN dotnet restore "HardwareSet.Gateway/HardwareSet.Gateway.csproj"

COPY ["HardwareSet.Gateway/", "HardwareSet.Gateway/"]
WORKDIR "/src/HardwareSet.Gateway"
RUN dotnet publish "HardwareSet.Gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio 2: Runtime enxuto
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
RUN apk add --no-cache icu-libs
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HardwareSet.Gateway.dll"]
