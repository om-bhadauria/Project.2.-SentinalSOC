-- Database Schema Init for SentinelSOC

CREATE TABLE IF NOT EXISTS scan_jobs (
    id UUID PRIMARY KEY,
    url VARCHAR(2048) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    verdict VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source_ip VARCHAR(100),
    target_user VARCHAR(100),
    system VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update 'updated_at' on scan_jobs
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_scan_jobs_modtime ON scan_jobs;
CREATE TRIGGER update_scan_jobs_modtime
BEFORE UPDATE ON scan_jobs
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();
