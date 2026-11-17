# Estágio 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["HardwareSet.Builder.Api/HardwareSet.Builder.Api.csproj", "HardwareSet.Builder.Api/"]
RUN dotnet restore "HardwareSet.Builder.Api/HardwareSet.Builder.Api.csproj"

COPY ["HardwareSet.Builder.Api/", "HardwareSet.Builder.Api/"]
WORKDIR "/src/HardwareSet.Builder.Api"
RUN dotnet publish "HardwareSet.Builder.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio 2: Runtime enxuto
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
RUN apk add --no-cache icu-libs
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HardwareSet.Builder.Api.dll"]
