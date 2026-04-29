# CALITH - MEVCUT HATALAR VE DEVİR TESLİM RAPORU
**Tarih:** 2026-04-27  
**Versiyon:** v=202604271226  
**Devreden:** Antigravity AI (389c045a-4665-4c2f-ad53-80de5de4444e)

---

## ✅ ÇÖZÜLEN HATA: Set Tamamlama Sonrası Siyah Ekran

### Sorunun Özeti
Kullanıcı antrenman sırasında bir seti tamamlayıp **"SETİ TAMAMLA"** butonuna bastığında:
1. `showSetFeedbackModal(weight, reps)` açılıyor ✅
2. Kullanıcı Form (Temiz/Kirli) ve RPE (Hafif/İdeal/Ağır) seçiyor ✅
3. **"ANALİZ ET VE DEVAM ET"** butonuna basıyor
4. Modal kapanıyor ✅
5. **Ekran SİYAH kalıyor** ❌ (dinlenme sayacı görünmüyor)

### Çözüm (Neden Kaynaklandı)
Hatanın kaynağı `showSetFeedbackModal` içerisindeki HTML'de bulunan `fade-in` CSS class'ıydı.
Bu class `styles.css` içinde `opacity: 0` olarak tanımlanmıştı ve IntersectionObserver sadece sayfa yüklendiğinde var olan elementleri hedeflediği için, sonradan oluşturulan bu modal DOM'a eklendiğinde hep `opacity: 0` kalıyordu.
Modalın kendi backgroundu (`rgba(0,0,0,0.95)`) ekranı kaplayıp karartırken, modal içindeki öğeler görünmez (`opacity: 0`) olduğu için kullanıcı simsiyah bir ekran görüyordu.

**Yapılan İşlem:** `fade-in` class'ı `showSetFeedbackModal` içerisinden kaldırılarak sorun tamamen çözüldü. Artık Set Tamamlama akışı ve ardından dinlenme sayacı sorunsuz çalışıyor.

---

## ✅ ÇÖZÜLEN HATA: BW Egzersizlerinde Gereksiz "KG" İbaresi

### Sorunun Özeti
Vücut ağırlığı (BW - Bodyweight) ile yapılan egzersizlerde (örneğin: Barfiks, Şınav), set tamamlama modalında "0KG x 10 TEKRAR" gibi anlamsız bir gösterim oluyordu.

### Çözüm
`showSetFeedbackModal` fonksiyonu güncellendi:
- Egzersizin `isBW` özelliği veya isminde "bw" geçip geçmediği kontrol ediliyor.
- Eğer BW egzersizi ise sadece "X TEKRAR" gösteriliyor, "KG" kısmı gizleniyor.
- Normal egzersizlerde "X KG x Y TEKRAR" yapısı korunuyor.

---

## ✅ ÇÖZÜLEN HATA: Saniye (SN) Birim ve Etiket Hataları (2026-04-27)
- Plank, L-Sit gibi saniye bazlı hareketlerde birim (kg/sn) karışıklığı giderildi.
- Feedback modalı ve akıllı öneri kutusu dinamik birim (SN/SANİYE) kullanacak şekilde revize edildi.

---

## ✅ ÇÖZÜLEN HATA: Sayaç Kilitlenmesi ve Yanlışlıkla Geçme (2026-04-27)
- Sayaç butonuna 1 saniyelik "hız sınırı" (disable) eklendi, 0 saniyede kilitlenme önlendi.
- Hareketi geç butonuna her iki UI modunda da onay modalı eklendi.

---
```js
// app.js - submitSetFeedback (satır ~5672)
function submitSetFeedback(weight, reps) {
    console.log('[Calith] submitSetFeedback çağrıldı:', weight, reps, window.currentFeedback);
    
    // Modal'ı HER DURUMDA kapat
    const modal = document.getElementById('set-feedback-modal');
    if (modal) modal.remove();

    const workoutEl = document.getElementById('workout-mode');
    if (workoutEl) workoutEl.scrollTop = 0;

    try {
        const feedback = window.currentFeedback || { isClean: true, feel: 'ideal' };
        const { isClean, feel } = feedback;
        processSetWithFeedback(weight, reps, isClean, feel);
    } catch(e) {
        console.error('[Calith] submitSetFeedback HATA:', e);
        processSetWithFeedback(weight, reps, true, 'ideal');
    }
}
```

### Kritik Kontrol Noktaları
Konsol açıkken (F12) set tamamlandıktan sonra şu loglar görünmeli:
- `[Calith] submitSetFeedback çağrıldı:` → Fonksiyon çalışıyor demek
- `[Calith] submitSetFeedback HATA:` → Hata varsa ne olduğu yazar
- `[Calith Debug] SET: 1, HEDEF: X, TARGET_RAW: "...", TARGET_SETS_RAW: Y` → `processSetWithFeedback` çalışıyor demek

Eğer **hiçbir log görünmüyorsa** → `onclick="submitSetFeedback(...)"` HTML attribute'undan hiç çağrılmıyor demektir. Bu durumda `showSetFeedbackModal` içindeki HTML template'e bakılmalı.

### Şüpheli Senaryo (Henüz Doğrulanmadı)
`targetSets=1` olduğunda (program `sets` alanı eksik gelirse) 1. set sonrası `showNextExerciseModal()` çağrılıyor. Bu modal `z-[9999]` ile açılıyor ve siyah overlay içeriyor. Eğer bu modal'ın içi render edilemiyorsa siyah ekran görünebilir.

---

## ✅ FAZ 2 - Tamamlanan Özellikler (Test Bekleyen)

| Özellik | Durum |
|---|---|
| Kalibrasyon Rehberi Modal | ✅ Kod tamam, test edilebilir |
| "Temiz mi?" + RPE Geri Bildirim Modal | ✅ Kod tamam, test edilebilir |
| Akıllı Öneri (💡 ÖNERİLEN: X KG) | ✅ Kod tamam, test edilebilir |
| TEST: Rekorları Sıfırla Butonu | ✅ Çalışıyor |
| Geçmiş Boş Durumu Fix | ✅ Çalışıyor |

---

## 📁 Kritik Dosyalar

| Dosya | Açıklama |
|---|---|
| `js/app.js` | Tüm uygulama mantığı (~5683 satır) |
| `yol-haritam-profile.txt` | Proje yol haritası (DEMİR KURAL) |
| `CALITH_STANDARDS.md` | Proje anayasası ve kurallar |
| `update_version.py` | Her push öncesi çalıştırılması ZORUNLU |

---

## 🔑 Önemli Fonksiyonlar (app.js)

| Fonksiyon | Satır | Açıklama |
|---|---|---|
| `startWorkout(p, dayIndex)` | ~4260 | Antrenmanı başlatır, overlay oluşturur |
| `completeSet()` | ~4725 | Seti tamamlar, feedback modal açar |
| `showSetFeedbackModal(w, r)` | ~5588 | Geri bildirim popupını gösterir |
| `submitSetFeedback(w, r)` | ~5672 | Modal verilerini işler ve süreci devam ettirir |
| `processSetWithFeedback(w,r,c,f)` | ~4731 | Set verisini kaydeder, rest timer başlatır |
| `startRestTimer()` | ~4783 | Dinlenme sayacını gösterir |
| `updateWorkoutUI()` | ~4525 | Hareket UI'ını günceller (async getSmartRecommendation içerir) |
| `getSmartRecommendation(name)` | ~5455 | Supabase'den 1RM çekip öneri hesaplar |
| `showCalibrationModal()` | ~5537 | İlk antrenman rehber modalı |
| `resetExerciseStats()` | ~5570 | Test butonu: tüm geçmişi siler |

---

## 🧠 Sistem Mantığı (Faz 2)

```
İlk Antrenman:
  getSmartRecommendation → null döner
  → showCalibrationModal() gösterilir
  → Kullanıcı kendi kilonu seçer

Set Tamamlama Akışı:
  completeSet() 
  → showSetFeedbackModal(w, r) [SORUNLU NOKTA]
  → selectFeedback('form', true/false)
  → selectFeedback('feel', 'light'/'ideal'/'heavy')
  → submitSetFeedback(w, r)
  → processSetWithFeedback(w, r, isClean, feel)
  → updateExerciseBest() [Supabase'e kaydeder]
  → renderWorkoutSets()
  → workoutSession.currSet++
  → startRestTimer() [REST KUTUSU AÇILMALI]
```

---

## ⚙️ Supabase Tabloları

| Tablo | Açıklama |
|---|---|
| `user_exercise_stats` | Kullanıcının her hareket için en iyi derecesi ve 1RM |
| `workout_logs` | Tamamlanan antrenman geçmişi |
| `profiles` | Kullanıcı profili (hedef, kilo, boy vb.) |

**NOT:** `workout_logs` tablosunda `DELETE` policy eksik olabilir.  
SQL: `create policy "delete own" on workout_logs for delete using (auth.uid() = user_id);`

---

## 📋 Demir Kurallar (CALITH_STANDARDS.md'den)
1. Her push öncesi `python update_version.py` çalıştır
2. Her değişiklik `yol-haritam-profile.txt`'ye işlenmeli
3. 200+ satır değişiklik için kullanıcıdan onay al
---

## 💡 Gelecek Planları & Tartışılacaklar

- **BW PR Mantığı:** Şu anki 1RM hesaplaması ağırlıksız (BW) hareketlerde 0 sonuç veriyor. Bu hareketlerin "Maksimum Tekrar" üzerinden PR olarak kaydedilmesi ve profil ekranında farklı gösterilmesi (örn: "Barfiks: 22 Tekrar") tartışılacak.
- **Workout Logs Delete Policy:** SQL sorgusu çalıştırıldı, silme yetkisi doğrulandı. ✅

---

## 🚧 GELİŞTİRME: Smart Workout Engine v2 (MAX/SN/BW)

**Hedef:** Admin panelinden gelen "MAX", "SN" ve "BW" verilerinin antrenman motoru tarafından akıllıca işlenmesi.

### Yapılacaklar:
1. [x] **Parser Güncelleme:** `ex.reps` "MAX" ise bunu algılayıp `isMax: true` flag'i ekle. (TEST EDİLDİ)
2. [x] **Stopwatch Modu:** `isTimed && isMax` durumunda geri sayım yerine 0'dan yukarı sayan sayaç ekle. (TEST EDİLDİ)
3. [x] **BW PR Mantığı:** Ağırlık 0 ise rekoru `reps` üzerinden tut. (TEST EDİLDİ)
4. [x] **UI Uyumluluğu:** MAX hareketlerde girdi alanlarını "Sonuç" odaklı güncelle. (TEST EDİLDİ)

**Durum:** Kodlama tamamlandı ve canlı ortamda başarıyla test edildi. Tüm akışlar (kronometre, veri girişi, set tamamlama ve dinlenme süresi) sorunsuz çalışıyor.

---

## 🐞 UI/UX İYİLEŞTİRMELERİ VE KÜÇÜK HATALAR (Sonraki Aşamalarda Çözülecek)

1. [x] **TAMAMLANDI: Süreli Hareketlerde (SN) KG Hatası:** Örneğin 9 saniyelik Plank yapıldığında, Set Tamamlandı (Geçmiş) kutusunda "9 sn" yerine yanlışlıkla "9 kg" gibi ağırlık birimi yazması.
2. [ ] **BEKLETİLİYOR: Mobil Hız Optimizasyonu:** Sayfanın mobilde çok geç yüklenmesi. (Neden: Tarayıcı içi Tailwind CDN kullanımı ve senkron dış bağlantılar). İleri bir tarihe ertelendi.
3. [ ] **TEST EDİLECEK (Beklemede): Gerçek Dışı PR Kontrolü (Anti-Cheat / Anatomik Limit):** Kullanıcıların vücut ağırlıklarına ve hareketin mekaniğine (örn: Curl vs Squat) kıyasla imkansız ağırlıklar (örn: 500kg Curl) girmesinin engellenmesi.
4. [x] **TAMAMLANDI: App Bar (Navigasyon) Senkronizasyonu:** Sayfalar arası Navbar kaymaları, Profilim linkinin eksik olması ve aktif sayfa (Örn: Anasayfa) yerine Koçluk sekmesinin turuncu kalması sorunu.
5. [x] **TAMAMLANDI: App Bar Tasarım Revizyonu:** Navbar'ın arka plana boğulması (kontrast eksikliği) ve yazı fontlarının küçük kalması.
6. [ ] **TEST EDİLECEK (Beklemede): İkon Flicker (Gecikme) Sorunu:** Navigasyon barındaki ikonların JS yüklenene kadar görünmemesi/sıçraması ve Profilim butonuna Shadow efekti eklenmesi.

---

## ✅ ÇÖZÜLEN: Set Silme, Dinlenme Kilidi ve Opsiyonel Hareket Atlama (2026-04-27)

### 1. Set Silme (X Butonu)
- **Sorun:** Yanlış ağırlık/tekrar girip seti tamamladıktan sonra geri dönüş yoktu.
- **Çözüm:** Her set kutucuğuna kırmızı X silme butonu eklendi. Onay modalı ile silinir.
- Fonksiyon: `deleteWorkoutSet(index)`

### 2. Dinlenme Süresinde Buton Kilidi
- **Sorun:** Dinlenme sayacı çalışırken "Seti Tamamla" butonu ve inputlar aktifti.
- **Çözüm:** `startRestTimer()` çalıştığında butonlar/inputlar kilitlenir, `skipRest()` ile açılır.

### 3. Opsiyonel Hareket Atlama
- **Sorun:** Sona atılan hareketler sahte veri girilmesini gerektiriyordu.
- **Çözüm:** `skippedToEnd` flag + sarı banner ile "Yapmak İstiyorum" / "Atla" seçeneği sunulur.
- Fonksiyonlar: `skipExerciseAndContinue()`, `clearSkippedFlag()`

### 4. Akıllı Ağırlık Algoritması (Savaşçı Payı)
- **Sorun:** "İdeal" hissiyatta bile agresif kilo artırıyor veya hedefi 1 tekrarla kaçırınca hemen kilo düşürüyordu.
- **Çözüm:** 
  - **İdeal Form:** Hedefe ulaşıldıysa ağırlığı korur (Artırmaz).
  - **Savaşçı Payı:** Hedef 1-2 tekrarla kaçırıldıysa (Tolerans) kilo düşürmez, "Aynı Kal" der.
  - **Agresiflik Kontrolü:** "Hafif" hissiyatta artış oranı %15'ten %5'e çekildi (Güvenli gelişim).

---

## ✅ ÇÖZÜLEN ÖZELLİK: Workout Recovery (Auto-Save)

### Özellik Özeti
Kullanıcı antrenman ortasında sayfayı yenilese, tarayıcıyı kapatsa veya sekme uyku moduna geçse bile antrenman verileri kaybolmaz.

### Teknik Detaylar
1.  **Hafıza (Persistence):** `localStorage` üzerinde `calith_workout_session` anahtarı ile tüm `workoutSession` objesi saklanır.
2.  **Otomatik Kayıt:** `saveWorkoutState()` fonksiyonu her set bitiminde, hareket değişiminde ve antrenman başlangıcında çağrılır.
3.  **Kurtarma (Recovery):** Sayfa her yüklendiğinde `DOMContentLoaded` içinde `checkActiveWorkout()` çalışır.
4.  **Banner Sistemi:** Eğer aktif bir session varsa, ekranın sağ altında (mobilde ortada) şık bir cam efektli (glassmorphism) banner çıkar ve kullanıcıya "Kaldığın Yerden Devam Et" seçeneği sunar.
5.  **Temizlik:** Antrenman başarıyla bitirildiğinde veya kullanıcı iptal ettiğinde `clearWorkoutState()` ile hafıza temizlenir.

---

## ✅ ÇÖZÜLEN ÖZELLİK: Antrenman Detay Görünümü & Paylaşım

### Özellik Özeti
Geçmiş antrenmanların detaylarını görme ve bu detayları metin olarak kopyalayıp paylaşma özelliği eklendi.

### Teknik Detaylar
1.  **Detay Modalı:** `showWorkoutLogDetail(logId)` fonksiyonu ile geçmiş antrenmanların set bazlı verileri (ağırlık, tekrar, form, RPE) şık bir modalda listelenir.
2.  **Kopyala Butonu:** Modalın sağ üst köşesine eklenen "Kopyala" butonu (`copyWorkoutToClipboard`), antrenman özetini emoji destekli ve düzenli bir metin formatına dönüştürür.
3.  **Clipboard API:** `navigator.clipboard.writeText` kullanılarak modern tarayıcı uyumlu kopyalama işlemi gerçekleştirilir.

