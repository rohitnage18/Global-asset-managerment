-- Database schema for GFHS Aviation GSE Management System
-- Run this script on AWS RDS PostgreSQL

-- Equipment table (Commissioning)
CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  gse_number VARCHAR(50) UNIQUE NOT NULL,
  station VARCHAR(100) NOT NULL,
  gse_name VARCHAR(200) NOT NULL,
  gse_category VARCHAR(100),
  sl_number VARCHAR(100),
  date_of_purchase DATE,
  invoice_no VARCHAR(100),
  unit_received_date DATE,
  date_of_commission DATE,
  date_of_ops DATE,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Running table
CREATE TABLE IF NOT EXISTS daily_running (
  id SERIAL PRIMARY KEY,
  gse_number VARCHAR(50) REFERENCES equipment(gse_number) ON DELETE CASCADE,
  date DATE NOT NULL,
  opening_hours DECIMAL(10,2),
  closing_hours DECIMAL(10,2),
  used_hours DECIMAL(10,2),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(gse_number, date)
);

-- Fuel Received table
CREATE TABLE IF NOT EXISTS fuel_received (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  station VARCHAR(100) NOT NULL,
  date_of_purchase DATE,
  invoice_no VARCHAR(100),
  received_petrol DECIMAL(10,2) DEFAULT 0,
  received_diesel DECIMAL(10,2) DEFAULT 0,
  per_litre_petrol_cost DECIMAL(10,2) DEFAULT 0,
  per_litre_diesel_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fuel Consumption table
CREATE TABLE IF NOT EXISTS fuel_consumption (
  id SERIAL PRIMARY KEY,
  gse_number VARCHAR(50) REFERENCES equipment(gse_number) ON DELETE CASCADE,
  date DATE NOT NULL,
  opening_hours DECIMAL(10,2),
  closing_hours DECIMAL(10,2),
  used_hours DECIMAL(10,2),
  fuel_consumption_avg DECIMAL(10,2),
  top_up_diesel DECIMAL(10,2) DEFAULT 0,
  top_up_petrol DECIMAL(10,2) DEFAULT 0,
  per_litre_petrol_cost DECIMAL(10,2) DEFAULT 0,
  per_litre_diesel_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(12,2) DEFAULT 0,
  balance_fuel DECIMAL(10,2),
  work_done_by VARCHAR(200),
  supervised_by VARCHAR(200),
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Monitoring table
CREATE TABLE IF NOT EXISTS service_monitoring (
  id SERIAL PRIMARY KEY,
  gse_number VARCHAR(50) REFERENCES equipment(gse_number) ON DELETE CASCADE,
  service_type_done VARCHAR(100),
  service_type_due VARCHAR(100),
  date_done DATE,
  date_due DATE,
  date_current DATE,
  date_pending_days INTEGER,
  hrs_done DECIMAL(10,2),
  hrs_due DECIMAL(10,2),
  hrs_current DECIMAL(10,2),
  hrs_pending DECIMAL(10,2),
  kms_done DECIMAL(10,2),
  kms_due DECIMAL(10,2),
  kms_current DECIMAL(10,2),
  kms_pending DECIMAL(10,2),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Serviceability Report table
CREATE TABLE IF NOT EXISTS serviceability_report (
  id SERIAL PRIMARY KEY,
  gse_number VARCHAR(50) REFERENCES equipment(gse_number) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(50),
  grounding_reason TEXT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GSV RTO Insurance table
CREATE TABLE IF NOT EXISTS gsv_rto_insurance (
  id SERIAL PRIMARY KEY,
  gse_number VARCHAR(50) REFERENCES equipment(gse_number) ON DELETE CASCADE,
  owner VARCHAR(200),
  department VARCHAR(200),
  asset_code VARCHAR(100),
  asset_type VARCHAR(100),
  asset_description TEXT,
  registration_no VARCHAR(100),
  fuel_type VARCHAR(50),
  chassis_no VARCHAR(100),
  engine_no VARCHAR(100),
  mfy VARCHAR(10),
  registration_category VARCHAR(100),
  seating INTEGER,
  insurance_validity_od DATE,
  status VARCHAR(50),
  policy_no VARCHAR(100),
  fc DATE,
  road_tax VARCHAR(100),
  road_permit VARCHAR(100),
  avp VARCHAR(100),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Worksheet table
CREATE TABLE IF NOT EXISTS daily_worksheet (
  id SERIAL PRIMARY KEY,
  gse_number VARCHAR(50) REFERENCES equipment(gse_number) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME,
  hours DECIMAL(10,2),
  kms DECIMAL(10,2),
  sang_details TEXT,
  sang_rectification_details TEXT,
  spares_used TEXT,
  quantity INTEGER,
  exp_sour VARCHAR(200),
  per_piece_cost DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  job_done_by VARCHAR(200),
  sup_by VARCHAR(200),
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  station VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  cognito_sub VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_equipment_station ON equipment(station);
CREATE INDEX idx_equipment_category ON equipment(gse_category);
CREATE INDEX idx_daily_running_date ON daily_running(date);
CREATE INDEX idx_fuel_consumption_date ON fuel_consumption(date);
CREATE INDEX idx_service_monitoring_gse ON service_monitoring(gse_number);
CREATE INDEX idx_gsv_insurance_validity ON gsv_rto_insurance(insurance_validity_od);
CREATE INDEX idx_gsv_fc ON gsv_rto_insurance(fc);
CREATE INDEX idx_users_station ON users(station);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
