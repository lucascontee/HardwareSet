# Estágio 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["HardwareSet.Contracts/HardwareSet.Contracts.csproj", "HardwareSet.Contracts/"]
COPY ["HardwareSet.Api/HardwareSet.Api.csproj", "HardwareSet.Api/"]
RUN dotnet restore "HardwareSet.Api/HardwareSet.Api.csproj"

COPY ["HardwareSet.Contracts/", "HardwareSet.Contracts/"]
COPY ["HardwareSet.Api/", "HardwareSet.Api/"]
WORKDIR "/src/HardwareSet.Api"
RUN dotnet publish "HardwareSet.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio 2: Runtime enxuto
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
RUN apk add --no-cache icu-libs
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HardwareSet.Api.dll"]
