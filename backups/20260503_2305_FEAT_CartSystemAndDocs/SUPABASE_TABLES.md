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
- `role` (text, Check: admin, premium, user)

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
