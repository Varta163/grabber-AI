-- Run this once to create the database and user
-- Connect as postgres superuser first

CREATE DATABASE grabber_ai;
CREATE USER grabber_user WITH ENCRYPTED PASSWORD 'grabber_pass';
GRANT ALL PRIVILEGES ON DATABASE grabber_ai TO grabber_user;

-- Connect to grabber_ai and run:
GRANT ALL ON SCHEMA public TO grabber_user;
