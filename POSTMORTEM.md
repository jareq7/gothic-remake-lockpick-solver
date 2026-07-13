# Postmortem

Zapis błędów popełnionych podczas budowy tego narzędzia — co poszło źle, dlaczego, i co z tego wynikło. Nie jest to samobiczowanie: każda z tych pomyłek zamieniła się w konkretną decyzję projektową albo w test, a bez zrozumienia *dlaczego* łatwo je cofnąć w ramach „upraszczania".

Sesja: 12–13 lipca 2026.

---

## 1. Podstawiony domysł udający odpowiedź

**To jest główny wzorzec tej sesji. Ta sama choroba wróciła trzy razy.**

### Co było źle

**Formularz nauki miał zaznaczoną odpowiedź z góry.** Pytając „co zrobiła każda zapadka po tym ruchu?", ustawiałem domyślnie **„nie ruszyła się"** dla wszystkich poza tą, którą przesuwasz. Jeśli gracz przeoczył drgnięcie dalekiej zapadki — a przeoczał, bo patrzy na płytkę, którą rusza — jego przeoczenie **zapisywało się jako fakt**.

**Krok 1 z góry ustawiał wszystkie zapadki na środku.** Nie tknąłeś płytki? Znaczy, że jej zapadka jest wyśrodkowana. To samo, tylko w innym miejscu.

**Formularz pytał o interpretację, nie o fakt.** „Czy zapadka poszła w tę samą stronę, czy w przeciwną?" wymaga porównania w głowie dwóch kierunków. „W którym otworze siedzi?" wymaga tylko spojrzenia.

### Dlaczego to było groźne

Zmierzyłem to: **3 na 4 takie pomyłki są niewykrywalne**. Nie dają błędu — dają zamek, który wygląda na poprawny, ma rozwiązanie i produkuje pewną siebie sekwencję. Tyle że złą. Narzędzie, którego jedynym zadaniem jest nie wyginać wytrychów, spokojnie kazało je wyginać.

Gracz zgłosił to jako *„zaproponowana ścieżka jest od startu zła, nie mogę wykonać nawet 1 kroku"*.

### Jak naprawione

Faza nauki pyta teraz: **kliknij otwór, w którym teraz siedzi każda zapadka**. Kierunki wyliczam sam. Nie da się iść dalej bez potwierdzenia wszystkich. Przycisk „Reszta bez zmian" istnieje, ale to **jawna deklaracja** („sprawdziłem, reszta stoi"), a nie podstawiony domysł — i **ta różnica jest tu wszystkim**.

Krok 1 startuje pusty: dopóki nie odczytasz każdej zapadki, przycisk „Dalej" jest zablokowany.

Pilnują tego: `discovery.test.js` (108 zamków, zero ruchów odrzuconych przez grę), `ergonomics.test.js` (skrót „Reszta" nie odtwarza starego błędu na 50 zamkach), `mobile.test.js`.

### Wniosek na przyszłość

**W interfejsie, którego wyjście steruje czymś realnym, żadna odpowiedź nie może być podstawiona.** Pytaj o fakt, nie o interpretację. Jedno kliknięcie więcej jest tańsze niż cichy błąd.

---

## 2. Diagnozowanie użytkownika zamiast danych

### Co było źle

Napisałem graczowi, że *„człowiek jest słaby w wyłapywaniu drgnięć"*. Odpowiedział — słusznie — że gra na mistrzowskim poziomie otwierania zamków i widzi ten zamek lepiej niż ja.

Miał rację. Problemem nie było jego oko. Problemem był **mój formularz**, który kazał mu robić rzecz trudną (porównywać kierunki) zamiast łatwej (odczytać pozycję).

### Wniosek

Gdy użytkownik zgłasza błąd, jego opis jest zwykle precyzyjny i trafny. **Odtwórz jego przypadek w teście na jego liczbach**, zanim zaczniesz wnioskować o jego percepcji. Dwa razy w tej sesji postawiłem złą diagnozę, bo szukałem winy po jego stronie zamiast w projekcie interfejsu.

---

## 3. Diagnostyka oparta na danych, które sama podważa

### Co było źle

Gdy sekwencja zgrzytała w grze, aplikacja próbowała wskazać winowajcę — ale wnioskowała z **pozycji zapadek, które sama wyliczyła z podejrzanych powiązań**. Jeśli powiązania kłamią, to i śledzony stan zamka kłamie. Diagnoza z takiego stanu jest bez wartości.

### Jak naprawione

Zgrzyt zgłoszony **na pierwszym kroku** to twardy dowód: pozycję znamy na pewno (to układ z kroku 1), więc da się policzyć, która komórka macierzy ma odwrotny znak. Zgrzyt zgłoszony **później** — aplikacja **nie zgaduje**. Mówi wprost: „nie mam z czego wnioskować, wróć do kroku 0 i powtórz pierwszy ruch".

Pilnuje tego `grind.test.js`.

### Wniosek

Zanim zbudujesz wnioskowanie, sprawdź, czy przesłanki nie pochodzą z tego samego źródła, które podważasz.

---

## 4. Testy trzymające własną kopię logiki

### Co było źle

Pierwsze testy miały **skopiowaną funkcję `solve()`** obok aplikacji. Kopia może się rozjechać z oryginałem — i wtedy testy przechodzą, testując coś, czego nie ma w produkcie.

### Jak naprawione

`tests/harness.js` **wyciąga prawdziwy skrypt wprost z `index.html`** i uruchamia go na atrapie DOM-u; `solve()` też jest wydobywane z pliku, nie przepisywane. Testy nie mogą już testować czegoś innego niż to, co działa u gracza.

### Wniosek

Test, który zawiera kopię testowanego kodu, nie testuje niczego poza sobą.

---

## 5. Założenia o mechanice gry, których nie sprawdziłem

### Kolejność nauki

Założyłem, że płytki da się rozpoznawać po kolei: 1, 2, 3… Gracz trafił na zamek, w którym **płytka 2 była w układzie startowym zablokowana w obie strony** (sprzężona z zapadkami przy przeciwnych krawędziach). Nauka stawała i nie miała jak ruszyć.

**Naprawa:** kolejność jest swobodna. Płytkę można pominąć i wrócić do niej, gdy inne ruchy zrobią jej miejsce. Gdy wszystko utknie, aplikacja proponuje bezpieczny **ruch uwalniający** na już poznanej płytce — a odczyt po nim służy jako darmowa kontrola tej płytki. (`jammed-plate.test.js`)

### Punkt startowy sekwencji

Liczyłem sekwencję **od stanu po ruchach próbnych**. To znaczyło, że każdy błąd obserwacji z nauki **wsiąkał w pozycję startową**. Gracz zgłosił: *„ustawienie, które wpisałem, było zmienione".*

Tymczasem gra ma **Reset** (klawisz `R` / `Y`), który cofa zamek do układu wyjściowego — **i nic nie kosztuje**.

**Naprawa:** nauka kończy się prośbą o Reset. Sekwencja liczona jest od układu z kroku 1 — jedynego, który znamy na pewno. Nauka przestała mieć jakikolwiek wpływ na pozycję startową.

### Wniosek

Zanim zaprojektujesz przepływ, sprawdź, **jakie ruchy gra realnie dopuszcza i jakie ma własne narzędzia**. Reset był w grze od początku; wystarczyło go użyć.

---

## 6. Nadinterpretacja zrzutu ekranu

Naliczyłem **11 otworów** na zrzucie z gry i zacząłem podważać cały model (jest ich 7). Szyny sąsiednich płytek nachodzą na siebie w perspektywie i zlewają się w jeden dłuższy rząd.

**Wniosek:** nie wyciągaj wniosków z obrazka, gdy masz pod ręką kogoś, kto ma tę grę uruchomioną. Zapytaj.

---

## 7. Rzeczy powiedziane nieprawdziwie

- **„Google karze nazwy przeładowane słowami kluczowymi."** Nieprawda. Google nie nakłada za to kary — po prostu **prawie nie nagradza** dopasowania frazy w adresie. To zupełnie co innego i musiałem to odwołać.
- **„GitHub przekieruje stary adres po zmianie nazwy repo."** Nieprawda dla GitHub Pages — stary adres zwrócił **404**. Przekierowanie dostaje repozytorium, nie strona.

**Wniosek:** nie podawaj mechanizmów, których nie zweryfikowałeś, tonem pewnym. Sprawdź albo powiedz, że nie wiesz.

---

## 8. Higiena gita

Pierwsze commity podpisałem adresem e-mail wziętym **z kontekstu sesji**, zamiast zapytać. Gracz słusznie zareagował.

Przy naprawie wyszło coś, o czym łatwo zapomnieć: **`git filter-branch` zostawia stare commity w `refs/original`**, a nieosiągalne obiekty żyją dalej w repozytorium. Samo przepisanie historii **nie wystarcza** — trzeba usunąć kopie zapasowe, wygasić reflog i przepuścić `gc --prune=now`. Sprawdziłem potem każdy obiekt w repo, żeby mieć pewność, że stary adres zniknął.

Osobno: użyłem słowa **„repo"** potocznie, mówiąc o katalogu projektu, co zabrzmiało jak publikacja kodu. Uzasadniony niepokój.

**Wniosek:** dane osobowe w commitach są trwałe. Pytaj, zanim je wpiszesz. I nazywaj rzeczy dokładnie.

---

## 9. Pisanie w cudzym imieniu

W README napisałem, że narzędzie powstało z frustracji **łamanymi wytrychami**. **Zmyśliłem to**, bo pasowało mi do narracji.

Prawdziwy powód, podany przez autora: niektóre zamki są tak trudne, że **nawet z mistrzowskim poziomem umiejętności** siedział nad nimi w kółko, tracąc czas i irytując się — a istniejące solvery są zbyt skomplikowane albo niewygodne.

**Wniosek:** pisząc cokolwiek w czyimś imieniu, używaj **wyłącznie tego, co ta osoba powiedziała**. Zmyślona historia w publicznym README to kłamstwo pod cudzym nazwiskiem.

---

## Co z tego wynika dla następnej sesji

Trzy rzeczy, w tej kolejności:

1. **Nie podstawiaj domysłów jako odpowiedzi.** Jeśli formularz ma domyślną wartość, zapytaj siebie, co się stanie, gdy użytkownik ją przeklika bez patrzenia.
2. **Test musi jeździć po symulowanej grze, która odrzuca nielegalne ruchy.** Bez tego nie masz dowodu, że narzędzie nie wygina wytrychów — masz tylko nadzieję.
3. **Gdy użytkownik zgłasza błąd, odtwórz jego przypadek na jego liczbach.** Zanim zaczniesz tłumaczyć, dlaczego się myli.
