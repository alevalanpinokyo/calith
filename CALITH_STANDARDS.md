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

- **Kritik Kural:** Her push işleminden önce mutlaka kök dizindeki `update_version.py` scripti çalıştırılmalıdır (`python update_version.py`).
- **Kural:** Bu işlem, TÜM HTML dosyalarındaki `?v=` parametresini otomatik olarak güncelleyerek tarayıcı cache sorunlarını engeller.
- **Yasak:** Script çalıştırılmadan ve HTML dosyalarında "M" (Modified) değişikliği oluşmadan push yapılması kesinlikle yasaktır.
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

## 5. İLETİŞİM VE ONAY MEKANİZMASI
Gereksiz kod karmaşasını ve kontrolsüz push'ları önlemek için şu iletişim protokolü uygulanır:

- **Soru vs. Aksiyon:** Kullanıcı bir soru soruyorsa, AI herhangi bir kod düzenlemesi yapmadan önce konuyu tartışmalı ve izin almalıdır. Sadece doğrudan bir **Hata (Bug)** bildirildiğinde hızlı aksiyon alınabilir.
- **Büyük Ölçekli Değişiklikler:** Yapılacak düzenleme yaklaşık **200 satır ve üzerini** kapsıyorsa veya projenin genel yapısını etkiliyorsa; AI önce yapacağı değişikliği detaylıca anlatmalı, planı sunmalı ve kullanıcıdan **ONAY** aldıktan sonra işe başlamalıdır.
- **Push Sıklığı:** Her küçük değişiklik için ayrı ayrı push atmak yerine, mantıksal bir bütünlük oluştuğunda toplu push tercih edilmelidir.

## 9. DOKÜMANTASYON VE İŞ AKIŞI KURALLARI
Projenin sürekliliğini sağlamak ve her ajanın (AI veya İnsan) nerede kaldığını bilmesi için aşağıdaki dosya düzeni SIKI SIKIYA takip edilmelidir:

- **`yol-haritam-profile.txt` (STRATEJİ):** Projenin büyük resmi, fazları ve gelecek planlarıdır. Büyük bir özellik planlandığında veya faz bittiğinde burası güncellenir. "Nereye gidiyoruz?" sorusunun cevabıdır.
- **`CALITH_STANDARDS.md` (ANAYASA):** Şu an okuduğun dökümandır. Projenin değişmez kurallarını, kodlama standartlarını ve bu iş akış düzenini içerir. "Nasıl iş yapıyoruz?" sorusunun cevabıdır.
- **`DEVIR_TESLIM.md` (GÜNLÜK RAPOR - EN KRİTİK):** Her oturumun sonunda güncellenmelidir. Yapılan geliştirmeler, biten işler ve yarım kalan (bir sonraki oturumda yapılması gereken) görevler buraya yazılır. Senden sonraki ajan işe buradan başlar.
- **`SMART_ENGINE_ALGORITMASI.md` (BEYİN):** Antrenman motorunun tüm matematiksel ve mantıksal kurallarını tutar. Geliştirilmeye açık olduğu için ayrıdır. Algoritmada bir değişim olduğunda buraya işlenir.
- **`MEVCUT_HATALAR.md` (BUG TRACKER):** Sadece aktif teknik bugları içerir. Bir bug çözüldüğünde buradan silinip `DEVIR_TESLIM.md`'ye "Tamamlandı" olarak işlenmelidir.

## 10. DÜRÜSTLÜK VE ŞEFFAFLIK KURALI
AI (Antigravity), geliştirdiği özelliklerde ve yaptığı testlerde %100 dürüst olmakla yükümlüdür.

- **Kural:** Eğer bir özellik canlı ortamda (browser/server) bizzat çalıştırılarak doğrulanamadıysa, asla "test edildi" veya "onaylandı" denmeyecek.
- **Kural:** Test edilemeyen durumlar "Kod yazıldı ancak canlı test yapılamadı" şeklinde dürüstçe raporlanacak.
- **Kural:** Başarı sahte bir şekilde raporlanmayacak. Hatalar (özellikle syntax hataları) gizlenmeyecek; her push öncesi dosya bütünlüğü (parantez dengesi, ReferenceError vb.) manuel olarak kontrol edilecek.

## 11. YEDEKLEME (BACKUP) KURALI
Projenin güvenliği ve geri dönüş noktaları için düzenli yedekleme esastır.

- **Kural:** Kullanıcı "backup al" dediğinde, o anki tüm proje dosyaları (HTML, CSS, JS, Kurallar ve Scriptler) `backups` klasörü altında yeni bir klasöre kopyalanır.
- **Standart Adlandırma:** Klasör ismi **`YYYYMMDD_HHMM_TYPE_DESCRIPTION`** formatında olmalıdır (Örn: `20260427_0015_FEAT_WorkoutDetail`).
    *   `YYYYMMDD_HHMM`: Tarih ve Saat.
    *   `TYPE`: FEAT (Özellik), FIX (Hata), UI (Tasarım), CHORE (Genel).
    *   `DESCRIPTION`: Kısa İngilizce/Türkçe açıklama.
- **Kural:** Yedekleme işlemi sırasında `.git` ve `backups` klasörünün kendisi dışarıda tutulur.

---

**NOT:** Bu kurallara uymayan kodlar "teknik borç" (technical debt) yaratır ve gelecekte sistemin çökmesine neden olur. Amacımız her zaman profesyonel ve ölçeklenebilir bir yapı kurmaktır.
