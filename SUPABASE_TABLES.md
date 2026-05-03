# 🛡️ Calith Supabase Tablo Yapıları (Schema)

Bu dosya projenin anayasasıdır. Tüm veritabanı işlemleri buradaki kolonlara göre yapılmalıdır.

---

## 🏗️ Kullanıcı & Yetki Sistemleri

### 1. public.profiles
Kullanıcı fiziksel bilgileri ve ban durumu.
- `id` (uuid, PK, FK -> auth.users, CASCADE)
- `full_name`, `fitness_level`, `goal` (text)
- `weight`, `height` (numeric)
- `age`, `since` (integer)
- `role` (text, default: 'user')
- `ban_reason` (text), `banned_until` (timestamptz)
- `created_at` (timestamptz)

### 2. public.user_roles
Yetki ve rol yönetimi (RLS anahtarı).
- `user_id` (uuid, Unique, FK -> auth.users, CASCADE)
- `role` (text, Check: admin, moderator, coach, premium, user, reserve)

---

## 🏋️‍♂️ Antrenman & Egzersiz Sistemleri

### 3. public.exercises
Merkezi egzersiz kütüphanesi.
- `id` (uuid, PK, Default: uuid_generate_v4)
- `name` (text, Unique)
- `video_url`, `category`, `difficulty` (text)
- `is_bw` (boolean, default: true)

### 4. public.workout_logs
Tamamlanmış antrenman kayıtları.
- `user_id` (uuid, FK -> auth.users, CASCADE)
- `program_title`, `day_name`, `duration` (text)
- `workout_data` (jsonb)

### 5. public.custom_workouts
Kullanıcıların kendi oluşturduğu özel programlar.
- `user_id` (uuid, FK -> auth.users, CASCADE)
- `title`, `description` (text)
- `content` (jsonb, default: '[]')

### 6. public.user_exercise_stats
Kişisel rekorlar ve 1RM takibi.
- `user_id` (uuid, FK -> auth.users)
- `exercise_name` (text, Unique with user_id)
- `exercise_id` (uuid, FK -> public.exercises) -- Yeni eklenen ID senkronizasyon kolonu
- `weight` (double precision), `reps` (bigint), `one_rm` (double precision)

### 7. public.user_programs
Kullanıcının kütüphanesine eklediği programlar.
- `user_id` (uuid, FK -> auth.users)
- `program_id` (uuid, FK -> posts)

---

## 📑 İçerik & Market Yönetimi

### 8. public.posts
Antrenman programları ve blog içerikleri.
- `title`, `slug`, `content`, `excerpt`, `category`, `image` (text)
- `published` (boolean, default: true)

### 9. public.products
Mağaza ürünleri.
- `id` (bigint, Identity)
- `name`, `category`, `image`, `desc`, `badge` (text)
- `price`, `old_price` (numeric)

### 10. public.announcements
Duyuru panosu kartları.
- `title`, `desc`, `label`, `icon`, `color`, `link`, `image` (text)

### 11. public.homecards
Ana sayfa navigasyon kartları.
- `id` (text, PK), `section`, `title`, `desc_text`, `icon`, `badge`, `link_text`, `link_url` (text)

### 12. public.links
Link-in-bio sayfası bağlantıları.
- `title`, `subtitle`, `url`, `icon_type`, `icon_name`, `category` (text)
- `order_index` (integer)

---

## 📧 Pazarlama

### 13. public.leads
Bülten kayıtları.
- `email` (text, Unique)

---

## 💰 Affiliate & E-Ticaret Sistemi

### 14. public.referral_codes
Moderatör ve antrenörlere özel indirim/takip kodları.
- `id` (uuid, PK)
- `owner_id` (uuid, FK -> profiles)
- `code` (text, Unique, BÜYÜK HARF)
- `discount_rate` (numeric, Örn: 0.10)
- `is_active` (boolean, default: true)
- `created_at` (timestamptz)

### 15. public.orders
Sistem üzerinden yapılan satışların kaydı.
- `id` (uuid, PK)
- `user_id` (uuid, FK -> profiles, Opsiyonel/Misafir)
- `referral_code_id` (uuid, FK -> referral_codes)
- `total_amount` (numeric)
- `items` (jsonb, Satın alınan ürünlerin ID listesi)
- `status` (text, default: 'completed')
- `created_at` (timestamptz)

---

## 🛠️ Veritabanı Fonksiyonları (RPC)
Bu fonksiyonlar güvenlik duvarlarını aşmak ve karmaşık sorguları basitleştirmek için kullanılır.

### 1. get_admin_users
Tüm kullanıcı listesini e-postaları ile birlikte getirir (Admin Only).
- **Return:** Table (id, full_name, email, role, ...)

### 2. get_admin_referral_codes
Tüm referans kodlarını ve sahiplerinin gerçek e-postalarını getirir (Admin Only).
- **Return:** Table (id, owner_id, code, discount_rate, full_name, email, ...)

### 3. admin_set_user_role
Kullanıcı rolünü günceller.
- **Params:** `target_user_id`, `new_role`

### 4. admin_ban_user
Kullanıcıyı uzaklaştırır.
- **Params:** `target_user_id`, `ban_duration_days`, `reason`


