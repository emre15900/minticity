# Minticity – Mini User Dashboard

Next.js 14 (App Router) + TailwindCSS ile JSONPlaceholder üzerinde kullanıcı yönetimi demo uygulaması.

## Özellikler
- Kullanıcı listeleme, detay görüntüleme, sahte POST/PUT/DELETE ile ekleme/güncelleme/silme
- Arama & sayfalama, yüklenme ve hata durumları
- Yerel depolama ile yeni/özelleştirilmiş kullanıcıların ve silinen kayıtların korunması
- Tekrarlanan UI için component yapısı (`components/`)

## Başlarken
```bash
npm install
npm run dev
# http://localhost:3000
```

## Yapı
- `app/` – App Router sayfaları (`/`, `/new`, `/users/[id]`)
- `components/` – Form ve liste bileşenleri
- `lib/` – API çağrıları ve yerel depolama yardımcıları
