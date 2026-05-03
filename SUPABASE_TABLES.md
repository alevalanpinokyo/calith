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
- **Amacı:** Adminin kimin ne kadar satış yaptığını ve kodun kime ait olduğunu net görmesi.

### 3. get_admin_orders
Tüm sipariş geçmişini; alıcı adı, kullanılan kod ve tutar bilgileriyle birlikte getirir.

---

## 🛡️ Güvenlik (RLS) Politikaları
- **Genel Kural:** Sadece `admin` rolüne sahip kullanıcılar RPC fonksiyonlarını tetikleyebilir.
- **Referans Kodları:** Tüm kullanıcılar (misafirler dahil) bir kodun geçerli olup olmadığını kontrol edebilir (`SELECT` yetkisi).
- **Profil:** Her kullanıcı sadece kendi profilini görebilir ve güncelleyebilir.
