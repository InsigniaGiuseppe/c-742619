
-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run daily lending interest payments at 9:00 AM
SELECT cron.schedule(
  'daily-lending-interest-payout',
  '0 9 * * *', -- Run at 9:00 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://murvbwhegsauxlkgzcvo.supabase.co/functions/v1/daily-lending-interest',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cnZid2hlZ3NhdXhsa2d6Y3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTAwODIsImV4cCI6MjA2MjI4NjA4Mn0.7QLmsi609pt9YVa9lG48NFU0wFY48McBSYc4BCaQu2I"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
