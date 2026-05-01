# 🐞 CALITH - MEVCUT TEKNİK HATALAR (Anlık Takip)

Bu liste sadece aktif, teknik ve henüz çözülmemiş bugları içerir. Planlanan geliştirmeler için `yol-haritam-profile.txt`'ye, biten işler için `DEVIR_TESLIM.md`'ye bakınız.

---

### ✅ SON ÇÖZÜLEN HATALAR (1 Mayıs 2026 - Oturum #4)
1. [x] **Mükerrer Kayıt Onarımı:** Antrenman biterken butona art arda basıldığında çift kayıt atma sorunu `isSavingWorkout` kilidi ile çözüldü.
2. [x] **1RM Rep-Cap (Güvenlik):** 12+ tekrar girildiğinde 1RM formülünün anatomik olmayan seviyelere fırlaması engellendi (Max 12 rep cap).
3. [x] **Reset Butonu Güvenliği:** "Verileri Sıfırla" butonunun antrenman geçmişini (Raporları) silmesi engellendi, sadece PR'ları temizleyecek şekilde kısıtlandı.
4. [x] **PR Kirliliği & Tekli Silme:** Rekorlar tablosuna tekli silme (X) butonu eklendi, test verilerinin ayıklanması sağlandı.
5. [x] **Geri Bildirim Kapatma:** Geri bildirim modalına "X" (Vazgeç) butonu eklendi.
6. [x] **0 KG Koruması:** Ağırlıklı hareketlerde 0 kg girilince uyarı sistemi aktif edildi.
7. [x] **Wake Lock Onarımı:** Chrome Mobilde ekranın kararması sorunu `screen.keepAwake` (veya legacy fallback) ile çözüldü.
8. [x] **Atlanan Hareket Kaydı:** Atlanan hareketlerin `skipped: true` olarak işlenmesi ve raporlarda görünmesi sağlandı.

---

### 🚨 AKTİF HATALAR (Bug Fix Operasyonu)
*Şu an bilinen aktif bir teknik hata bulunmamaktadır. Tertemiziz kanka!* 🚀

---

### 🧪 TEST EDİLECEK (Geri Bildirim Bekleyenler)
1. [ ] **Anti-Cheat Parametreleri:** BW x 2.5 (Üst) ve BW x 4.0 (Alt) oranları gerçek kullanımda doğru tepki veriyor mu?
2. [ ] **Custom Edit Modal:** Yeni set düzenleme modalı mobilde her durumda stabil mi?
3. [ ] **PR Birimleri:** Yeni SN, TK, KG birimleri tüm kartlarda doğru görünüyor mu?

---
*Not: Bir hata çözüldüğünde bu listeden silinip `DEVIR_TESLIM.md` dökümanına "Tamamlandı" olarak işlenmelidir.*
