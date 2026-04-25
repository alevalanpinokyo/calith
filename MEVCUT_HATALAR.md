# CALITH - MEVCUT HATALAR VE DEVİR TESLİM RAPORU
**Tarih:** 2026-04-25  
**Versiyon:** v=202604251524  
**Devreden:** Antigravity AI (bf6a6599-8438-46f9-b0e6-2652f90c3cd2)

---

## ⚠️ AKTİF HATA: Set Tamamlama Sonrası Siyah Ekran

### Sorunun Özeti
Kullanıcı antrenman sırasında bir seti tamamlayıp **"SETİ TAMAMLA"** butonuna bastığında:
1. `showSetFeedbackModal(weight, reps)` açılıyor ✅
2. Kullanıcı Form (Temiz/Kirli) ve RPE (Hafif/İdeal/Ağır) seçiyor ✅
3. **"ANALİZ ET VE DEVAM ET"** butonuna basıyor
4. Modal kapanıyor ✅
5. **Ekran SİYAH kalıyor** ❌ (dinlenme sayacı görünmüyor)

### Teşhis Süreci (Neler Denendi)
1. `startRestTimer()` çift çağrısı kaldırıldı → **Düzelmedi**
2. `updateWorkoutUI()` çakışması kaldırıldı → **Düzelmedi**
3. `startRestTimer()` null-safe yapıldı → **Düzelmedi**
4. `submitSetFeedback`'e `scrollTop=0` eklendi → **Düzelmedi**
5. `submitSetFeedback`'e try-catch + konsol log eklendi → **TEST BEKLİYOR**

### Şu An Kodun Durumu
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
| Kalibrasyon Rehberi Modal | ✅ Kod tamam, **Set Tamamlama sorunu yüzünden test edilemedi** |
| "Temiz mi?" + RPE Geri Bildirim Modal | ✅ Kod tamam, **Set Tamamlama sorunu yüzünden test edilemedi** |
| Akıllı Öneri (💡 ÖNERİLEN: X KG) | ✅ Kod tamam, **Set Tamamlama sorunu yüzünden test edilemedi** |
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
| `submitSetFeedback(w, r)` | ~5672 | **SORUNLU** - siyah ekranın kaynağı burada aranıyor |
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
4. Kullanıcı soru soruyorsa önce konuş, sonra kod yaz
