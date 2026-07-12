# Wytrych — solver zamków do Gothic 1 Remake

Jednoplikowa aplikacja webowa. `index.html` to **całość produktu**: HTML, CSS i JS w jednym pliku, zero zależności, działa z `file://` (dwuklik). Nie ma budowania, nie ma npm-a w produkcie.

Uruchomienie: `open index.html`
Testy: `./tests/run.sh`

## Niezmiennik nadrzędny

**Narzędzie nigdy nie może podać ruchu, który wygina wytrych.** Wszystko inne jest temu podporządkowane. W grze wytrych gnie się wyłącznie wtedy, gdy ruch wypchnąłby którąkolwiek zapadkę — także tę pociągniętą przez sprzężenie — poza otwory 1–7.

Każda zmiana dotykająca modelu zamka musi przejść testy, które przejeżdżają całą sekwencję po **symulowanej grze odrzucającej nielegalne ruchy**. To nie jest formalność: dwa razy w historii tego projektu narzędzie z pełnym przekonaniem podało sekwencję, która zgrzytała na pierwszym kroku.

## Model zamka

- 4–7 płytek, każda z **7 otworami**. Cel: wszystkie zapadki w środkowym, **4. otworze**.
- Ruch = wybór płytki (góra/dół) + przesunięcie (**lewo/prawo** — gra pisze „Move left/right", nie ma klawiszy A/D).
- Przesunięcie płytki przesuwa też zapadki płytek z nią sprzężonych, o jeden otwór, w tę samą albo przeciwną stronę. **Sprzężenia są stałe dla skrzyni i wzajemne** (jeśli A ciągnie B, to B ciągnie A) — jednostronne powiązanie w danych to prawie zawsze błąd odczytu.
- **Płytka 1 = najbliższa, na dole stosu** — ta, na której stoi kursor po każdym resecie. W podglądzie rysowana na dole.
- **Reset w grze (R / Y) nic nie kosztuje** i cofa zamek do układu wyjściowego.

Reprezentacja: `S.pos[i]` = otwór zapadki płytki `i` (0..6, cel 3). `S.E[i][j]` = o ile przesunie się zapadka `j`, gdy płytkę `i` pchniesz **w prawo** (−1, 0 lub +1). Ruch w lewo to `-E[i]`.

Solver: BFS po pełnej przestrzeni stanów (najwyżej 7⁷ = 823 543), pomijający każdy ruch, który wyprowadziłby jakąkolwiek zapadkę poza zakres. Zwraca dowód najkrótszej bezpiecznej drogi albo `null`.

## Decyzje, których nie cofać

Każda z nich powstała po tym, jak narzędzie zawiodło na prawdziwej skrzyni.

**Krok 2 pyta „gdzie teraz stoi każda zapadka", nie „która drgnęła".** Pierwsza wersja kazała graczowi klasyfikować ruch jako „w tę samą / w przeciwną stronę". Jedna odwrócona komórka wystarczała, żeby cała sekwencja wyginała wytrychy — a zmierzone **3 na 4 takie pomyłki przechodziły niezauważone**, dając zamek pozornie poprawny. Odczyt pozycji jest faktem, klasyfikacja kierunku jest interpretacją. Nie wolno iść dalej bez odczytania **wszystkich** zapadek.

**Odczyt porównuje się ze stanem sprzed tego jednego ruchu, nie z krokiem 0.** Zamek kumuluje ruchy próbne. Stąd reguła „najwyżej jeden otwór na ruch" i odrzucanie odczytów, które ją łamią.

**Rozpoznanie kończy się prośbą o Reset w grze.** Sekwencja liczona jest od układu z kroku 1 — jedynego, który znamy na pewno. Dzięki temu błędy z rozpoznania nie wsiąkają w pozycję startową.

**Kolejność rozpoznawania jest swobodna.** Płytka bywa w układzie startowym zablokowana w obie strony (sprzężona z zapadkami przy przeciwnych krawędziach). Można ją pominąć i wrócić; gdy wszystko utknie, aplikacja proponuje bezpieczny „ruch uwalniający" na już poznanej płytce — a odczyt po nim służy jako darmowa kontrola tej płytki.

**Zgrzyt na kroku 1 to dowód; zgrzyt później nie jest.** Na kroku 0 pozycję znamy na pewno, więc da się wyliczyć, która komórka ma odwrotny znak. Po kilku ruchach śledzona pozycja zapadek sama opiera się na podejrzanych powiązaniach — wtedy aplikacja **nie zgaduje**, tylko każe wrócić do kroku 0.

## Testy

`tests/harness.js` uruchamia **prawdziwy skrypt wyjęty z `index.html`** na atrapie DOM-u i wydobywa z niego `solve()`. Testy nie mają własnych kopii logiki — nie mogą się z aplikacją rozjechać.

| plik | czego pilnuje |
|---|---|
| `solver.test.js` | 4000 losowych zamków: żadna ścieżka nie dotyka krawędzi, każda kończy się otwarciem |
| `discovery.test.js` | 108 zamków przejechanych przeciwko symulowanej grze: rozpoznanie odtwarza prawdziwe powiązania, sekwencja nie zgrzyta |
| `signs.test.js` | lewo/prawo: sprzężenie przeciwne + zapadka zaparta o krawędź; strzałka zawsze zgodna ze słowem |
| `jammed-plate.test.js` | płytka zablokowana w obie strony w układzie startowym — rozpoznanie się nie zakleszcza |
| `grind.test.js` | zgrzyt na kroku 1 wskazuje odwróconą komórkę; zgrzyt po ruchach nie jest zgadywany |
| `one-sided-links.test.js` | ostrzeżenie o jednostronnych powiązaniach |
| `core.test.js` | numeracja, panel powiązań, Reset do kroku 0, biblioteka skrzyń |

## Backlog

Uszeregowany audyt UX z 2026-07-12:

1. **Krok 2: mniej klikania, zamek na widoku.** Jeden ruch zmienia zapadkę najwyżej o otwór, więc osiągalne są tylko 3 otwory z 7 — resztę wygasić i zablokować. Podgląd zamka przykleić do góry (dziś sticky jest boczny panel, a zamek ucieka przy przewijaniu).
2. **Obsługa klawiatury.** Dziś zerowa. Klawisze 1–7 = pozycja zapadki, góra/dół = wybór płytki (jak w grze), Enter = zatwierdź, spacja = „Zrobione".
3. **Odchudzić krok 2** (siedem akapitów) i dodać wskaźnik postępu 1 → 2 → 3.
4. **Eksport / import biblioteki** + wersja angielska. Skrzynia w Starym Obozie jest ta sama u wszystkich — raz rozpoznana oszczędza 25 kliknięć każdemu graczowi. Żaden konkurencyjny solver tego nie ma.
5. Drobiazgi: „Nowy zamek" kasuje bez potwierdzenia; brak cofnięcia pojedynczej płytki w rozpoznaniu; otwory 26 px to za mało dla palca na telefonie.
