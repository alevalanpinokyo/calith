# CALITH SMART TRAINING ENGINE v2 (Ağırlık ve Tekrar Algoritması)

Bu döküman, Calith sisteminin "Akıllı Öneri ve Gelişim" algoritmasının (Smart Engine) matematiksel altyapısını ve karar ağacını (decision tree) açıklar.

Algoritma, kullanıcının antrenman sırasındaki **"Form Durumu" (Temiz/Kirli)** ve **"Hissiyat (RPE: Hafif/İdeal/Ağır)"** geri bildirimlerini baz alarak bir sonraki setin veya antrenmanın hedefini (Ağırlık ve Tekrar) otomatik hesaplar.

---

## Temel Kurallar ve Öncelikler

1. **Öncelik Sırası:** Vücut Ağırlığı (BW) hareketlerinde kilo artışı/düşüşü olmaz, her şey "Tekrar (Reps)" veya "Saniye (Secs)" üzerinden hesaplanır. Ek ağırlıklı (Weighted) hareketlerde ise Epley ve Brzycki 1RM formülleri kullanılır.
2. **Güvenlik (Agresiflik Kontrolü):** Ağırlık artışları maksimum **%5** sınırında tutulur (Sakatlık riskini önlemek için).
3. **Yuvarlama:** Tüm ağırlıklar **0.5 kg** katlarına yuvarlanır (Örn: 12.3 kg -> 12.5 kg).

---

## 1. DURUM: "AĞIR GELDİ" veya "FORM BOZUK" Seçilirse
Kullanıcı hedefe tam olarak ulaşamamış, seti yarım bırakmış veya formu bozarak tamamlamışsa kapasite aşımı (overreaching) tespit edilir.

**Senaryo A (Ağırlıklı Hareket):**
- Sistem, hedef tekrardan ne kadar sapıldığına (kaç tekrar kaçırıldığına) bakarak ağırlığı dinamik bir yüzdeyle düşürür. (Düşük kilolarda 1RM formülü çok az kilo düşürdüğü için iptal edilip doğrudan yüzde sistemine geçilmiştir).
- **Yarı Yarıya Patladıysa:** Yapılan tekrar, hedefin yarısında veya altındaysa (örn: 10 hedeflerken 5 yapmak) -> Ağırlık **%20 düşürülür**. (Agresif ceza).
- **Yaklaştı Ama Tıkandıysa:** Hedefin yarısı geçildi ama ulaşılamadıysa (örn: 10 hedeflerken 8 yapmak) -> Ağırlık **%10 düşürülür**.
- **İstisna (Hedef Tuttu ama RPE 10):** Eğer kullanıcı hedef tekrara ULAŞTIYSA ama yine de "Ağır Geldi" dediyse (tükeniş), dinlenmesi için ağırlık sadece **%5 düşürülür**.

**Senaryo B (Vücut Ağırlığı / BW):**
- Ağırlık düşülemeyeceği için doğrudan **Hedef Tekrar Kısılır.**
- `Yeni Tekrar = Yapılan Tekrar - 2` (Minimum 1 olacak şekilde sınırlandırılır).

---

## 2. DURUM: "İDEAL" Seçilirse (HEDEFTE KAL)
Kullanıcı seti iyi bir formla, tatmin edici bir zorlukla (RPE 7.5 - 9 arası) tamamlamış demektir. Temel amaç **mevcut durumu koruyarak kas adaptasyonunu sağlamaktır.**

**Senaryo A (Ağırlıklı Hareket):**
- **Savaşçı Payı (Tolerans Sistemi):** Eğer hedef 10 tekrar ise ve kullanıcı 8 veya 9 tekrar yaptıysa (1-2 tekrar fark varsa), sistem kilo DÜŞÜRMEZ. "HEDEFE YAKINSIN - AYNI KAL" der. (Hedef tekrar 5'ten küçükse tolerans 1 tekrar, büyükse 2 tekrardır).
- Eğer tolerans payından da kötü yapıldıysa (Örn: Hedef 10, yapılan 6), o zaman 1. Durum'daki gibi 1RM formülü ile ağırlık düşürülür.
- Hedefe ulaşıldıysa ağırlık ve tekrar KORUNUR (Artırılmaz, çünkü ideal zorluktaydı).

**Senaryo B (Vücut Ağırlığı / BW):**
- Tolerans payındaysa hedef tekrar korunur ("ZORLA - HEDEFTE KAL").

---

## 3. DURUM: "HAFİF GELDİ" Seçilirse (ZORLUĞU ARTIR)
Kullanıcı seti kolayca (RPE < 7) bitirdiğini belirtmiştir. Gelişim (Progressive Overload) tetiklenir.

**Senaryo A (Ağırlıklı Hareket):**
- Eğer hedef tekrara ulaşıldıysa, ağırlık **%5 artırılır** (`Yeni Ağırlık = Ağırlık * 1.05`).
- *Mantık Kontrolü:* Eğer hedef tekrara ULAŞILAMADIYSA ama kullanıcı "Hafif Geldi" diyorsa, sistem artışa İZİN VERMEZ. Ağırlığı korur ve hedef tekrarı tamamlamasını ister. (Çünkü hafif gelen bir ağırlıkta hedef tekrara ulaşılamaması mantıksızdır, erken bırakılmış demektir).

**Senaryo B (Vücut Ağırlığı / BW):**
- Vücut ağırlığında ağırlık artırılamadığı için, dayanıklılığı artırmak adına **Hedef Tekrar %20 oranında artırılır.** (Örn: 10 tekrar yapıldıysa, yeni hedef 12 tekrar olur).

---

## ÖZET ÇIKTI MESAJLARI (UI)
Sistem yukarıdaki kararlara göre kullanıcıya şu dinamik mesajları gösterir:
* 🔴 `FORM BOZUK - DÜŞÜRÜLDÜ` / `AĞIR GELDİ - DÜŞÜRÜLDÜ`
* 🟠 `HEDEFE ULAŞMAK İÇİN DÜŞÜRÜLDÜ`
* 🔵 `HEDEFE YAKINSIN - AYNI KAL` / `İDEAL - HEDEFTE KAL` / `ZORLA - HEDEFTE KAL`
* 🟢 `HAFİF GELDİ - ARTIRILDI`

---

## 4. ANTI-CHEAT (HİLE KORUMASI) VE ANATOMİK LİMİTLER (Faz 2.5)
Kullanıcıların veya trollerin imkansız ağırlıklar (örn: 500kg Curl) girerek Liderlik Tablosunu (Leaderboard) veya kendi rekorlarını (PR) bozmasını engellemek için **Çift Katmanlı Zırh Sistemi** kullanılır. Kullanıcılar hareketleri serbest metin olarak değil, `public.exercises` kütüphanesinden otomatik tamamlama ile çektikleri için imla hatası riski yoktur.

**Katman 1: Kategori Bazlı Anatomik Limit (Hardcap)**
Her egzersizin bir kategorisi vardır ve bu kategoriye göre "Vücut Ağırlığı (BW)" çarpanı sınırları bulunur:
- **İzole Hareketler (Biceps Curl, Lateral Raise vb.):** Max `BW x 1.2`
- **Compound Üst Vücut (Bench Press, Weighted Pull-up vb.):** Max `BW x 2.5`
- **Compound Alt Vücut (Squat, Deadlift vb.):** Max `BW x 4.0`
*(Örn: 75 kg bir kullanıcı, 300kg'dan fazla Squat verisi giremez. Girmeye kalkarsa sistem reddeder).*

**Katman 2: Anormal Sıçrama Filtresi (Anti-Spike)**
Kullanıcı anatomik sınırın altında bir değer girse bile (Örn: 75kg birinin 100kg Squat girmesi serbesttir), eğer **bir önceki rekoru 20kg ise** sistem aniden 100kg girilmesini engeller.
- Formül: `Yeni Ağırlık <= Önceki Rekor * 1.5` (veya belirli bir güvenli artış limiti).
- Bu sayede hem yanlış yazımlar (10 yerine 100 yazma) hem de trollük engellenir.

---

## 5. FAZ 3: DUP (Daily Undulating Periodization) SİSTEMİ
Kullanıcının girdiği hareketin künyesinde "Heavy", "Medium" veya "Light" etiketleri bulunuyorsa, sistem doğrudan geçmiş 1RM (Maksimum Güç) verisini kullanır ve aşağıdaki yüzdelere göre çalışma ağırlığı önerir:

- **Heavy (Ağır) Gün:** 1RM'nin **%85'i**
- **Medium (Orta) Gün:** 1RM'nin **%75'i**
- **Light (Hafif) Gün:** 1RM'nin **%65'i**

Tüm hesaplamalar plaka takılabilmesi için otomatik olarak **0.5 kg** katlarına yuvarlanır. Bu sayede kullanıcı Heavy gününde rekor kırdığında, bir sonraki Medium gününde sistem ona aynı ağır kiloyu vermek yerine doğru progressive overload yüzdesini sunar.
