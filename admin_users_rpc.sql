-- Supabase SQL Editor Script
-- Bu script, admin yetkisine sahip kullanıcıların auth.users ve public.profiles 
-- tablolarını birleştirerek tüm kullanıcı verilerini güvenli bir şekilde 
-- çekebilmesini sağlayan bir fonksiyon oluşturur.

-- Eğer profiles tablosuna 'age' ve 'since' kolonlarını henüz eklemediyseniz, aşağıdaki iki satırın başındaki -- işaretini kaldırıp çalıştırın:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age integer;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS since integer;


CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
    id uuid,
    email varchar,
    full_name text,
    role text,
    height numeric,
    weight numeric,
    age integer,
    since integer,
    profile_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER -- auth.users tablosuna erişim için gerekli
SET search_path = pg_catalog, public
AS $$
BEGIN
    -- Güvenlik: Admin yetkisi kontrolü (profiles.role, user_metadata veya user_roles tablosu)
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) AND (auth.jwt() -> 'user_metadata' ->> 'role' IS DISTINCT FROM 'admin') 
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    ) THEN
        RETURN; -- Admin değilse boş sonuç döndür
    END IF;

    -- auth.users ve public.profiles birleştirilerek verileri döndür
    RETURN QUERY
    SELECT 
        au.id,
        au.email::varchar,
        p.full_name,
        p.role,
        p.height,
        p.weight,
        p.age,
        p.since,
        p.created_at AS profile_created_at
    FROM 
        auth.users au
    LEFT JOIN 
        public.profiles p ON au.id = p.id
    ORDER BY 
        p.created_at DESC NULLS LAST;
END;
$$;

-- Güvenlik: Fonksiyonun herkes (PUBLIC) tarafından çağrılmasını engelle
REVOKE EXECUTE ON FUNCTION get_admin_users() FROM PUBLIC;

-- Güvenlik: Sadece giriş yapmış (authenticated) kullanıcıların çağırmasına izin ver
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
