# CALITH SUPABASE VERİTABANI ŞEMASI (GÜNCEL)

Bu döküman, projenin en güncel veritabanı yapısını ve API (RPC) fonksiyonlarını içerir.

---

## 📊 Tablo Yapıları

### 1. public.profiles
Kullanıcıların genel profili ve fiziksel bilgileri.
- `id` (uuid, PK, auth.users'a bağlı)
- `full_name` (text)
- `email` (text) -- *Sync yapılması önerilir*
- `role` (text, default: 'user')
- `fitness_level`, `goal` (text)
- `weight`, `height` (numeric)
- `age`, `since` (integer)
- `created_at` (timestamptz)

### 2. public.user_roles
Kullanıcı yetki yönetimi (Admin, Coach, Moderator vb.).
- `user_id` (uuid, PK)
- `role` (text)
- `created_at` (timestamptz)

### 3. public.referral_codes
Affiliate/Satış ortaklığı kodları.
- `id` (uuid, PK)
- `owner_id` (uuid, profiles.id'ye bağlı)
- `code` (text, Unique, BÜYÜK HARF)
- `discount_rate` (numeric, Örn: 0.10)
- `is_active` (boolean, default: true)
- `created_at` (timestamptz)

### 4. public.orders
Sistem üzerinden yapılan satışların kaydı.
- `id` (uuid, PK)
- `user_id` (uuid, FK -> profiles, Opsiyonel)
- `referral_code_id` (uuid, FK -> referral_codes)
- `total_amount` (numeric)
- `items` (jsonb)
- `status` (text, default: 'completed')
- `created_at` (timestamptz)

---

## 🛠️ Admin API (RPC Fonksiyonları)
Güvenlik duvarlarını aşarak admin panelinin ihtiyaç duyduğu özel verileri çeker.

### 1. get_admin_users
Tüm kullanıcıları, rollerini ve `auth.users` tablosundaki e-postalarını birleştirerek getirir.

### 2. get_admin_referral_codes
Referans kodlarını, sahiplerinin isimlerini ve **e-posta adreslerini** (auth.users'dan join ile) getirir. 🕵️‍♂️📧

**SQL Kodu:**
```sql
CREATE OR REPLACE FUNCTION get_admin_referral_codes()
RETURNS TABLE (
    id uuid,
    owner_id uuid,
    code text,
    discount_rate numeric,
    is_active boolean,
    created_at timestamptz,
    full_name text,
    email text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' THEN
        RETURN QUERY
        SELECT 
            rc.id, 
            rc.owner_id, 
            rc.code::text, 
            rc.discount_rate, 
            rc.is_active, 
            rc.created_at, 
            p.full_name::text, 
            u.email::text
        FROM public.referral_codes rc
        LEFT JOIN public.profiles p ON rc.owner_id = p.id
        LEFT JOIN auth.users u ON p.id = u.id
        ORDER BY rc.created_at DESC;
    ELSE
        RAISE EXCEPTION 'Yetkisiz erişim!';
    END IF;
END;
$$;

-- SİPARİŞLERİ, ALICI BİLGİLERİNİ VE KULLANILAN KODLARI GETİREN ADMIN FONKSİYONU
CREATE OR REPLACE FUNCTION get_admin_orders()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    referral_code_id uuid,
    total_amount numeric,
    items jsonb,
    status text,
    created_at timestamptz,
    full_name text,
    email text,
    referral_code text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' THEN
        RETURN QUERY
        SELECT 
            o.id,
            o.user_id,
            o.referral_code_id,
            o.total_amount,
            o.items,
            o.status,
            o.created_at,
            p.full_name::text,
            u.email::text,
            rc.code::text
        FROM public.orders o
        LEFT JOIN public.profiles p ON o.user_id = p.id
        LEFT JOIN auth.users u ON p.id = u.id
        LEFT JOIN public.referral_codes rc ON o.referral_code_id = rc.id
        ORDER BY o.created_at DESC;
    ELSE
        RAISE EXCEPTION 'Yetkisiz erişim!';
    END IF;
END;
$$;
```


### 3. get_admin_orders
Tüm sipariş geçmişini; alıcı adı, kullanılan kod ve tutar bilgileriyle birlikte getirir.

---

## 🛡️ Güvenlik (RLS) Politikaları
- **Genel Kural:** Sadece `admin` rolüne sahip kullanıcılar RPC fonksiyonlarını tetikleyebilir.
- **Referans Kodları:** Tüm kullanıcılar (misafirler dahil) bir kodun geçerli olup olmadığını kontrol edebilir (`SELECT` yetkisi).
- **Profil:** Her kullanıcı sadece kendi profilini görebilir ve güncelleyebilir.
