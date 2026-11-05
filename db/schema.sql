CREATE TABLE IF NOT EXISTS membership_users (
  id UUID PRIMARY KEY,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  auth_account_reference TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  selected_bank TEXT NOT NULL CHECK (selected_bank IN ('crdb', 'nbc')),
  application_status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (application_status IN ('Pending Review', 'Under Review', 'More Information Required', 'Reviewed')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS membership_applications_user_idx ON membership_applications (user_id);
CREATE INDEX IF NOT EXISTS membership_applications_status_idx ON membership_applications (application_status);
