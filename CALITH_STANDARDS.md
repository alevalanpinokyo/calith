# CALITH PROJE STANDARTLARI VE GELİŞTİRME KURALLARI

Bu döküman, Calith projesinin mimari bütünlüğünü korumak, hataları önlemek ve profesyonel bir kod tabanı sürdürmek için uyulması gereken zorunlu kuralları içerir.

---

## 1. MERKEZİ UI MİMARİSİ (DRY - Don't Repeat Yourself)
Projedeki tüm ortak kullanıcı arayüzü bileşenleri tek bir merkezden yönetilir. **Hiçbir HTML dosyasına manuel olarak ortak bileşen kodu eklenmemelidir.**

- **Kural:** Ortak bileşenler (Modal, Toast, Overlay, Player vb.) `js/app.js` içerisindeki `initSharedUI()` fonksiyonu tarafından dinamik olarak oluşturulur.
- **Yasak:** Yeni bir HTML sayfası oluştururken asla başka bir sayfadan "Giriş Modalı" veya "Workout Overlay" kodlarını kopyalayıp yapıştırma.
- **Uygulama:** Sayfaya sadece `app.js` dosyasını dahil et ve bileşenlerin enjekte edileceği boş alanları (mount points) bırak.

## 2. VERSİYONLAMA VE CACHE BUSTING (Update Version)
Kullanıcıların tarayıcılarındaki eski önbellek (cache) dosyaları nedeniyle hatalarla karşılaşmasını önlemek için her güncellemede versiyon numarası artırılmalıdır.

- **Kural:** `js/app.js` veya `styles.css` üzerinde bir değişiklik yapıldığında, bu dosyaların çağrıldığı TÜM HTML dosyalarındaki `?v=` parametresi güncellenmelidir.
- **Format:** Versiyon formatı tarih bazlı olmalıdır (Örn: `?v=202604250200`).
- **Neden?** Bu sayede tarayıcı dosyanın değiştiğini anlar ve eski, hatalı dosyayı kullanmak yerine yenisini indirir.

## 3. ASYNC VERİ YÜKLEME VE SKELETON
Kullanıcı deneyimini (UX) üst seviyede tutmak için veriler yüklenirken sayfa donmamalıdır.

- **Kural:** Veritabanı (Supabase) istekleri paralel (`Promise.all`) atılmalıdır.
- **Kural:** Veri gelene kadar kullanıcıya boş bir ekran yerine "Skeleton" (yükleniyor efekti) veya "Spinner" gösterilmelidir.
- **Kural:** Sekme geçişlerinde (Profile Tabs vb.), eski veri yeni verinin üzerine yazılmamalı; her sekme kendi render işlemini kontrol etmelidir.

## 4. MOBİL ÖNCELİKLİ (MOBILE-FIRST) TASARIM
Calith bir spor uygulamasıdır ve kullanıcıların çoğu mobilden erişir.

- **Kural:** Her yeni özellik önce mobil görünümde (375px - 430px) test edilmelidir.
- **Kural:** Butonlar ve etkileşimli alanlar "parmak dostu" büyüklükte olmalıdır.
- **Kural:** Videolar modal içinde `playsinline` parametresiyle açılmalı, tarayıcının tam ekran oynatıcısına zorlanmamalıdır.

---

**NOT:** Bu kurallara uymayan kodlar "teknik borç" (technical debt) yaratır ve gelecekte sistemin çökmesine neden olur. Amacımız her zaman profesyonel ve ölçeklenebilir bir yapı kurmaktır.
