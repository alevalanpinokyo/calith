# 🐞 CALITH - MEVCUT TEKNİK HATALAR (Anlık Takip)

Bu liste sadece aktif, teknik ve henüz çözülmemiş bugları içerir. Planlanan geliştirmeler için `yol-haritam-profile.txt`'ye, biten işler için `DEVIR_TESLIM.md`'ye bakınız.

---

### ✅ SON ÇÖZÜLEN HATALAR (30 Nisan 2026 - Oturum #3)
1. [x] **Smart Engine Test Sürüşü Bug'ı:** Geçmişte tamamlanan program/günlere tıklandığında gereksiz yere Kalibrasyon Ekranı açılması engellendi (`workout_logs` geçmişi sorgulanarak bypass eklendi).
2. [x] **DUP (Ağır-Orta-Hafif) Matematik Entegrasyonu (Faz 3):** Smart Engine'e gerçek progressive overload matematiği eklendi. Heavy için 1RM %85, Medium %75, Light %65 oranları tanımlandı (Tümü 0.5 kg katlarına yuvarlanır).
3. [x] **Geçmiş Detay Butonları:** Düzenle/Sil butonlarına mobilde tıklanamama sorunu çözüldü (Global Event Delegation + Custom Modals).
4. [x] **Race Condition:** Modal açıkken arka plan render'ı modalı uçurma sorunu çözüldü (Render Kilidi).
5. [x] **Z-Index Çakışması:** `.grain` katmanının `z-9999` ile tıklamaları engellemesi düzeltildi (`z-50`).

---

### 🚨 AKTİF HATALAR
1. [ ] **Mobil Hız Optimizasyonu:** Tarayıcı içi Tailwind CDN kullanımı nedeniyle ilk yükleme yavaş. (Ertelendi - Faz 3 sonrası bakılacak).
2. [ ] **İkon Flicker:** Bazı alt sayfalarda Lucide ikonları JS yüklenene kadar 0.1 saniye "zıplama" yapabiliyor. (SVG geçişi devam ediyor).

---

### 🧪 TEST EDİLECEK (Geri Bildirim Bekleyenler)
1. [ ] **Anti-Cheat Parametreleri:** 550KG barajı ve BW x 4.5 oranı gerçek kullanımda doğru tepki veriyor mu? (Kodlanınca test edilecek).
2. [ ] **Custom Edit Modal:** Yeni set düzenleme modalı mobilde her durumda çalışıyor mu? (İlk saha testi yapıldı, devam eden izleme gerekiyor).
3. [ ] **Dinlenme Süresi Takibi:** Yeni antrenman kaydedildiğinde `restTime` verisi doğru kaydedilip gösteriliyor mu? (Cihaz testi bekliyor).

---
*Not: Bir hata çözüldüğünde bu listeden silinip `DEVIR_TESLIM.md` dökümanına "Tamamlandı" olarak işlenmelidir.*
