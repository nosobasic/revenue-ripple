CREATE TABLE public.users(id uuid PRIMARY KEY,role text,plan text,has_paid boolean);
CREATE TABLE public.community_posts(id int,upvotes int);
CREATE TABLE public.community_replies(id int,upvotes int);
CREATE TABLE public.founders_annual_members(spot_number int,purchased_at timestamptz,expires_at timestamptz,timer_started_at timestamptz,updated_at timestamptz);
GRANT USAGE ON SCHEMA public TO PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon,authenticated,service_role;
CREATE TABLE public.rr_retention_catalog (
 account_id text NOT NULL, price_id text NOT NULL, product_id text NOT NULL,
 PRIMARY KEY(account_id,price_id,product_id),
 amount integer NOT NULL CHECK(amount=4700), currency text NOT NULL CHECK(currency='usd'),
 interval_unit text NOT NULL CHECK(interval_unit='month'), interval_count integer NOT NULL CHECK(interval_count=1)
);
CREATE TABLE public.rr_retention_bindings (
 account_id text NOT NULL, subscription_id text NOT NULL,
 user_id uuid NOT NULL REFERENCES public.users(id), customer_id text NOT NULL,
 price_id text NOT NULL, product_id text NOT NULL,
 PRIMARY KEY(account_id,subscription_id),
 UNIQUE(account_id,subscription_id,user_id,customer_id,price_id,product_id),
 FOREIGN KEY(account_id,price_id,product_id) REFERENCES public.rr_retention_catalog
);
CREATE TABLE public.rr_retention_evidence (
 account_id text NOT NULL, subscription_id text NOT NULL,
 user_id uuid NOT NULL, customer_id text NOT NULL, price_id text NOT NULL, product_id text NOT NULL,
 invoice_id text NOT NULL, charge_id text NOT NULL CHECK(length(charge_id)>0),
 payment_intent_id text NOT NULL CHECK(length(payment_intent_id)>0),
 amount_paid integer NOT NULL CHECK(amount_paid=4700), currency text NOT NULL CHECK(currency='usd'),
 period_start timestamptz NOT NULL, period_end timestamptz NOT NULL,
 verified_at timestamptz NOT NULL,
 provider_state text NOT NULL CHECK(provider_state IN ('active','canceled','past_due','unpaid')),
 PRIMARY KEY(account_id,invoice_id),
 UNIQUE(account_id,charge_id), UNIQUE(account_id,payment_intent_id),
 CHECK(period_end>period_start),
 FOREIGN KEY(account_id,subscription_id,user_id,customer_id,price_id,product_id)
 REFERENCES public.rr_retention_bindings(account_id,subscription_id,user_id,customer_id,price_id,product_id)
);
CREATE TABLE public.rr_retention_review_holds (
 user_id uuid NOT NULL REFERENCES public.users(id), reason text NOT NULL,
 evidence_ref text NOT NULL CHECK(length(evidence_ref)>0),
 PRIMARY KEY(user_id,reason)
);
DO $acl$ DECLARE n text; BEGIN
 FOREACH n IN ARRAY ARRAY['rr_retention_catalog','rr_retention_bindings','rr_retention_evidence',
 'rr_retention_review_holds'] LOOP
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',n);
 EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated,service_role',n);
 END LOOP;
END $acl$;

CREATE OR REPLACE FUNCTION public.assign_founder_spot_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Assign spot number sequentially (1-20 for marketing)
    SELECT COALESCE(MAX(spot_number), 0) + 1 INTO NEW.spot_number
    FROM founders_annual_members
    WHERE spot_number IS NOT NULL;
    
    -- Calculate expiry (1 year from purchase)
    NEW.expires_at := NEW.purchased_at + INTERVAL '1 year';
    
    -- Calculate timer expiry (3 days from timer start)
    IF NEW.timer_started_at IS NOT NULL THEN
        NEW.expires_at := NEW.purchased_at + INTERVAL '1 year';
    END IF;
    
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_agent_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_post_upvotes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts 
        SET upvotes = upvotes + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts 
        SET upvotes = upvotes - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_progress_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_reply_upvotes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_replies 
        SET upvotes = upvotes + 1 
        WHERE id = NEW.reply_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_replies 
        SET upvotes = upvotes - 1 
        WHERE id = OLD.reply_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;
CREATE TRIGGER founder_insert BEFORE INSERT ON public.founders_annual_members FOR EACH ROW EXECUTE FUNCTION public.assign_founder_spot_number();
CREATE TRIGGER founder_update BEFORE UPDATE ON public.founders_annual_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
