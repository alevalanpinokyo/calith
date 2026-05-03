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

## 🎟️ 4. İNDİRİM VE AFFILIATE MOTORU
Kullanıcının isteği üzerine kurgulanan moderatör bazlı indirim sistemidir.

- **Mantık:** `currentDiscount` adında global bir değişken indirim oranını tutar.
- **Fonksiyon:** `applyDiscountCode()`
- **Kod Doğrulama:** Şimdilik `app.js` içinde statik bir sözlük (dictionary) üzerinden çalışır.
  - Örn: `ASRIN10` -> %10 İndirim.
- **Hesaplama:** `updateCartPageTotals()` fonksiyonu ara toplamdan indirim oranını düşer ve "TOPLAM" fiyatı belirler.

---

## 🚀 5. GELECEK PLANLAR (FAZ 6 ENTEGRASYONU)
1.  **Dinamik Kodlar:** İndirim kodları `referral_codes` tablosundan çekilecek.
2.  **Satış Takibi:** Sipariş tamamlandığında, kullanılan kodun sahibine (Mod/Antrenör) `sales` tablosu üzerinden +1 puan/satış eklenecek.
3.  **Admin Kontrolü:** Tüm bu işlemler Admin Panelinde yeni bir "Satışlar" sekmesinde listelenecek.

---

**NOT:** `cart.html` içindeki "Ödemeye Geç" butonu şu an bir demo uyarısı vermektedir. Ödeme entegrasyonu bir sonraki aşamada planlanacaktır.
