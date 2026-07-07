# SAAP

SAAP (Secure API Application Platform), .NET 10.0 tabanlı, Clean Architecture prensiplerine uygun geliştirilmiş modern bir API uygulamasıdır.

## Özellikler

- **Clean Architecture**: Domain, Application, Infrastructure ve API katmanlarına ayrılmış mimari
- **PostgreSQL**: Entity Framework Core ile veri tabanı yönetimi
- **Redis**: Rate limiting ve caching için Redis kullanımı
- **Audit Logging**: Tüm HTTP isteklerinin otomatik loglanması
- **OpenAPI/Swagger**: API dokümantasyonu
- **Serilog**: Gelişmiş logging (Console + Daily File sink)
- **Rate Limiting**: Redis tabanlı istek sınırlama
- **Docker Support**: Docker Compose ile tam konteynerizasyon
- **Configuration Management**: appsettings.json üzerinden merkezi konfigürasyon

## Proje Yapısı

```
SAAP/
├── src/
│   ├── SAAP.Domain/           # Domain entities ve business logic
│   ├── SAAP.Application/      # Application services ve DTOs
│   ├── SAAP.Infrastructure/   # Veri erişim, caching, external services
│   └── SAAP.API/              # Web API, controllers, middleware
├── docker-compose.yml         # Docker Compose konfigürasyonu
├── Dockerfile                 # API konteyneri için build ayarları
├── .dockerignore             # Docker için ignore dosyaları
└── README.md                  # Proje dokümantasyonu
```

## Teknolojiler

- **.NET 10.0**
- **ASP.NET Core**
- **Entity Framework Core 10.0.9**
- **PostgreSQL (Npgsql)**
- **Redis (StackExchange.Redis)**
- **Serilog.AspNetCore** (Serilog.Sinks.Console, Serilog.Sinks.File)
- **Microsoft.AspNetCore.OpenApi**
- **Docker & Docker Compose**

## Gereksinimler

### Local Development
- .NET 10.0 SDK
- PostgreSQL veri tabanı
- Redis sunucusu

### Docker Deployment
- Docker
- Docker Compose

## Kurulum

1. Depoyu klonlayın:
```bash
git clone <repository-url>
cd SAAP
```

2. Bağımlılıkları yükleyin:
```bash
dotnet restore
```

3. Connection string'leri `appsettings.json` dosyasında yapılandırın:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=SAAPDb;Username=postgres;Password=mysecretpassword"
  },
  "RedisSettings": {
    "ConnectionString": "localhost:6379"
  }
}
```

4. Veri tabanı migration'larını çalıştırın:
```bash
dotnet ef database update --project src/SAAP.Infrastructure
```

## Çalıştırma

### Local Development

Geliştirme ortamında çalıştırmak için:

```bash
dotnet run --project src/SAAP.API
```

API varsayılan olarak `https://localhost:5001` adresinde çalışacaktır.

### Docker ile Çalıştırma

Tüm servisleri (PostgreSQL, Redis, API) Docker Compose ile başlatmak için:

```bash
docker-compose up -d
```

Sadece API'yi rebuild etmek için:

```bash
docker-compose up -d --build saap-api
```

Logları görüntülemek için:

```bash
docker-compose logs -f
```

Servisleri durdurmak için:

```bash
docker-compose down
```

Volumes ile birlikte tamamen temizlemek için:

```bash
docker-compose down -v
```

Docker ortamında API `http://localhost:8080` adresinde çalışacaktır.

## API Endpoint'leri

### Audit Logs
- `GET /api/audit-logs` - Son 50 audit log kaydını getirir

### Weather Forecast (Örnek)
- `GET /weatherforecast` - Örnek hava durumu verisi

### OpenAPI Dokümantasyonu
Geliştirme ortamında OpenAPI dokümantasyonu şu adreste mevcuttur:
- Local: `https://localhost:5001/openapi/v1.json`
- Docker: `http://localhost:8080/openapi/v1.json`

## Development

### Logging

Serilog kullanılarak merkezi loglama sistemi uygulanmıştır:
- **Console Sink**: Konsola log çıktısı
- **File Sink**: `logs/log-.txt` dosyasına günlük log arşivleme
- **Error Handling**: AuditLoggingMiddleware'de hata loglama

Log dosyaları `logs/` klasöründe günlük olarak saklanır.

### Configuration

Tüm konfigürasyon `appsettings.json` dosyasında yönetilir:
- `ConnectionStrings:DefaultConnection`: PostgreSQL bağlantı string'i
- `RedisSettings:ConnectionString`: Redis bağlantı string'i

Docker ortamında bu değerler environment variables ile override edilir:
- `ConnectionStrings__DefaultConnection`
- `RedisSettings__ConnectionString`

### Migration Oluşturma

Yeni bir migration oluşturmak için:

```bash
dotnet ef migrations add MigrationName --project src/SAAP.Infrastructure
```

### Migration'ı Uygulama

```bash
dotnet ef database update --project src/SAAP.Infrastructure
```

## Lisans

Bu proje açık kaynaklıdır.
