# Solver zamków — Gothic 1 Remake

Jednoplikowa aplikacja webowa. **`index.html` to całość produktu**: HTML, CSS i JS w jednym pliku, zero zależności, zero budowania. Działa z `file://` (dwuklik) i z GitHub Pages.

```
open index.html      # uruchom
./tests/run.sh       # 10 zestawów testów
```

- Repo: `github.com/jareq7/gothic-remake-lockpick-solver` (publiczne)
- Na żywo: `https://jareq7.github.io/gothic-remake-lockpick-solver/`
- Push działa **bez `gh`** — poświadczenia HTTPS siedzą w Keychainie macOS. Do API GitHuba token wyciąga się przez `git credential fill` (**nigdy go nie wypisuj na ekran**).

---

## Niezmiennik nadrzędny

**Narzędzie nigdy nie może podać ruchu, który wygina wytrych.**

W grze wytrych gnie się wyłącznie wtedy, gdy ruch wypchnąłby którąkolwiek zapadkę — także tę pociągniętą przez sprzężenie — poza otwory 1–7. Nic innego nie kosztuje.

Każda zmiana dotykająca modelu zamka musi przejść testy przejeżdżające całą sekwencję po **symulowanej grze, która odrzuca nielegalne ruchy**. To nie jest formalność: narzędzie dwa razy z pełnym przekonaniem podało sekwencję zgrzytającą na pierwszym kroku. Zobacz [`POSTMORTEM.md`](POSTMORTEM.md).

---

## Model zamka

- 4–7 płytek, każda z **7 otworami**. Cel: wszystkie zapadki w środkowym, **4. otworze**.
- Ruch = wybór płytki (**góra/dół**) + przesunięcie (**lewo/prawo**). Gra pisze „Move left/right" — **nie ma tu klawiszy A/D**.
- Przesunięcie płytki przesuwa też zapadki płytek z nią sprzężonych, o jeden otwór, w tę samą albo przeciwną stronę. Sprzężenia są **stałe dla skrzyni i wzajemne** (jeśli A ciągnie B, to B ciągnie A) — jednostronne powiązanie w danych to prawie zawsze błąd odczytu.
- **Płytka 1 = najbliższa, na dole stosu** — ta, na której stoi kursor po każdym resecie. W podglądzie rysowana na dole.
- **Reset w grze (`R` / `Y`) nic nie kosztuje** i cofa zamek do układu wyjściowego.

**Reprezentacja:** `S.pos[i]` = otwór zapadki płytki `i` (0–6, cel 3; `-1` = jeszcze nieodczytana). `S.E[i][j]` = o ile przesunie się zapadka `j`, gdy płytkę `i` pchniesz **w prawo** (−1, 0 lub +1). Ruch w lewo to `-E[i]`.

**Solver:** BFS po pełnej przestrzeni stanów (najwyżej 7⁷ = 823 543), pomijający każdy ruch wyprowadzający jakąkolwiek zapadkę poza zakres. Zwraca dowód najkrótszej bezpiecznej drogi albo `null`.

**Własność, na której to stoi:** ruchy są **przemienne**. Liczba naciśnięć na każdą płytkę jest z góry przesądzona; wolna jest tylko kolejność, a jej jedynym zadaniem jest omijanie krawędzi.

---

## Decyzje, których nie wolno cofnąć

Każda powstała po tym, jak narzędzie zawiodło na prawdziwej skrzyni. Uzasadnienia: [`POSTMORTEM.md`](POSTMORTEM.md).

### Nauka pyta o fakt, nie o interpretację

Pyta **„gdzie teraz stoi każda zapadka"**, nie „która drgnęła". Pierwsza wersja kazała klasyfikować ruch jako „w tę samą / w przeciwną stronę" — jedna odwrócona komórka wystarczała, żeby sekwencja wyginała wytrychy, a **3 na 4 takie pomyłki przechodziły niezauważone**.

**Nic nie jest podstawione z góry.** Nie da się iść dalej bez potwierdzenia wszystkich zapadek. Przycisk „Reszta bez zmian" to **jawna deklaracja**, nie domyślna wartość — ta różnica jest tu wszystkim. To samo dotyczy kroku 1: startuje pusty, bez zapadek ustawionych na środku.

### Odczyt porównuje się ze stanem sprzed tego jednego ruchu

Nie z krokiem 0. Zamek kumuluje ruchy próbne. Stąd reguła „najwyżej jeden otwór na ruch" — i stąd w fazie nauki **aktywne są tylko 3 z 7 otworów** (osiągalne jednym ruchem). Niemożliwego odczytu nie da się nawet kliknąć.

### Nauka kończy się prośbą o Reset w grze

Sekwencja liczona jest od układu z kroku 1 — jedynego, który znamy na pewno. Dzięki temu błędy z nauki nie wsiąkają w pozycję startową. Reset jest darmowy, więc nauka nic nie kosztuje.

### Kolejność nauki jest swobodna

Płytka bywa w układzie startowym **zablokowana w obie strony** (sprzężona z zapadkami przy przeciwnych krawędziach). Można ją pominąć i wrócić; gdy wszystko utknie, aplikacja proponuje bezpieczny **ruch uwalniający** na już poznanej płytce — a odczyt po nim służy jako darmowa kontrola tej płytki.

### Kierunek proponowany z pozycji zapadki

Konwencji („czy ruch w prawo przesuwa zapadkę w prawo" — gra bywa lustrzana) aplikacja **uczy się z pierwszej płytki** i od drugiej nie proponuje już ruchu, którego zapadka nie może wykonać. Naukę zaczyna od płytki najdalszej od krawędzi — najmniej podatnej na zablokowanie.

### Zgrzyt na kroku 1 to dowód; zgrzyt później nie jest

Na kroku 0 pozycję znamy na pewno, więc da się wyliczyć, która komórka ma odwrotny znak. Po kilku ruchach śledzona pozycja zapadek sama opiera się na podejrzanych powiązaniach — wtedy aplikacja **nie zgaduje**, tylko każe wrócić do kroku 0.

### Kontrola wzajemności powiązań

Sprzężone płytki ciągną się w tej grze **wzajemnie**. Jednostronne powiązanie w wyuczonej macierzy to sygnał przeoczonego odczytu — aplikacja ostrzega, zamiast pewnie liczyć z podejrzanych danych.

### Jeden słownik na oba języki

Wszystkie 105 komunikatów żyje w `STR{pl,en}` + `t()` z podstawieniami `{name}`. **Żaden tekst nie istnieje poza słownikiem**, więc komunikat nie może istnieć w jednym języku tylko — `i18n.test.js` porównuje zbiory kluczy. Liczba mnoga idzie przez jedną bramkę (`pl3`): polski ma trzy formy, angielski dwie. Nowy odwiedzający dostaje język przeglądarki.

---

## Interfejs pod telefon

Narzędzia używa się jedną ręką, gdy druga gra.

- **Cele dotykowe liczone z viewportu**: `--hole: min(44px, calc((100vw - 96px) / 7))`. Zamek mieści się bez przewijania w bok od iPhone'a SE po Pro Max. Wcześniej otwory miały 20 px.
- **Pasek kciuka** (`#thumbBar`): przyklejony na dole, pokazuje bieżące zadanie i **komplet akcji fazy**. Wywołuje **te same funkcje** co przyciski w kartach — nie ma drugiego źródła prawdy, `mobile.test.js` to sprawdza.
- **Stopniowe odsłanianie**: fazy (`#phases`) + przełącznik `Ukryj opisy` (zapamiętywany). Opisy mają klasę `.help`.
- **Safari**: pola `16px` (poniżej przybliża stronę), `:hover` wyłączony w `@media (hover: none)` (inaczej podświetlenie zostaje przyklejone), `touch-action: manipulation`, brak `-webkit-tap-highlight`, `user-select: none` na zamku.
- **Safe-area** dla Dynamic Island i paska gestów; metatagi „Dodaj do ekranu początkowego"; `theme-color`.

---

## Testy

`tests/harness.js` uruchamia **prawdziwy skrypt wyjęty z `index.html`** na atrapie DOM-u i wydobywa z niego `solve()`. **Testy nie mają własnych kopii logiki** — nie mogą się z aplikacją rozjechać. Atrapa zna z góry wszystkie `id` z pliku i symuluje najgorszy przypadek (`navigator` bez schowka).

| plik | czego pilnuje |
|---|---|
| `solver.test.js` | 4000 losowych zamków: żadna ścieżka nie dotyka krawędzi, każda kończy się otwarciem |
| `discovery.test.js` | 108 zamków przeciwko symulowanej grze: nauka odtwarza prawdziwe powiązania, sekwencja nie zgrzyta; niemożliwy odczyt jest nieklikalny |
| `signs.test.js` | lewo/prawo: sprzężenie przeciwne + zapadka zaparta o krawędź; strzałka zawsze zgodna ze słowem |
| `jammed-plate.test.js` | płytka zablokowana w obie strony — nauka się nie zakleszcza |
| `grind.test.js` | zgrzyt na kroku 1 wskazuje odwróconą komórkę; zgrzyt po ruchach nie jest zgadywany |
| `one-sided-links.test.js` | ostrzeżenie o jednostronnych powiązaniach |
| `ergonomics.test.js` | skrót „Reszta bez zmian" nie odtwarza starego błędu (50 zamków); tylko osiągalne otwory aktywne |
| `mobile.test.js` | pasek kciuka prowadzi do **identycznego stanu zamka** co przyciski w kartach |
| `transfer.test.js` | eksport → inna przeglądarka → import kończy się otwarciem zamka; 7 prób wepchnięcia śmieci odbitych |
| `i18n.test.js` | zbiory kluczy PL i EN identyczne; cały przepływ po angielsku; zmiana języka nie rusza zamka |
| `core.test.js` | numeracja, panel powiązań, Reset do kroku 0, biblioteka skrzyń |

---

## Co dalej

1. **Obsługa klawiatury** — dziś zerowa. Klawisze 1–7 = pozycja zapadki, góra/dół = wybór płytki (jak w grze), Enter = zatwierdź, spacja = „Zrobione".
2. **Eksport/import jest gotowy, ale ukryty** — jedna klasa `hidden` na `#transferBox`. Odsłonić, gdy trzeba przenieść skrzynie. Uwaga: `localStorage` jest per-origin, więc skrzynie z `file://` są niewidoczne dla wersji na `github.io`.
3. **Wbudowane skrzynie.** Raz rozpoznana skrzynia w Starym Obozie jest ta sama u wszystkich graczy — wszycie gotowej biblioteki oszczędza każdemu 25 kliknięć. Żaden konkurencyjny solver tego nie ma.
4. Drobiazgi: „Nowy zamek" kasuje bez potwierdzenia; brak cofnięcia pojedynczej płytki w nauce (tylko reset całości).

---

## Jak tu pracować

Autor gra na **mistrzowskim poziomie otwierania zamków** i czyta zamek lepiej niż Ty z opisu.

- **Gdy zgłasza błąd — odtwórz jego przypadek w teście na jego liczbach**, zanim zaczniesz wnioskować. Jego opis jest zwykle precyzyjny i trafny.
- **Nie pisz w jego imieniu rzeczy, których nie powiedział.** Dotyczy README, opisu repo, wszystkiego publicznego.
- **Teksty: sucho.** Bez pierwszej osoby, bez superlatywów, bez porównań z konkurencją. Fakty o tym, co narzędzie robi.
- **Wygląd: płasko.** Bez skosów, perspektywy i schodkowego stosu płytek.
