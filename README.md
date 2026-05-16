# 🏘️ مايو هب - Mayu Hub

دليل خدمات مدينة 15 مايو — تطبيق يربط السكان بالخدمات التجارية والمجتمعية القريبة منهم.

## 🚀 التشغيل المحلي

```bash
# تثبيت المكتبات
npm install

# تشغيل السيرفر
npm run dev

# تشغيل الاختبارات
npm test

# بناء للإنتاج
npm run build
```

## ⚙️ إعداد Supabase

1. أنشئ مشروع جديد على [supabase.com](https://supabase.com)
2. شغل الـ migration في `supabase/migrations/001_mayu_hub_schema.sql`
3. انسخ `.env.example` إلى `.env` وضع الـ credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🌐 النشر (Deploy)

### Vercel (مُوصى به)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# ارفع مجلد dist/
```

## 📱 PWA

التطبيق يدعم التثبيت كتطبيق على الموبايل:
- افتح التطبيق في Chrome
- اضغط "Add to Home Screen"

## 🏗️ هيكل المشروع

```
src/
├── components/mayu-hub/     # مكونات الواجهة
│   ├── admin/               # لوحة الإدارة
│   ├── ServicesView.tsx      # عرض الخدمات
│   ├── StoreCard.tsx         # بطاقة المتجر
│   ├── EmergencyView.tsx     # قسم الطوارئ
│   └── ...
├── lib/mayu-hub/            # المنطق البحت
│   ├── neighborhood-circle.ts
│   ├── store-status.ts
│   ├── search.ts
│   ├── validation.ts
│   └── ...
├── hooks/mayu-hub/          # React Hooks
└── App.tsx                  # التطبيق الرئيسي
```

## 🧪 الاختبارات

```bash
# كل الاختبارات
npm test

# Property-based tests فقط
npm run test:property
```

32 property-based test تغطي:
- حساب دائرة المجاورة
- ترتيب نتائج البحث
- حالة المتجر (مفتوح/مغلق)
- التحقق من البيانات
- فلترة الخدمات المجتمعية
- منطق الاشتراك المميز
- فلترة البانرات
