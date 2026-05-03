# 🛒 CALITH SEPET VE İNDİRİM SİSTEMİ MİMARİSİ

Bu dosya, Calith mağaza sisteminin teknik kurgusunu ve mantığını açıklar. Her geliştirme bu yapıya sadık kalınarak yapılmalıdır.

---

## 💾 1. VERİ SAKLAMA (STORAGE)
- **Anahtar:** `calith_cart`
- **Yöntem:** `localStorage` (Kullanıcı sayfayı yenilese de sepeti kaybolmaz).
- **Yapı:** Ürün nesnelerinin bir dizisidir. Her nesne ürün bilgilerine ek olarak `qty` (adet) bilgisini tutar.
  ```javascript
  let cart = [{ id: '1', name: 'Barfiks Demiri', price: 500, qty: 1, image: '...', category: '...' }];
  ```

---

## 🎨 2. KULLANICI ARAYÜZÜ (UI)
Sistem iki farklı katmandan oluşur:
1.  **Yan Sepet (Sidebar - Sidebar Drawer):** `shop.html` ve diğer sayfalarda bulunan hızlı erişim panelidir. `updateCartUI()` fonksiyonu ile yönetilir.
2.  **Sepet Sayfası (cart.html):** Detaylı kontrol, adet güncelleme ve **İndirim Kodu** girişinin yapıldığı ana sayfadır. `renderCartPage()` fonksiyonu ile yönetilir.

---

## ⚙️ 3. TEMEL FONKSİYONLAR (CORE LOGIC)
`app.js` içerisindeki merkezi fonksiyonlar:

- **`addToCart(id, qty)`:** Ürünü sepete ekler. Eğer ürün varsa adet artırır, yoksa yeni ekler.
- **`saveCart()`:** Mevcut `cart` dizisini anlık olarak `localStorage`'a yazar.
- **`updateCartUI()`:** Tüm sayfalardaki sepet ikonlarını (badge) ve yan sepet içeriğini günceller.
- **`renderCartPage()`:** Sadece `cart.html` sayfasında çalışır. Ürünleri büyük kartlar halinde listeler.
- **`updateCartPageQty(id, delta)`:** Sepet sayfasındaki + ve - butonlarını yönetir.

---

## 🎟️ 4. DİNAMİK AFFILIATE MOTORU (CANLI SİSTEM)
Moderatör ve antrenörlere özel kurgulanan veritabanı tabanlı indirim sistemidir.

- **Mantık:** `currentDiscount` adında global bir nesne indirim bilgilerini tutar.
- **Fonksiyon:** `applyDiscountCode()`
- **Kod Doğrulama (DATABASE):** Kodlar artık `app.js` içinde değil, Supabase `referral_codes` tablosu üzerinden sorgulanır.
  - Kod aktif mi? (`is_active: true`)
  - İndirim oranı nedir? (`discount_rate`)
- **İş Akışı:**
    1. Kullanıcı kodu girer.
    2. `applyDiscountCode` asenkron olarak DB'ye gider.
    3. Başarılıysa `currentDiscount` dolar ve `updateCartPageTotals()` fiyatları günceller.

---

## 📊 5. SATIŞ VE ADMİN YÖNETİMİ (FAZ 6)
Sistem artık sadece indirim yapmıyor, aynı zamanda satış takibi de yapıyor:

1.  **Kod Atama:** Admin panelinde `renderAdminUsers` listesinde her kullanıcının yanında bir "Bilet" ikonu bulunur. Bu ikonla kullanıcıya anında `referral_codes` tablosunda bir kod tanımlanır.
2.  **Sipariş Kaydı:** Ödeme/Sipariş tamamlandığında (Şu an demo aşamasında), sipariş bilgileri `orders` tablosuna; kullanılan kod ID'si ve toplam tutar ile birlikte kaydedilir.
3.  **Admin Paneli:** "Siparişler & Kodlar" sekmesi üzerinden tüm satış geçmişi ve aktif referans kodları canlı olarak izlenebilir.

---

## 🚀 6. GELECEK PLANLAR
1.  **Moderatör Paneli:** `moderator` veya `coach` rolündeki kullanıcıların profil sayfasında kendi satış istatistiklerini görebileceği bir "Partner Area" oluşturulacak.
2.  **Otomatik Hak Ediş:** Satış başına otomatik komisyon veya puan hesaplama sistemi eklenecek.

---

**NOT:** `cart.html` içindeki "Ödemeye Geç" butonu şu an bir demo uyarısı vermektedir. Ödeme entegrasyonu bir sonraki aşamada planlanacaktır.
