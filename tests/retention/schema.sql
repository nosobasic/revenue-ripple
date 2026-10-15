CREATE SCHEMA auth;GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 CREATE TABLE users(id uuid PRIMARY KEY,role text,plan text,has_paid boolean);
 CREATE TABLE rr_subscriptions(user_id uuid,plan text,status text,paid_until timestamptz,cancel_at_period_end boolean);
 CREATE TABLE rr_plan_rules(plan text,enabled boolean);
 INSERT INTO rr_plan_rules VALUES('free',true),('premium',true),('growth',true);
 CREATE TABLE founders_annual_members(user_id uuid,is_active boolean,amount_paid numeric,expires_at timestamptz);
 CREATE TABLE ve_content_items(id int,content_type text,level text,published_at timestamptz,full_body text);
 ALTER TABLE ve_content_items ENABLE ROW LEVEL SECURITY;
 CREATE VIEW content_items AS SELECT * FROM ve_content_items;
 GRANT ALL ON ve_content_items TO anon,authenticated,service_role;
 GRANT SELECT ON content_items TO anon,authenticated,service_role;
 CREATE TABLE user_progress(id int);GRANT SELECT ON user_progress TO authenticated;
 INSERT INTO user_progress VALUES(1);
 INSERT INTO ve_content_items VALUES
 (1,'playbook','member',now()-interval '1 day','fixture'),
 (2,'premium_briefing','member',now()-interval '1 day','fixture'),
 (3,'playbook','member',NULL,'draft'),(4,'premium_briefing','member',now()+interval '1 day','future'),
 (5,'course','member',now()-interval '1 day','other'),(6,'playbook','other',now()-interval '1 day','other');