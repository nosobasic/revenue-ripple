-- Create view to make ve_content_items accessible via PostgREST
-- This allows the API to query playbooks without needing RPC functions

-- Create a view in public schema that points to ve_content_items
CREATE OR REPLACE VIEW public.content_items AS
SELECT 
    id,
    insight_id,
    content_type,
    level,
    title,
    short_description,
    full_body,
    url_slug,
    tags,
    created_at,
    published_at
FROM ve_content_items;

-- Grant access to authenticated users
GRANT SELECT ON public.content_items TO authenticated;

-- Add index on the view if needed (PostgreSQL doesn't support indexes on views directly,
-- but we can create an index on the underlying table if performance is an issue)
-- The existing indexes on value_engine.content_items should be sufficient
