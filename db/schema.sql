CREATE TABLE IF NOT EXISTS membership_users (
  id UUID PRIMARY KEY,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  auth_account_reference TEXT NOT NULL UNIQUE,
  official_membership_number TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE membership_users ADD COLUMN IF NOT EXISTS official_membership_number TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS membership_users_official_number_idx ON membership_users (official_membership_number) WHERE official_membership_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS membership_users_email_lower_idx ON membership_users (LOWER(email));

CREATE TABLE IF NOT EXISTS membership_applications (
  id UUID PRIMARY KEY,
  application_reference TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES membership_users(id) ON DELETE CASCADE,
  membership_category TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality TEXT NOT NULL,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  gender TEXT,
  residential_location TEXT,
  identification_type TEXT NOT NULL DEFAULT 'nida',
  identification_number_masked TEXT,
  identification_number_hash TEXT,
  identification_details_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  identification_reason TEXT,
  registration_route TEXT NOT NULL DEFAULT 'staff-guidance',
  membership_status TEXT NOT NULL DEFAULT 'INACTIVE' CHECK (membership_status IN ('INACTIVE', 'PENDING_APPROVAL', 'ACTIVE')),
  application_status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (application_status IN ('Pending Review', 'Under Review', 'More Information Required', 'Reviewed', 'APPROVED', 'REJECTED')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS identification_type TEXT NOT NULL DEFAULT 'nida';
ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS identification_number_masked TEXT;
ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS identification_number_hash TEXT;
ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS identification_details_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS identification_reason TEXT;
ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS registration_route TEXT NOT NULL DEFAULT 'staff-guidance';
ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS membership_status TEXT NOT NULL DEFAULT 'INACTIVE';
UPDATE membership_applications SET application_status = 'Pending Review' WHERE application_status = 'PAYMENT_REQUIRED';
ALTER TABLE membership_applications ALTER COLUMN application_status SET DEFAULT 'Pending Review';
ALTER TABLE membership_applications DROP CONSTRAINT IF EXISTS membership_applications_application_status_check;
ALTER TABLE membership_applications ADD CONSTRAINT membership_applications_application_status_check CHECK (application_status IN ('Pending Review', 'Under Review', 'More Information Required', 'Reviewed', 'APPROVED', 'REJECTED'));

CREATE TABLE IF NOT EXISTS membership_setup_requests (
  id UUID PRIMARY KEY,
  official_membership_number TEXT NOT NULL,
  contact_value TEXT,
  status TEXT NOT NULL DEFAULT 'AWAITING_STAFF_VERIFICATION' CHECK (status IN ('AWAITING_STAFF_VERIFICATION', 'VERIFIED', 'REJECTED', 'NEEDS_INFORMATION')),
  request_reference TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS membership_setup_requests_number_idx ON membership_setup_requests (official_membership_number);

-- Authorized membership records are populated by the club's approved source or
-- import. Public registration requests never create rows in this table.
CREATE TABLE IF NOT EXISTS authorized_membership_records (
  id UUID PRIMARY KEY,
  membership_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  source_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS authorized_membership_records_status_idx ON authorized_membership_records (membership_number, status);

CREATE TABLE IF NOT EXISTS membership_otp_challenges (
  id UUID PRIMARY KEY,
  official_membership_number TEXT NOT NULL,
  target_email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS membership_otp_challenges_number_created_idx ON membership_otp_challenges (official_membership_number, created_at DESC);
CREATE INDEX IF NOT EXISTS membership_otp_challenges_expiry_idx ON membership_otp_challenges (expires_at);

CREATE TABLE IF NOT EXISTS membership_setup_tokens (
  id UUID PRIMARY KEY,
  official_membership_number TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS membership_setup_tokens_number_idx ON membership_setup_tokens (official_membership_number, expires_at);

CREATE TABLE IF NOT EXISTS member_service_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES membership_users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  request_reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'NEEDS_INFORMATION', 'RESOLVED', 'CLOSED')),
  staff_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membership_notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES membership_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS membership_audit_logs (
  id UUID PRIMARY KEY,
  actor_user_id UUID REFERENCES membership_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS membership_applications_user_idx ON membership_applications (user_id);
CREATE INDEX IF NOT EXISTS membership_applications_status_idx ON membership_applications (application_status);

CREATE TABLE IF NOT EXISTS fixture_teams (
  id UUID PRIMARY KEY,
  team_category TEXT NOT NULL CHECK (team_category IN ('MEN', 'WOMEN', 'UNDER_20')),
  team_name TEXT NOT NULL,
  crest_url TEXT,
  is_yanga BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_category, team_name)
);

CREATE INDEX IF NOT EXISTS fixture_teams_category_idx ON fixture_teams (team_category);

CREATE TABLE IF NOT EXISTS fixtures (
  id UUID PRIMARY KEY,
  team_category TEXT NOT NULL DEFAULT 'MEN' CHECK (team_category IN ('MEN', 'WOMEN', 'UNDER_20')),
  season TEXT NOT NULL DEFAULT '2026/27',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  club_side TEXT NOT NULL DEFAULT 'HOME' CHECK (club_side IN ('HOME', 'AWAY')),
  competition TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_crest_url TEXT,
  away_crest_url TEXT,
  kickoff_at TIMESTAMPTZ NOT NULL,
  kickoff_time_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  venue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'POSTPONED', 'CANCELLED', 'COMPLETED')),
  home_score INTEGER,
  away_score INTEGER,
  official_ticket_url TEXT,
  official_details_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (home_team <> away_team),
  CHECK ((status = 'COMPLETED' AND home_score IS NOT NULL AND away_score IS NOT NULL) OR (status <> 'COMPLETED' AND home_score IS NULL AND away_score IS NULL)),
  CHECK (home_score IS NULL OR home_score >= 0),
  CHECK (away_score IS NULL OR away_score >= 0)
);

ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS team_category TEXT NOT NULL DEFAULT 'MEN';
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS season TEXT NOT NULL DEFAULT '2026/27';
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS club_side TEXT NOT NULL DEFAULT 'HOME';
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS kickoff_time_confirmed BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE fixtures DROP CONSTRAINT IF EXISTS fixtures_team_category_check;
ALTER TABLE fixtures ADD CONSTRAINT fixtures_team_category_check CHECK (team_category IN ('MEN', 'WOMEN', 'UNDER_20'));
ALTER TABLE fixtures DROP CONSTRAINT IF EXISTS fixtures_club_side_check;
ALTER TABLE fixtures ADD CONSTRAINT fixtures_club_side_check CHECK (club_side IN ('HOME', 'AWAY'));

CREATE INDEX IF NOT EXISTS fixtures_kickoff_idx ON fixtures (kickoff_at);
CREATE INDEX IF NOT EXISTS fixtures_status_idx ON fixtures (status);
CREATE INDEX IF NOT EXISTS fixtures_competition_idx ON fixtures (competition);
CREATE INDEX IF NOT EXISTS fixtures_team_category_idx ON fixtures (team_category);
CREATE INDEX IF NOT EXISTS fixtures_season_idx ON fixtures (season);
CREATE INDEX IF NOT EXISTS fixtures_published_idx ON fixtures (is_published);

CREATE TABLE IF NOT EXISTS fixture_standings (
  id UUID PRIMARY KEY,
  team_category TEXT NOT NULL DEFAULT 'MEN' CHECK (team_category IN ('MEN', 'WOMEN', 'UNDER_20')),
  season TEXT NOT NULL DEFAULT '2026/27',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  competition TEXT NOT NULL,
  team_name TEXT NOT NULL,
  crest_url TEXT,
  position INTEGER NOT NULL CHECK (position > 0),
  played INTEGER NOT NULL DEFAULT 0 CHECK (played >= 0),
  won INTEGER NOT NULL DEFAULT 0 CHECK (won >= 0),
  drawn INTEGER NOT NULL DEFAULT 0 CHECK (drawn >= 0),
  lost INTEGER NOT NULL DEFAULT 0 CHECK (lost >= 0),
  goals_for INTEGER NOT NULL DEFAULT 0 CHECK (goals_for >= 0),
  goals_against INTEGER NOT NULL DEFAULT 0 CHECK (goals_against >= 0),
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fixture_standings ADD COLUMN IF NOT EXISTS team_category TEXT NOT NULL DEFAULT 'MEN';
ALTER TABLE fixture_standings ADD COLUMN IF NOT EXISTS season TEXT NOT NULL DEFAULT '2026/27';
ALTER TABLE fixture_standings ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE fixture_standings DROP CONSTRAINT IF EXISTS fixture_standings_team_category_check;
ALTER TABLE fixture_standings ADD CONSTRAINT fixture_standings_team_category_check CHECK (team_category IN ('MEN', 'WOMEN', 'UNDER_20'));

DROP INDEX IF EXISTS fixture_standings_competition_team_idx;
CREATE UNIQUE INDEX IF NOT EXISTS fixture_standings_competition_team_idx ON fixture_standings (team_category, season, competition, team_name);
CREATE INDEX IF NOT EXISTS fixture_standings_team_category_idx ON fixture_standings (team_category, season);

-- Premium Yanga Store catalogue. Products remain unpublished until an authorized
-- administrator has confirmed the product, price, stock and approved imagery.
CREATE TABLE IF NOT EXISTS store_products (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('HOME_JERSEYS', 'AWAY_JERSEYS', 'THIRD_JERSEYS', 'TRAINING_WEAR', 'LIFESTYLE_CLOTHING', 'KIDS_COLLECTION', 'CAPS_ACCESSORIES', 'OTHER_MERCHANDISE')),
  price_tzs NUMERIC(12, 2) NOT NULL CHECK (price_tzs >= 0),
  promotional_price_tzs NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'TZS' CHECK (currency = 'TZS'),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  sizes TEXT[] NOT NULL DEFAULT '{}',
  colors TEXT[] NOT NULL DEFAULT '{}',
  customization_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  size_guide_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (promotional_price_tzs IS NULL OR (promotional_price_tzs >= 0 AND promotional_price_tzs <= price_tzs))
);

CREATE TABLE IF NOT EXISTS store_product_images (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_product_variants (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  size TEXT,
  color TEXT,
  sku TEXT,
  stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_orders (
  id UUID PRIMARY KEY,
  order_reference TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  fulfillment_option TEXT NOT NULL CHECK (fulfillment_option IN ('DELIVERY', 'PICKUP')),
  delivery_address TEXT,
  status TEXT NOT NULL DEFAULT 'ENQUIRY' CHECK (status IN ('ENQUIRY', 'CONTACTED', 'CONFIRMED', 'FULFILLED', 'CANCELLED')),
  subtotal_tzs NUMERIC(12, 2) NOT NULL CHECK (subtotal_tzs >= 0),
  currency TEXT NOT NULL DEFAULT 'TZS' CHECK (currency = 'TZS'),
  payment_status TEXT NOT NULL DEFAULT 'NOT_ENABLED' CHECK (payment_status = 'NOT_ENABLED'),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES store_products(id),
  product_name_snapshot TEXT NOT NULL,
  unit_price_tzs NUMERIC(12, 2) NOT NULL CHECK (unit_price_tzs >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  size TEXT,
  color TEXT
);

CREATE INDEX IF NOT EXISTS store_products_published_idx ON store_products (is_published, is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS store_products_category_idx ON store_products (category, is_published);
CREATE INDEX IF NOT EXISTS store_product_images_product_idx ON store_product_images (product_id, sort_order);
CREATE INDEX IF NOT EXISTS store_product_variants_product_idx ON store_product_variants (product_id, is_active);
CREATE INDEX IF NOT EXISTS store_orders_status_idx ON store_orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS store_order_items_order_idx ON store_order_items (order_id);
