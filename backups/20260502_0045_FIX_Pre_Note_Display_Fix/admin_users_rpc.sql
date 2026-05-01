-- Supabase SQL Editor Script
-- Bu script, admin yetkisine sahip kullanıcıların auth.users ve public.profiles 
-- tablolarını birleştirerek tüm kullanıcı verilerini güvenli bir şekilde 
-- çekebilmesini sağlayan bir fonksiyon oluşturur.

-- Eğer profiles tablosuna 'age', 'since' ve 'ban_reason' kolonlarını henüz eklemediyseniz, aşağıdaki satırların başındaki -- işaretini kaldırıp çalıştırın:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age integer;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS since integer;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason text;


-- Mevcut fonksiyonları temizle (Dönüş tipi değişiklikleri için gereklidir)
DROP FUNCTION IF EXISTS get_admin_users();
DROP FUNCTION IF EXISTS admin_set_user_role(uuid, text);
DROP FUNCTION IF EXISTS admin_ban_user(uuid, int);
DROP FUNCTION IF EXISTS admin_ban_user(uuid, int, text);
DROP FUNCTION IF EXISTS admin_delete_user(uuid);

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
    profile_created_at timestamptz,
    banned_until timestamptz,
    ban_reason text
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

    -- auth.users, public.profiles ve public.user_roles birleştirilerek verileri döndür
    RETURN QUERY
    SELECT 
        au.id,
        au.email::varchar,
        p.full_name,
        COALESCE(ur.role, p.role) AS role,
        p.height,
        p.weight,
        p.age,
        p.since,
        p.created_at AS profile_created_at,
        au.banned_until,
        p.ban_reason
    FROM 
        auth.users au
    LEFT JOIN 
        public.profiles p ON au.id = p.id
    LEFT JOIN
        public.user_roles ur ON au.id = ur.user_id
    ORDER BY 
        p.created_at DESC NULLS LAST;
END;
$$;

-- Güvenlik: Fonksiyonun herkes (PUBLIC) tarafından çağrılmasını engelle
REVOKE EXECUTE ON FUNCTION get_admin_users() FROM PUBLIC;

-- Güvenlik: Sadece giriş yapmış (authenticated) kullanıcıların çağırmasına izin ver
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;


-- ==============================================================================
-- KULLANICI İŞLEMLERİ (Rol Atama, Ban, Silme)
-- ==============================================================================

-- 1. Rol Atama Fonksiyonu
CREATE OR REPLACE FUNCTION admin_set_user_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    -- Güvenlik Kontrolü
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') 
    AND (auth.jwt() -> 'user_metadata' ->> 'role' IS DISTINCT FROM 'admin') 
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin') THEN
        RAISE EXCEPTION 'Yetkisiz erişim';
    END IF;

    -- Güvenlik: Admin rolü sadece doğrudan veritabanı üzerinden (SQL Editor vb.) atanabilir.
    IF new_role = 'admin' THEN
        RAISE EXCEPTION 'Admin rolü bu panel üzerinden atanamaz. Güvenlik gereği sadece doğrudan veritabanı (Supabase SQL Editor) üzerinden atanmalıdır.';
    END IF;

    -- Güvenlik: Hedef kullanıcı zaten bir admin ise, rolü değiştirilemez.
    IF EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin'
    ) OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = target_user_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Bir adminin rolünü bu panel üzerinden değiştiremezsiniz.';
    END IF;

    -- user_roles tablosunu güncelle veya ekle
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, new_role)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
    
    -- Senkronizasyon: public.profiles tablosundaki role sütununu da güncelle
    UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
    
    -- İsteğe bağlı: auth.users metadata güncellemesi (eğer Supabase frontend login metadata kullanıyorsa)
    UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', to_jsonb(new_role)) WHERE id = target_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_set_user_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_set_user_role(uuid, text) TO authenticated;

-- 2. Kullanıcı Banlama Fonksiyonu (banned_until ve ban_reason kullanımı)
CREATE OR REPLACE FUNCTION admin_ban_user(target_user_id uuid, ban_duration_days int, reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    -- Güvenlik Kontrolü
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') 
    AND (auth.jwt() -> 'user_metadata' ->> 'role' IS DISTINCT FROM 'admin') 
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin') THEN
        RAISE EXCEPTION 'Yetkisiz erişim';
    END IF;

    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Kendi hesabınızı banlayamazsınız';
    END IF;

    -- Güvenlik: Başka bir admini banlayamazsınız
    IF EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin'
    ) OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = target_user_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Başka bir yöneticiyi (admin) banlayamazsınız.';
    END IF;

    IF ban_duration_days > 0 THEN
        UPDATE auth.users SET banned_until = now() + (ban_duration_days || ' days')::interval WHERE id = target_user_id;
        UPDATE public.profiles SET ban_reason = reason WHERE id = target_user_id;
    ELSE
        UPDATE auth.users SET banned_until = null WHERE id = target_user_id;
        UPDATE public.profiles SET ban_reason = null WHERE id = target_user_id;
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_ban_user(uuid, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_ban_user(uuid, int, text) TO authenticated;

-- 3. Kullanıcı Silme Fonksiyonu
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    -- Güvenlik Kontrolü
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') 
    AND (auth.jwt() -> 'user_metadata' ->> 'role' IS DISTINCT FROM 'admin') 
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin') THEN
        RAISE EXCEPTION 'Yetkisiz erişim';
    END IF;

    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Kendi hesabınızı silemezsiniz';
    END IF;

    -- Güvenlik: Başka bir admini silemezsiniz
    IF EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin'
    ) OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = target_user_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Başka bir yöneticiyi (admin) silemezsiniz.';
    END IF;

    -- Sadece auth.users'dan sileriz. Eğer Supabase tablolarda foreign key ON DELETE CASCADE ayarlandıysa
    -- ilişkili profiles ve user_roles satırları da otomatik silinir.
    DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_delete_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_delete_user(uuid) TO authenticated;
