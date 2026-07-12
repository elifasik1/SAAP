# SAAP — Secure API Application Platform

> Modern, full-stack güvenlik yönetim platformu. JWT kimlik doğrulama, audit logging, rate limiting ve gerçek zamanlı dashboard ile API trafiğinizi uçtan uca izleyin.

![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=flat-square&logo=dotnet)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Rate_Limiting-DC382D?style=flat-square&logo=redis&logoColor=white)

---

## Proje Hakkında

**SAAP (Secure API Application Platform)**, API güvenliği ve operasyonel görünürlük ihtiyaçları için geliştirilmiş bir full-stack web uygulamasıdır. Backend tarafında Clean Architecture prensipleriyle katmanlı bir .NET API; frontend tarafında ise React + TypeScript ile modern, karanlık temalı bir güvenlik konsolu sunar.

Platform; kullanıcı kimlik doğrulama, audit log takibi, güvenlik tercihleri yönetimi, raporlama ve bildirim sistemini tek bir arayüzde birleştirir.

---

## Öne Çıkan Özellikler

| Modül | Açıklama |
|-------|----------|
| **Dashboard** | Canlı istatistikler, trafik grafikleri ve son audit log özeti |
| **Denetim Yönetimi** | IP, endpoint, durum kodu ve tarih filtreleriyle log arama & CSV dışa aktarma |
| **Raporlama** | Saatlik yoğunluk haritası ve aylık hata/risk trend analizi |
| **Ayarlar** | Profil yönetimi, avatar yükleme ve güvenlik tercihleri (2FA, oturum kilidi, IP whitelist) |
| **Audit Middleware** | Tüm HTTP isteklerinin otomatik loglanması |
| **Rate Limiting** | Redis tabanlı istek sınırlama ve kötüye kullanım koruması |
| **JWT Auth** | Kayıt, giriş, rol tabanlı yetkilendirme |

---

## Ekran Görüntüleri

## Ekran Görüntüleri

### 1. Ana Sayfa (Landing Page)
![Ana Sayfa]("Ekran görüntüsü 2026-07-12 174459.png")

### 2. Güvenlik Konsolu (Dashboard)
![Dashboard]("Ekran görüntüsü 2026-07-12 174516.png")

### 3. Denetim Yönetimi (Audit Logs)
![Denetim Yönetimi]("Ekran görüntüsü 2026-07-12 174543.png")

### 4. Raporlama ve Analitik
![Raporlama]("Ekran görüntüsü 2026-07-12 174551.png")

### 5. Kullanıcı Profili ve Ayarlar
![Profil ve Ayarlar]("Ekran görüntüsü 2026-07-12 174557.png")



---

## Mimari

```
┌─────────────────────────────────────────────────────────┐
│                    SAAP.Web (React)                      │
│   Dashboard · Audit · Reporting · Settings · Auth       │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (JWT)
┌────────────────────────▼────────────────────────────────┐
│                    SAAP.API (.NET 10)                    │
│   Controllers · Middleware · Rate Limiter · OpenAPI      │
├─────────────────────────────────────────────────────────┤
│               SAAP.Application (Use Cases)               │
├─────────────────────────────────────────────────────────┤
│          SAAP.Infrastructure (EF Core · Redis)           │
├─────────────────────────────────────────────────────────┤
│              SAAP.Domain (Entities · Rules)              │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │  PostgreSQL · Redis  │
              └─────────────────────┘
```

**Clean Architecture** katmanları sayesinde domain logic, veri erişimi ve sunum katmanları birbirinden izole edilmiştir. Bu yapı test edilebilirliği artırır ve yeni modüllerin eklenmesini kolaylaştırır.

---

## Teknoloji Yığını

### Backend
- ASP.NET Core 10 · Entity Framework Core · PostgreSQL
- Redis (rate limiting & caching)
- JWT Bearer Authentication · ASP.NET Identity
- Serilog (console + daily file sink)
- OpenAPI / Scalar API Reference

### Frontend
- React 19 · TypeScript · Vite
- React Router · Axios · Context API
- Recharts (grafikler) · Lucide React (ikonlar)
- Antigravity UI — özel dark theme tasarım sistemi

### DevOps
- Docker Compose (PostgreSQL + Redis)
- GitHub Actions CI pipeline

---

## Hızlı Başlangıç

### Gereksinimler
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- PostgreSQL & Redis (veya Docker Compose)

### Kurulum

```bash
# Repoyu klonla
git clone https://github.com/<kullanici>/SAAP.git
cd SAAP

# Backend bağımlılıkları
dotnet restore

# Frontend bağımlılıkları
cd src/SAAP.Web && npm install && cd ../..

# Veritabanı servislerini başlat (Docker)
docker-compose up -d

# API'yi çalıştır
dotnet run --project src/SAAP.API

# Frontend'i çalıştır (ayrı terminal)
cd src/SAAP.Web && npm run dev
```

| Servis | Adres |
|--------|-------|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5181 |
| API Docs (Scalar) | http://localhost:5181/scalar/v1 |

---

## API Endpoint'leri

```
POST   /api/auth/register          → Kullanıcı kaydı
POST   /api/auth/login             → JWT token al
GET    /api/auth/me                → Profil bilgisi
PUT    /api/auth/profile           → Profil güncelle
PUT    /api/auth/avatar            → Avatar yükle

GET    /api/audit-logs             → Audit log listesi
GET    /api/audit-logs/{id}        → Tekil log kaydı

GET    /api/settings/security      → Güvenlik tercihleri
PUT    /api/settings/security      → Güvenlik tercihlerini güncelle

GET    /api/notifications          → Bildirimler
GET    /api/search?q=...           → Global arama
```

---

## Proje Yapısı

```
SAAP/
├── src/
│   ├── SAAP.Domain/           # Entity'ler, domain kuralları
│   ├── SAAP.Application/      # Servis arayüzleri, DTO'lar
│   ├── SAAP.Infrastructure/   # EF Core, Redis, token servisi
│   ├── SAAP.API/              # Controller'lar, middleware, DI
│   ├── SAAP.Web/              # React frontend
│   └── SAAP.UnitTests/        # Unit testler
├── docker-compose.yml
└── README.md
```

---

## Güvenlik Özellikleri

- **JWT tabanlı kimlik doğrulama** — Stateless token yönetimi
- **Rol tabanlı yetkilendirme** — Admin / User ayrımı
- **Audit logging middleware** — Her HTTP isteği IP, endpoint, süre ve durum kodu ile loglanır
- **Redis rate limiting** — Brute-force ve DDoS koruması
- **Kullanıcı güvenlik tercihleri** — 2FA, oturum kilidi, IP whitelist, audit bildirimleri
- **CORS politikası** — Yalnızca izin verilen origin'lerden erişim

---

## Geliştirici

**Elif Aşık**

- GitHub: [@elifasik25](https://github.com/elifasik25)
- E-posta: elifasik25@gmail.com

---

## Lisans

Bu proje açık kaynaklıdır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

<sub>SAAP Platform v1.0.0 · Antigravity UI · Clean Architecture · Full-Stack Security Console</sub>
