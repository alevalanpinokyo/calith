# 🐞 CALITH - MEVCUT TEKNİK HATALAR (Anlık Takip)

Bu liste sadece aktif, teknik ve henüz çözülmemiş bugları içerir. Planlanan geliştirmeler için `yol-haritam-profile.txt`'ye, biten işler için `DEVIR_TESLIM.md`'ye bakınız.

---

### 🚨 AKTİF HATALAR
1. [ ] **[KRİTİK] Workout Mod - Künye Rozetleri Gözükmüyor:** Antrenman overlay/workout modu aktifken "Calith Künye" rozetleri render edilmiyor / görünmüyor. Muhtemel sebep: overlay açılırken künye container'ının `display:none` kalması veya `z-index`/`visibility` çakışması. → **Yarın incelenecek.**
2. [ ] **Mobil Hız Optimizasyonu:** Tarayıcı içi Tailwind CDN kullanımı nedeniyle ilk yükleme yavaş. (Ertelendi - Faz 3 sonrası bakılacak).
3. [ ] **İkon Flicker:** Bazı alt sayfalarda Lucide ikonları JS yüklenene kadar 0.1 saniye "zıplama" yapabiliyor. (SVG geçişi devam ediyor).

---
### 🧪 TEST EDİLECEK (Geri Bildirim Bekleyenler)
1. [ ] **Anti-Cheat Parametreleri:** 550KG barajı ve BW x 4.5 oranı gerçek kullanımda doğru tepki veriyor mu? (Kodlanınca test edilecek).
2. [ ] **Admin Program Editörü:** Rozet kutusunun 300px sınırı çok uzun metinlerde editör tarafında UI'ı nasıl etkiliyor?

---
*Not: Bir hata çözüldüğünde bu listeden silinip `DEVIR_TESLIM.md` dökümanına "Tamamlandı" olarak işlenmelidir.*
