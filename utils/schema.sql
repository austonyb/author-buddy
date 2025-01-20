

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_total_usage"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    _updated_id bigint;
    _current_usage integer;
BEGIN
    RAISE NOTICE 'Trigger update_total_usage started for usage_id: %, user_plan_id: %', NEW.id, NEW.user_plan_id;

    IF NEW.user_plan_id IS NULL THEN
        RAISE EXCEPTION 'user_plan_id cannot be null';
    END IF;

    -- First get current usage to ensure proper integer handling
    SELECT total_usage INTO _current_usage
    FROM public.user_plans
    WHERE id = NEW.user_plan_id;

    -- Set default to 0 if null
    _current_usage := COALESCE(_current_usage, 0);
    
    RAISE NOTICE 'Current usage for user_plan_id %: %', NEW.user_plan_id, _current_usage;

    UPDATE public.user_plans
    SET 
        total_usage = _current_usage + 1,
        last_usage_date = CURRENT_TIMESTAMP
    WHERE id = NEW.user_plan_id
    RETURNING id INTO _updated_id;
    
    IF _updated_id IS NULL THEN
        RAISE EXCEPTION 'Failed to update user_plan with id: %. Row might not exist.', NEW.user_plan_id;
    END IF;

    RAISE NOTICE 'Successfully updated user_plan_id: % for usage_id: %. New usage: %', _updated_id, NEW.id, _current_usage + 1;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in update_total_usage trigger: % %', SQLERRM, SQLSTATE;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_total_usage"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_plan_usage"("user_plan_id" bigint) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    _plan_max_usage integer;
    _current_tracking jsonb;
    _monthly_usage integer;
    _last_reset timestamp with time zone;
BEGIN
    -- Get the plan's max usage and current tracking
    SELECT 
        p.max_usage,
        up.usage_tracking
    INTO 
        _plan_max_usage,
        _current_tracking
    FROM public.user_plans up
    JOIN public.plans p ON p.id = up.plan_id
    WHERE up.id = user_plan_id;

    -- Extract current values
    _monthly_usage := COALESCE((_current_tracking->>'monthly_usage')::integer, 0);
    _last_reset := COALESCE((_current_tracking->>'last_reset')::timestamp with time zone, CURRENT_TIMESTAMP);

    -- Check if we need to reset monthly usage (if it's been a month since last reset)
    IF _last_reset < date_trunc('month', CURRENT_TIMESTAMP) THEN
        _monthly_usage := 0;
        _last_reset := CURRENT_TIMESTAMP;
    END IF;

    -- Check if this would exceed the plan limit
    IF _plan_max_usage IS NOT NULL AND (_monthly_usage + 1) > _plan_max_usage THEN
        RAISE EXCEPTION 'Usage would exceed plan limit. Current: %, Max: %', 
            _monthly_usage, _plan_max_usage;
    END IF;

    -- Update the tracking
    _current_tracking := jsonb_build_object(
        'monthly_usage', _monthly_usage + 1,
        'last_reset', _last_reset,
        'last_usage', CURRENT_TIMESTAMP
    );

    UPDATE public.user_plans
    SET usage_tracking = _current_tracking
    WHERE id = user_plan_id
    RETURNING usage_tracking INTO _current_tracking;

    RETURN _current_tracking;
END;
$$;


ALTER FUNCTION "public"."update_user_plan_usage"("user_plan_id" bigint) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."books" (
    "asin" "text" NOT NULL,
    "author" "text" NOT NULL,
    "rating" "text",
    "type" "text",
    "title" "text" NOT NULL,
    "url" "text",
    "price" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."books" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."downloads" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_plan_id" bigint NOT NULL,
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."downloads" OWNER TO "postgres";


ALTER TABLE "public"."downloads" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."downloads_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "max_usage" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


ALTER TABLE "public"."plans" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."plans_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_plans" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "plan_id" bigint,
    "start_date" timestamp with time zone DEFAULT "now"(),
    "end_date" timestamp with time zone,
    "usage_tracking" "jsonb" DEFAULT "jsonb_build_object"('monthly_usage', 0, 'last_reset', CURRENT_TIMESTAMP, 'last_usage', NULL::"unknown"),
    "cancellation_date" timestamp with time zone
);


ALTER TABLE "public"."user_plans" OWNER TO "postgres";


ALTER TABLE "public"."user_plans" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_plans_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("asin");



ALTER TABLE ONLY "public"."downloads"
    ADD CONSTRAINT "downloads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_plans"
    ADD CONSTRAINT "user_plans_pkey" PRIMARY KEY ("id");



CREATE INDEX "books_author_idx" ON "public"."books" USING "btree" ("author");



CREATE INDEX "books_type_idx" ON "public"."books" USING "btree" ("type");



CREATE INDEX "idx_downloads_user_id" ON "public"."downloads" USING "btree" ("user_id");



CREATE INDEX "idx_downloads_user_plan_id" ON "public"."downloads" USING "btree" ("user_plan_id");



CREATE INDEX "idx_user_plans_plan_id" ON "public"."user_plans" USING "btree" ("plan_id");



CREATE INDEX "idx_user_plans_user_id" ON "public"."user_plans" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."downloads"
    ADD CONSTRAINT "downloads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."downloads"
    ADD CONSTRAINT "downloads_user_plan_id_fkey" FOREIGN KEY ("user_plan_id") REFERENCES "public"."user_plans"("id");



ALTER TABLE ONLY "public"."user_plans"
    ADD CONSTRAINT "user_plans_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id");



ALTER TABLE ONLY "public"."user_plans"
    ADD CONSTRAINT "user_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow read access to plans" ON "public"."plans" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow users to read their own plans" ON "public"."user_plans" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."downloads" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."downloads" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."downloads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_plans" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."update_total_usage"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_total_usage"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_total_usage"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_plan_usage"("user_plan_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_plan_usage"("user_plan_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_plan_usage"("user_plan_id" bigint) TO "service_role";


















GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";



GRANT ALL ON TABLE "public"."downloads" TO "anon";
GRANT ALL ON TABLE "public"."downloads" TO "authenticated";
GRANT ALL ON TABLE "public"."downloads" TO "service_role";



GRANT ALL ON SEQUENCE "public"."downloads_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."downloads_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."downloads_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."plans_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."plans_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."plans_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_plans" TO "anon";
GRANT ALL ON TABLE "public"."user_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."user_plans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_plans_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_plans_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_plans_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
