-- Mayu Hub Database Schema
-- Migration: 001_mayu_hub_schema
-- Description: Creates all tables for the Mayu Hub neighborhood services directory

-- ============================================
-- المجاورات (Neighborhoods)
-- ============================================
CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  number INTEGER NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 36),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_neighborhoods_active ON neighborhoods(is_active);
CREATE INDEX idx_neighborhoods_number ON neighborhoods(number);

-- ============================================
-- علاقات التجاور (Neighborhood Adjacency)
-- ============================================
CREATE TABLE neighborhood_adjacency (
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  adjacent_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  PRIMARY KEY (neighborhood_id, adjacent_id),
  CHECK (neighborhood_id <> adjacent_id)
);

CREATE INDEX idx_adjacency_neighborhood ON neighborhood_adjacency(neighborhood_id);
CREATE INDEX idx_adjacency_adjacent ON neighborhood_adjacency(adjacent_id);

-- Trigger: Ensure bidirectional adjacency
CREATE OR REPLACE FUNCTION ensure_bidirectional_adjacency()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO neighborhood_adjacency (neighborhood_id, adjacent_id)
  VALUES (NEW.adjacent_id, NEW.neighborhood_id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bidirectional_adjacency
AFTER INSERT ON neighborhood_adjacency
FOR EACH ROW
EXECUTE FUNCTION ensure_bidirectional_adjacency();

-- ============================================
-- فئات الخدمات (Service Categories)
-- ============================================
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_active ON service_categories(is_active, sort_order);

-- ============================================
-- ملفات المتاجر (Store Profiles)
-- ============================================
CREATE TABLE store_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE INDEX idx_stores_neighborhood ON store_profiles(neighborhood_id);
CREATE INDEX idx_stores_status ON store_profiles(status);
CREATE INDEX idx_stores_category ON store_profiles(category_id);
CREATE INDEX idx_stores_premium ON store_profiles(is_premium, premium_started_at);
CREATE INDEX idx_stores_owner ON store_profiles(owner_id);
CREATE INDEX idx_stores_name ON store_profiles(name_ar);

-- ============================================
-- ساعات العمل (Store Working Hours)
-- ============================================
CREATE TABLE store_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES store_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (store_id, day_of_week)
);

CREATE INDEX idx_working_hours_store ON store_working_hours(store_id);

-- ============================================
-- مجاورات التوصيل (Store Delivery Neighborhoods)
-- ============================================
CREATE TABLE store_delivery_neighborhoods (
  store_id UUID NOT NULL REFERENCES store_profiles(id) ON DELETE CASCADE,
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id),
  PRIMARY KEY (store_id, neighborhood_id)
);

-- ============================================
-- العروض الخاصة (Special Offers)
-- ============================================
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

CREATE INDEX idx_offers_store ON special_offers(store_id);
CREATE INDEX idx_offers_active ON special_offers(is_active, expires_at);

-- ============================================
-- إعلانات البانر (Banner Ads)
-- ============================================
CREATE TABLE banner_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('store', 'external')),
  target_store_id UUID REFERENCES store_profiles(id) ON DELETE SET NULL,
  target_url TEXT,
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at >= starts_at)
);

CREATE INDEX idx_banners_active ON banner_ads(is_active, starts_at, ends_at);

-- ============================================
-- الخدمات المجتمعية (Community Services)
-- ============================================
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

CREATE INDEX idx_community_neighborhood ON community_services(neighborhood_id);
CREATE INDEX idx_community_type ON community_services(type);

-- ============================================
-- ملفات المقيمين (Resident Profiles)
-- ============================================
CREATE TABLE resident_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_neighborhood_id UUID REFERENCES neighborhoods(id),
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_residents_neighborhood ON resident_profiles(primary_neighborhood_id);

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_neighborhoods_updated_at
  BEFORE UPDATE ON neighborhoods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_store_profiles_updated_at
  BEFORE UPDATE ON store_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_community_services_updated_at
  BEFORE UPDATE ON community_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_resident_profiles_updated_at
  BEFORE UPDATE ON resident_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RPC: Get neighborhood circle
-- ============================================
CREATE OR REPLACE FUNCTION get_neighborhood_circle(primary_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
  -- Return primary neighborhood
  RETURN NEXT primary_id;
  
  -- Return active adjacent neighborhoods
  RETURN QUERY
    SELECT na.adjacent_id
    FROM neighborhood_adjacency na
    JOIN neighborhoods n ON n.id = na.adjacent_id
    WHERE na.neighborhood_id = primary_id
      AND n.is_active = true;
END;
$$ LANGUAGE plpgsql STABLE;
