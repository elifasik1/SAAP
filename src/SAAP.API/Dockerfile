# Multi-stage build for optimized image size
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
# Kök dizinde (SAAP/) olduğumuzu varsayarak çalışıyoruz
WORKDIR /src

# Dosya yollarını kök dizine göre göreceli olarak veriyoruz
COPY ["src/SAAP.API/SAAP.API.csproj", "src/SAAP.API/"]
COPY ["src/SAAP.Application/SAAP.Application.csproj", "src/SAAP.Application/"]
COPY ["src/SAAP.Domain/SAAP.Domain.csproj", "src/SAAP.Domain/"]
COPY ["src/SAAP.Infrastructure/SAAP.Infrastructure.csproj", "src/SAAP.Infrastructure/"]

RUN dotnet restore "src/SAAP.API/SAAP.API.csproj"

# Tüm kaynak kodlarını kopyala
COPY . .

# Build aşaması
WORKDIR "/src/src/SAAP.API"
RUN dotnet build "SAAP.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SAAP.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SAAP.API.dll"]