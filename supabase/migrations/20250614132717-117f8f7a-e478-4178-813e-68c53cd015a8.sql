
-- This enables real-time updates on the cryptocurrencies table
-- First, ensure the table has a replica identity to capture changes
ALTER TABLE public.cryptocurrencies REPLICA IDENTITY FULL;

-- Then, add the table to the Supabase real-time publication
DO $$
DECLARE
  publication_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) INTO publication_exists;

  IF publication_exists THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cryptocurrencies;
  ELSE
    -- This case should not happen in a standard Supabase project
    RAISE NOTICE 'Publication supabase_realtime does not exist. Real-time updates for cryptocurrencies will not be enabled.';
  END IF;
END;
$$;
