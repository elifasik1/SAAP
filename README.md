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
│   ├── SAAP.API/              # Web API, controllers, middleware
│   ├── SAAP.Web/              # React frontend (React + TypeScript + Vite)
│   └── SAAP.UnitTests/        # Unit test projesi
├── docker-compose.yml         # Docker Compose konfigürasyonu
├── .dockerignore             # Docker için ignore dosyaları
└── README.md                  # Proje dokümantasyonu
```

## Teknolojiler

### Backend
- **.NET 10.0**
- **ASP.NET Core**
- **Entity Framework Core 10.0.9**
- **PostgreSQL (Npgsql)**
- **Redis (StackExchange.Redis)**
- **Serilog.AspNetCore** (Serilog.Sinks.Console, Serilog.Sinks.File)
- **Microsoft.AspNetCore.OpenApi**

### Frontend
- **React 19**
- **TypeScript**
- **Vite**
- **React Router DOM**
- **Recharts** (Chart kütüphanesi)
- **Lucide React** (Icon kütüphanesi)

### DevOps
- **Docker & Docker Compose**

## Gereksinimler

### Local Development
- .NET 10.0 SDK
- Node.js (v18+) ve npm
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

2. Backend bağımlılıklarını yükleyin:
```bash
dotnet restore
```

3. Frontend bağımlılıklarını yükleyin:
```bash
cd src/SAAP.Web
npm install
cd ../..
```

4. Connection string'leri `appsettings.json` dosyasında yapılandırın:
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

5. Veri tabanı migration'larını çalıştırın:
```bash
dotnet ef database update --project src/SAAP.Infrastructure
```

## Çalıştırma

### Local Development

Backend'i çalıştırmak için:

```bash
dotnet run --project src/SAAP.API
```

Frontend'i çalıştırmak için:

```bash
cd src/SAAP.Web
npm run dev
```

Backend varsayılan olarak `https://localhost:5001`, frontend ise `http://localhost:5173` adresinde çalışacaktır.

### Docker ile Çalıştırma

Backend servislerini (PostgreSQL, Redis, API) Docker Compose ile başlatmak için:

**Not:** Frontend şu an Docker Compose'a dahil değil, local development ile çalıştırılmalıdır.

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

### Frontend Development

Frontend development komutları:

```bash
cd src/SAAP.Web

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

Frontend proje yapısı:
- `src/pages/` - Sayfa bileşenleri
- `src/components/` - Tekrar kullanılabilir bileşenler
- `src/services/` - API servisleri
- `src/context/` - Context providers
- `src/data/` - Veri ve tip tanımlamaları

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
