# وثيقة التصميم: مايو هب

## Overview

مايو هب هو دليل خدمات محلي مبني على أساس جغرافي لمدينة 15 مايو، يربط السكان بالخدمات التجارية والمجتمعية القريبة منهم. يُنمذج النظام المدينة كرسم بياني (Graph) من 36 مجاورة سكنية مع علاقات تجاور، مما يتيح حساب "دائرة المجاورة" التي تعرض الخدمات ذات الصلة لكل مقيم.

يخدم التطبيق ثلاثة أدوار:
- **المقيمون** — تصفح والبحث والتواصل مع الخدمات المحلية
- **مقدمو الخدمات** — تسجيل وإدارة ملفات المتاجر
- **المسؤولون** — إدارة المجاورات، الموافقة على المتاجر، إعداد الإعلانات

القرارات التقنية الرئيسية:
- **Supabase** كخلفية (مصادقة، قاعدة بيانات، تخزين ملفات، بيانات فورية)
- **نموذج تجاور قائم على الرسم البياني** لدوائر المجاورة (مخزن كجدول ربط)
- **مؤشرات الحالة المحسوبة** باستخدام مقارنة ساعات العمل + المنطقة الزمنية
- **إطلاق تدريجي** عبر علامة `is_active` على المجاورات تتحكم في جميع الاستعلامات

## Architecture

```mermaid
graph TB
    subgraph Client["تطبيق React SPA (Vite + TanStack Router)"]
        Pages[صفحات المسارات]
        Components[مكونات واجهة المستخدم]
        Hooks[Custom Hooks]
        Lib[وحدات المنطق البحت]
    end

    subgraph Supabase["خلفية Supabase"]
        Auth[خدمة المصادقة]
        DB[(PostgreSQL)]
        Storage[تخزين الملفات]
        RLS[أمان مستوى الصف]
        Edge[Edge Functions]
    end

    Pages --> Hooks
    Hooks --> Lib
    Hooks -->|@supabase/supabase-js| Auth
    Hooks -->|@supabase/supabase-js| DB
    Components --> Hooks
    Lib -->|حسابات بحتة| Lib
    Pages -->|رفع ملفات| Storage
    DB --> RLS
    Edge -->|مجدول| DB
```

### قرارات معمارية

| القرار | المبرر |
|--------|--------|
| تخزين التجاور في جدول ربط بقاعدة البيانات | يسمح بالتعديل من لوحة الإدارة بدون نشر كود جديد؛ يدعم الإطلاق التدريجي |
| حساب الحالة من جانب العميل مع احتياطي من الخادم | يقلل حمل الخادم؛ Edge Function تحدث الحالة للإشعارات |
| البحث محدود بدائرة المجاورة افتراضياً | متطلب أساسي لتجربة المستخدم؛ دالة Supabase RPC تتعامل مع الربط بكفاءة |
| واجهة عربية أولاً مع تخطيط RTL | الجمهور المستهدف ناطق بالعربية من سكان مدينة 15 مايو |
| ترتيب المميز عبر `is_premium` + `premium_started_at` | ترتيب بسيط: المميز أولاً (حسب تاريخ البدء)، ثم غير المميز (حسب الاسم) |

## Components and Interfaces

### هيكل المسارات

```
/                          → صفحة الهبوط / اختيار المجاورة (إذا لم تُحدد)
/hub                       → عرض الخدمات الرئيسي (دائرة المجاورة)
/hub/store/:id             → تفاصيل ملف المتجر
/hub/community             → دليل الخدمات المجتمعية
/hub/search                → نتائج البحث
/admin/hub                 → لوحة الإدارة (متاجر، مجاورات، إعلانات)
/admin/hub/approvals       → قائمة انتظار الموافقات
/admin/hub/neighborhoods   → إدارة المجاورات
/admin/hub/banners         → إدارة الإعلانات البانر
```

### المكونات الأساسية

```typescript
// اختيار المجاورة
interface NeighborhoodSelectorProps {
  neighborhoods: Neighborhood[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

// عرض الخدمات مع تصفية الدائرة
interface ServicesViewProps {
  circleNeighborhoods: Neighborhood[];
  activeFilter: string | null; // معرف المجاورة أو null لـ "الكل"
  onFilterChange: (id: string | null) => void;
}

// بطاقة المتجر في القائمة
interface StoreCardProps {
  store: StoreProfile;
  isPremium: boolean;
  statusIndicator: 'open' | 'closed';
}

// صفحة تفاصيل المتجر
interface StoreDetailProps {
  store: StoreProfile;
  workingHours: WorkingHours[];
  deliveryInfo: DeliveryInfo | null;
  specialOffers: SpecialOffer[];
}

// دوّار الإعلانات البانر
interface BannerCarouselProps {
  banners: BannerAd[];
  rotationIntervalMs: number; // 5000
}

// دليل الخدمات المجتمعية
interface CommunityDirectoryProps {
  services: CommunityService[];
  neighborhoodFilter: string | null;
  typeFilter: CommunityServiceType | null;
}

// محرك البحث
interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  categoryFilter: string | null;
  neighborhoodFilter: string | null;
  onCategoryChange: (cat: string | null) => void;
  onNeighborhoodChange: (id: string | null) => void;
}
```

### الـ Hooks المخصصة

```typescript
// حساب دائرة المجاورة
function useNeighborhoodCircle(primaryNeighborhoodId: string | null): {
  circle: Neighborhood[];
  isLoading: boolean;
}

// حساب حالة المتجر
function useStoreStatus(workingHours: WorkingHours[], manualOverride: StoreStatusOverride | null): {
  status: 'open' | 'closed';
  nextTransition: Date | null;
}

// البحث مع فلاتر مجمعة
function useServiceSearch(params: {
  query: string;
  circleIds: string[];
  categoryId: string | null;
  neighborhoodId: string | null;
}): {
  results: StoreProfile[];
  isLoading: boolean;
  isEmpty: boolean;
}

// إعلانات البانر
function useActiveBanners(): {
  banners: BannerAd[];
  hasActiveBanners: boolean;
}

// قائمة انتظار الموافقات
function useApprovalQueue(): {
  pending: PendingStore[];
  approve: (id: string) => Promise<void>;
  reject: (id: string, reason: string) => Promise<void>;
}
```

### وحدات المنطق البحت (`src/lib/mayu-hub/`)

```typescript
// src/lib/mayu-hub/neighborhood-circle.ts
export function computeNeighborhoodCircle(
  primaryId: string,
  adjacencyMap: Map<string, string[]>,
  activeNeighborhoods: Set<string>
): string[];

// src/lib/mayu-hub/store-status.ts
export function computeStoreStatus(
  workingHours: WorkingHours[],
  currentTime: Date,
  manualOverride: StoreStatusOverride | null
): 'open' | 'closed';

// src/lib/mayu-hub/search.ts
export function rankSearchResults(
  stores: StoreProfile[],
  query: string,
  primaryNeighborhoodId: string
): StoreProfile[];

export function filterStores(
  stores: StoreProfile[],
  filters: SearchFilters
): StoreProfile[];

// src/lib/mayu-hub/banner-rotation.ts
export function getActiveBanners(
  banners: BannerAd[],
  currentDate: Date
): BannerAd[];

// src/lib/mayu-hub/validation.ts
export function validateStoreProfile(input: StoreProfileInput): ValidationResult;
export function validateWhatsAppMessage(message: string): boolean;
```

## Data Models

### جداول Supabase

```sql
-- المجاورات مع دعم التجاور
CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,           -- الاسم بالعربي (مثل "المجاورة الأولى")
  number INTEGER NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 36),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- علاقات التجاور (ثنائية الاتجاه)
CREATE TABLE neighborhood_adjacency (
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id),
  adjacent_id UUID NOT NULL REFERENCES neighborhoods(id),
  PRIMARY KEY (neighborhood_id, adjacent_id),
  CHECK (neighborhood_id <> adjacent_id)
);

-- ملفات المتاجر
CREATE TABLE store_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id),
  name_ar TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT,
  whatsapp_message TEXT CHECK (char_length(whatsapp_message) <= 256),
  logo_url TEXT,
  storefront_photo_url TEXT,
  category_id UUID REFERENCES service_categories(id),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  premium_started_at TIMESTAMPTZ,
  premium_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'deactivated')),
  rejection_reason TEXT,
  delivers BOOLEAN NOT NULL DEFAULT false,
  delivery_cost_egp NUMERIC(10,2),
  delivery_duration_minutes INTEGER,
  manual_status_override TEXT CHECK (manual_status_override IN ('open', 'closed')),
  manual_status_override_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

```sql
-- ساعات العمل لكل يوم
CREATE TABLE store_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES store_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=الأحد
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (store_id, day_of_week)
);

-- مجاورات التوصيل (علاقة متعدد لمتعدد)
CREATE TABLE store_delivery_neighborhoods (
  store_id UUID NOT NULL REFERENCES store_profiles(id) ON DELETE CASCADE,
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id),
  PRIMARY KEY (store_id, neighborhood_id)
);

-- فئات الخدمات
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- العروض الخاصة (للمميزين فقط)
CREATE TABLE special_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES store_profiles(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  description_ar TEXT,
  image_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expires_at > starts_at),
  CHECK (expires_at <= starts_at + INTERVAL '30 days')
);

-- إعلانات البانر
CREATE TABLE banner_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('store', 'external')),
  target_store_id UUID REFERENCES store_profiles(id),
  target_url TEXT,
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at >= starts_at)
);

-- الخدمات المجتمعية/الحكومية (دليل ثابت)
CREATE TABLE community_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id),
  name_ar TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'school', 'post_office', 'youth_center', 'mosque', 'church',
    'hospital', 'police_station', 'civil_registry', 'gas_office', 'electricity_office'
  )),
  school_type TEXT CHECK (school_type IN ('government', 'experimental', 'private')),
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ملفات المقيمين (امتداد لـ auth.users)
CREATE TABLE resident_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  primary_neighborhood_id UUID REFERENCES neighborhoods(id),
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### أنواع TypeScript

```typescript
interface Neighborhood {
  id: string;
  nameAr: string;
  number: number;
  isActive: boolean;
}

interface StoreProfile {
  id: string;
  ownerId: string;
  neighborhoodId: string;
  nameAr: string;
  phone: string;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  logoUrl: string | null;
  storefrontPhotoUrl: string | null;
  categoryId: string | null;
  isPremium: boolean;
  premiumStartedAt: string | null;
  premiumExpiresAt: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'deactivated';
  rejectionReason: string | null;
  delivers: boolean;
  deliveryCostEgp: number | null;
  deliveryDurationMinutes: number | null;
  manualStatusOverride: 'open' | 'closed' | null;
  manualStatusOverrideUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

interface WorkingHours {
  id: string;
  storeId: string;
  dayOfWeek: number; // 0-6
  openTime: string;  // "HH:mm"
  closeTime: string; // "HH:mm"
  isClosed: boolean;
}

interface StoreStatusOverride {
  status: 'open' | 'closed';
  until: Date | null;
}

interface SearchFilters {
  query: string;
  circleNeighborhoodIds: string[];
  categoryId: string | null;
  neighborhoodId: string | null;
}

interface BannerAd {
  id: string;
  imageUrl: string;
  targetType: 'store' | 'external';
  targetStoreId: string | null;
  targetUrl: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  sortOrder: number;
}

interface CommunityService {
  id: string;
  neighborhoodId: string;
  nameAr: string;
  type: CommunityServiceType;
  schoolType: 'government' | 'experimental' | 'private' | null;
  address: string | null;
  phone: string | null;
}

type CommunityServiceType =
  | 'school' | 'post_office' | 'youth_center' | 'mosque' | 'church'
  | 'hospital' | 'police_station' | 'civil_registry' | 'gas_office'
  | 'electricity_office';

interface SpecialOffer {
  id: string;
  storeId: string;
  titleAr: string;
  descriptionAr: string | null;
  imageUrl: string | null;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

interface StoreProfileInput {
  nameAr: string;
  phone: string;
  neighborhoodId: string;
  workingHours: WorkingHoursInput[];
  whatsappNumber?: string;
  whatsappMessage?: string;
  logoFile?: File;
  storefrontPhotoFile?: File;
  categoryId?: string;
  delivers?: boolean;
  deliveryCostEgp?: number;
  deliveryDurationMinutes?: number;
  deliveryNeighborhoodIds?: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
```

## Correctness Properties

*الخاصية هي سلوك أو صفة يجب أن تظل صحيحة عبر جميع عمليات التنفيذ الصالحة للنظام — بمعنى آخر، هي تصريح رسمي حول ما يجب أن يفعله النظام. تعمل الخصائص كجسر بين المواصفات المقروءة بشرياً وضمانات الصحة القابلة للتحقق آلياً.*

### Property 1: حساب دائرة المجاورة يحترم التجاور والحالة النشطة

*لأي* خريطة تجاور صالحة ولأي مجاورة أساسية نشطة، يجب أن تحتوي دائرة المجاورة المحسوبة على المجاورة الأساسية بالضبط بالإضافة إلى جميع المجاورات المتاخمة المُعلَّمة كنشطة، ويجب ألا تحتوي أبداً على مجاورات غير نشطة أو مجاورات غير متاخمة.

**Validates: Requirements 2.2, 10.2, 10.4**

### Property 2: نتائج البحث مرتبة بالتطابق التام أولاً ثم الجزئي، بحد أقصى 20

*لأي* استعلام بحث غير فارغ (≥ حرفين) ولأي مجموعة متاجر ضمن دائرة المجاورة، يجب أن تضع النتائج المُرجعة المتاجر التي يتطابق اسمها تماماً مع الاستعلام قبل المتاجر ذات التطابق الجزئي فقط، ويجب ألا يتجاوز إجمالي النتائج 20.

**Validates: Requirements 3.1, 2.1**

### Property 3: الفلاتر المجمعة تستخدم منطق AND

*لأي* مجموعة متاجر ولأي تركيبة من الفلاتر النشطة (استعلام نصي، فئة، مجاورة)، يجب أن يستوفي كل متجر في النتائج المُصفاة جميع الفلاتر النشطة في آن واحد، ولا يجب استبعاد أي متجر يستوفي جميع الفلاتر من النتائج.

**Validates: Requirements 3.5, 3.2, 3.3, 2.4**

### Property 4: بناء رابط واتساب والتحقق من الرسالة

*لأي* رقم هاتف صالح ونص رسالة، يجب أن يحتوي رابط واتساب المُنشأ على رقم الهاتف بالتنسيق الصحيح. بالإضافة إلى ذلك، *لأي* نص رسالة يتجاوز 256 حرفاً، يجب أن يرفضه التحقق.

**Validates: Requirements 4.3**

### Property 5: التحقق من ملف المتجر يفرض الحقول المطلوبة

*لأي* مدخل ملف متجر، إذا كان أي من الحقول الإلزامية (الاسم، الهاتف، المجاورة، ساعات العمل) مفقوداً أو فارغاً، يجب أن يُرجع التحقق "غير صالح" مع خطأ لذلك الحقل. إذا كانت جميع الحقول الإلزامية موجودة وصالحة، يجب أن يُرجع التحقق "صالح".

**Validates: Requirements 4.7**

### Property 6: حساب حالة المتجر مع أولوية التجاوز اليدوي

*لأي* مجموعة ساعات عمل، ولأي وقت حالي، ولأي حالة تجاوز يدوي: إذا كان التجاوز اليدوي نشطاً (لم تنتهِ صلاحيته)، يجب أن تساوي الحالة المحسوبة قيمة التجاوز بغض النظر عن ساعات العمل. إذا لم يكن هناك تجاوز نشط، يجب أن تكون الحالة "مفتوح" إذا كان الوقت الحالي يقع ضمن ساعات العمل لليوم الحالي، و"مغلق" خلاف ذلك. إذا لم تُهيَّأ ساعات عمل، يجب أن تكون الحالة "مغلق".

**Validates: Requirements 5.2, 5.3, 5.5**

### Property 7: عرض الخدمة المجتمعية يحذف الحقول الفارغة

*لأي* سجل خدمة مجتمعية بأي تركيبة من الحقول الاختيارية الفارغة وغير الفارغة (العنوان، الهاتف)، يجب أن يتضمن المخرج المعروض فقط الحقول ذات القيم غير الفارغة، ويجب أن يتضمن دائماً اسم الخدمة والمجاورة.

**Validates: Requirements 6.3**

### Property 8: التصفية المجمعة للخدمات المجتمعية

*لأي* مجموعة خدمات مجتمعية ولأي تركيبة من فلتر المجاورة وفلتر النوع، يجب أن تتطابق كل خدمة في النتائج المُصفاة مع كل من المجاورة المحددة (إن وُجدت) والنوع المحدد (إن وُجد)، ولا يجب استبعاد أي خدمة تتطابق مع جميع الفلاتر النشطة.

**Validates: Requirements 6.5, 6.6, 6.8**

### Property 9: المتاجر المميزة تُرتب قبل غير المميزة

*لأي* قائمة متاجر معتمدة بحالات مميزة وغير مميزة مختلطة، بعد الترتيب، يجب أن يظهر كل متجر مميز قبل كل متجر غير مميز. بين المتاجر المميزة، تظهر أولاً تلك ذات تواريخ `premium_started_at` الأقدم.

**Validates: Requirements 7.2**

### Property 10: قيود العروض المميزة

*لأي* متجر مميز، يجب ألا يسمح النظام بأكثر من 5 عروض خاصة نشطة في وقت واحد. *لأي* عرض خاص، يجب ألا تتجاوز مدته (expires_at - starts_at) 30 يوماً.

**Validates: Requirements 7.3**

### Property 11: انتهاء الاشتراك المميز يُعيد للمستوى الأساسي

*لأي* متجر تاريخ `premium_expires_at` الخاص به في الماضي بالنسبة للوقت الحالي، يجب معاملة المتجر كغير مميز في الترتيب ويجب ألا تكون عروضه الخاصة مرئية للمقيمين.

**Validates: Requirements 7.5**

### Property 12: تصفية البانرات النشطة حسب التاريخ مع حد أقصى

*لأي* مجموعة إعلانات بانر ولأي تاريخ حالي، يجب أن تُرجع دالة `getActiveBanners` فقط البانرات التي يشمل نطاق تاريخها التاريخ الحالي (starts_at ≤ الحالي ≤ ends_at)، ويجب أن تُرجع 5 بانرات كحد أقصى مرتبة حسب sort_order.

**Validates: Requirements 8.1, 8.5**

### Property 13: التحقق من الحد الأدنى لطول سبب الرفض

*لأي* نص مُقدم كسبب رفض، إذا كان طوله أقل من 10 أحرف، يجب أن يرفضه التحقق. إذا كان طوله 10 أحرف أو أكثر، يجب أن يقبله التحقق.

**Validates: Requirements 9.5**

### Property 14: قائمة انتظار الموافقات مرتبة حسب تاريخ التقديم

*لأي* مجموعة طلبات متاجر معلقة، يجب أن تكون القائمة المعروضة مرتبة تصاعدياً حسب تاريخ التقديم (الأقدم أولاً).

**Validates: Requirements 9.6**

## Error Handling

### أخطاء جانب العميل

| السيناريو | المعالجة |
|-----------|----------|
| فشل الشبكة أثناء البحث | عرض النتائج المخزنة مؤقتاً (إن وُجدت) مع شريط "انقطع الاتصال"؛ إعادة المحاولة عند الاتصال |
| رفع صورة تتجاوز 5 ميجابايت | تحقق من جانب العميل قبل الرفع؛ عرض خطأ مضمن مع حجم الملف |
| تنسيق رقم هاتف غير صالح | تحقق Zod عند إرسال النموذج؛ عرض خطأ على مستوى الحقل |
| رفض Supabase RLS | التقاط 403، إعادة التوجيه لتسجيل الدخول أو عرض إشعار "تم رفض الإذن" |
| عدم تحميل بيانات المجاورات | عرض هيكل تحميل؛ إعادة المحاولة بتراجع أسي (3 محاولات) |

### أخطاء جانب الخادم

| السيناريو | المعالجة |
|-----------|----------|
| موافقة على متجر بدون سبب رفض | إرجاع 422 مع خطأ تحقق؛ لوحة الإدارة تعرض خطأ مضمن |
| اسم متجر مكرر في نفس المجاورة | إرجاع 409 تعارض؛ عرض اقتراح بالتواصل مع المسؤول |
| فشل رفع صورة البانر | إرجاع 500 مع اقتراح إعادة المحاولة؛ المسؤول يمكنه إعادة الرفع |
| عدم اتساق خريطة التجاور (اتجاه واحد) | مشغل قاعدة بيانات يضمن الإدراج ثنائي الاتجاه؛ واجهة الإدارة تحذر عند الحفظ |

### الحالات الحدية

| الحالة | السلوك |
|--------|--------|
| متجر بدون ساعات عمل | الحالة الافتراضية "مغلق" |
| مجاورة بدون جيران نشطين | الدائرة تحتوي فقط على المجاورة الأساسية |
| جميع المجاورات غير نشطة | التطبيق يعرض حالة "قريباً" |
| انتهاء المميز أثناء الجلسة | جلب البيانات التالي يعكس المستوى الأساسي؛ لا تغييرات أثناء العرض |
| دوران البانر مع بانر واحد | لا حركة دوران؛ عرض ثابت |
| رقم واتساب بدون رمز الدولة | التحقق يتطلب بادئة رمز الدولة (+20 لمصر) |

## Testing Strategy

### اختبارات الخصائص (Property-Based Tests) باستخدام fast-check

المشروع يستخدم بالفعل `fast-check` (الإصدار 4.8.0) مع Vitest. اختبارات الخصائص موجودة في `tests/properties/` وتُشغَّل عبر `npm run test:property` مع `FAST_CHECK_NUM_RUNS=200`.

كل اختبار خاصية سيقوم بـ:
- تشغيل 100 تكرار كحد أدنى (مُهيأ على 200 عبر متغير البيئة)
- الإشارة إلى خاصية وثيقة التصميم في تعليق وسم
- استخدام `fc.assert` مع `fc.property` للتكميم الشامل

**ملفات الاختبار:**
- `tests/properties/mayu-hub/neighborhood-circle.property.test.ts` — الخاصية 1
- `tests/properties/mayu-hub/search.property.test.ts` — الخاصيتان 2، 3
- `tests/properties/mayu-hub/store-status.property.test.ts` — الخاصية 6
- `tests/properties/mayu-hub/validation.property.test.ts` — الخصائص 4، 5، 13
- `tests/properties/mayu-hub/filtering.property.test.ts` — الخاصيتان 7، 8
- `tests/properties/mayu-hub/premium.property.test.ts` — الخصائص 9، 10، 11
- `tests/properties/mayu-hub/banners.property.test.ts` — الخاصية 12
- `tests/properties/mayu-hub/admin.property.test.ts` — الخاصية 14

**تنسيق الوسم:** `// Feature: mayu-hub, Property {N}: {title}`

### اختبارات الوحدة (Example-Based)

اختبارات قائمة على الأمثلة لسيناريوهات وحالات حدية محددة:
- تدفق التسجيل مع/بدون اختيار المجاورة
- عرض ملف المتجر بتركيبات حقول مختلفة
- سلوك دوّار البانر (بانر واحد، بدون بانرات)
- تجميع دليل الخدمات المجتمعية
- عرض علامة "مميز"
- إنشاء href لأزرار الاتصال والواتساب

### اختبارات التكامل

اختبارات تكامل مع Supabase (باستخدام مشروع اختبار أو Supabase محلي):
- تقديم متجر ← قائمة الانتظار ← الموافقة ← ظهور في البحث
- تفعيل مجاورة ← إعادة حساب الدائرة
- جدولة بانر ← انتهاء تلقائي
- اشتراك مميز ← إنشاء عرض ← انتهاء الصلاحية

### اختبارات E2E (Playwright)

تدفقات شاملة من البداية للنهاية:
- تسجيل مقيم مع اختيار المجاورة
- البحث وتصفية الخدمات
- عرض ملف المتجر والنقر على أزرار واتساب/الهاتف
- موافقة/رفض المسؤول لطلب متجر
- إدارة المسؤول للبانرات والمجاورات
