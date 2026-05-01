# CALITH SMART TRAINING ENGINE v2 (Ağırlık ve Tekrar Algoritması)

Bu döküman, Calith sisteminin "Akıllı Öneri ve Gelişim" algoritmasının (Smart Engine) matematiksel altyapısını ve karar ağacını (decision tree) açıklar.

---

## Temel Kurallar ve Öncelikler

1. **Öncelik Sırası:** Vücut Ağırlığı (BW) hareketlerinde kilo artışı/düşüşü olmaz, her şey "Tekrar (Reps)" veya "Saniye (Secs)" üzerinden hesaplanır. Ek ağırlıklı (Weighted) hareketlerde ise Epley ve Brzycki 1RM formülleri kullanılır.
2. **Güvenlik (Agresiflik Kontrolü):** Ağırlık artışları maksimum **%5** sınırında tutulur (Sakatlık riskini önlemek için).
3. **Yuvarlama:** Tüm ağırlıklar **0.5 kg** katlarına yuvarlanır (Örn: 12.3 kg -> 12.5 kg).

---

## 1. DURUM: "AĞIR GELDİ" veya "FORM BOZUK" Seçilirse
Kullanıcı hedefe tam olarak ulaşamamış, seti yarım bırakmış veya formu bozarak tamamlamışsa kapasite aşımı (overreaching) tespit edilir.

**Senaryo A (Ağırlıklı Hareket):**
- Sistem, hedef tekrardan ne kadar sapıldığına (kaç tekrar kaçırıldığına) bakarak ağırlığı dinamik bir yüzdeyle düşürür.
- **Yarı Yarıya Patladıysa:** Yapılan tekrar, hedefin yarısında veya altındaysa -> Ağırlık **%20 düşürülür**.
- **Yaklaştı Ama Tıkandıysa:** Hedefin yarısı geçildi ama ulaşılamadıysa -> Ağırlık **%10 düşürülür**.
- **İstisna (Hedef Tuttu ama RPE 10):** Hedefe ulaşıldıysa ama yine de "Ağır Geldi" dediyse -> Ağırlık **%5 düşürülür**.

---

## 2. DURUM: "İDEAL" Seçilirse (HEDEFTE KAL)
Kullanıcı seti iyi bir formla tamamlamıştır. Amaç adaptasyonu sağlamaktır.
- Hedefe ulaşıldıysa ağırlık ve tekrar KORUNUR.

---

## 3. DURUM: "HAFİF GELDİ" Seçilirse (ZORLUĞU ARTIR)
Gelişim (Progressive Overload) tetiklenir.
- Hedef tekrara ulaşıldıysa, ağırlık **%5 artırılır**.

---

## 4. ANTI-CHEAT VE ANATOMİK LİMİTLER (Faz 2.5)

**Katman 1: Kategori Bazlı Anatomik Limit (Hardcap)**
- **İzole Hareketler:** Max `BW x 1.2`
- **Compound Üst Vücut:** Max `BW x 2.5`
- **Compound Alt Vücut:** Max `BW x 4.0`

**Katman 2: Anormal Sıçrama Filtresi (Anti-Spike)**
- `Yeni Ağırlık <= Önceki Rekor * 1.5` (Ani 100kg artışlar engellenir).

**Katman 3: 1RM Tekrar Sınırı (Rep Cap)**
- 1RM formülleri yüksek tekrarlarda (12+) eksponansiyel olarak sapmaktadır.
- **Kural:** Rekor hesaplamalarında (PR) maksimum **12 tekrar** baz alınır. 12'den fazla yapılan tekrarlar "Dayanıklılık" verisi olarak kaydedilir ancak 1RM rekorunu imkansız seviyelere çekmemesi için formülde 12 tekrar ile sınırlandırılır.

---

## 5. FAZ 3: DUP (Daily Undulating Periodization) SİSTEMİ
- **Heavy (Ağır) Gün:** 1RM'nin **%85'i**
- **Medium (Orta) Gün:** 1RM'nin **%75'i**
- **Light (Hafif) Gün:** 1RM'nin **%65'i**

Tüm hesaplamalar plaka takılabilmesi için otomatik olarak **0.5 kg** katlarına yuvarlanır.
