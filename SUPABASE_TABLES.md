# SUPABASE VERİTABANI ŞEMASI VE TABLO YAPILARI

Bu döküman, Calith projesindeki tüm veritabanı tablolarını, kolonlarını ve özel fonksiyonlarını (RPC) içerir. Veritabanı taşımalarında veya sıfırlamalarında bu yapı kullanılmalıdır.

---

## 1. TEMEL TABLOLAR

### `profiles` (Kullanıcı Bilgileri)
- `id` (uuid, primary key, auth.users.id ile eşleşir)
- `full_name` (text)
- `updated_at` (timestamptz)

### `user_roles` (Yetkilendirme)
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles.id)
- `role` (text, default: 'user' - Seçenekler: 'user', 'admin', 'moderator', 'coach')

### `referral_codes` (İndirim ve Satış Ortaklığı Kodları)
- `id` (uuid, primary key)
- `owner_id` (uuid, references profiles.id - Koda sahip olan kişi)
- `code` (text, unique - Örn: 'GAYALI', 'ALISIKEN')
- `discount_rate` (numeric - Örn: 0.10 for 10%)
- `is_active` (boolean, default: true)
- `created_at` (timestamptz)

### `orders` (Sipariş Geçmişi)
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles.id - Satın alan kişi)
- `referral_code_id` (uuid, references referral_codes.id - Kullanılan indirim kodu)
- `total_amount` (numeric, Toplam tutar)
- `items` (jsonb, Satın alınan ürünlerin detaylı listesi)
- `status` (text, Sipariş durumu: completed, pending vb.)
- `payment_method` (text, Ödeme yöntemi: Kart, Havale vb.)
- `created_at` (timestamptz, Sipariş tarihi ve saati)

---

## 🔐 ÖZEL RPC FONKSİYONLARI (ADMIN ONLY)

Aşağıdaki fonksiyonlar, RLS kısıtlamalarını aşmak ve hassas verilere (E-posta vb.) güvenli erişim sağlamak için kullanılır.

### 1. Referans Kodlarını Listeleme (`get_admin_referral_codes`)
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
```

### 2. Siparişleri Listeleme (`get_admin_orders`)
```sql
DROP FUNCTION IF EXISTS get_admin_orders();

CREATE OR REPLACE FUNCTION get_admin_orders()
RETURNS TABLE (
    order_id uuid,
    buyer_id uuid,
    code_id uuid,
    order_total numeric,
    order_items jsonb,
    order_status text,
    order_date timestamptz,
    payment_method text,
    buyer_name text,
    buyer_email text,
    used_code text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin') THEN
        RETURN QUERY
        SELECT 
            o.id,
            o.user_id,
            o.referral_code_id,
            o.total_amount,
            o.items,
            o.status,
            o.created_at,
            o.payment_method,
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
