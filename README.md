# Gothic 1 Remake — Lockpick Solver

**[▶ Open the solver](https://jareq7.github.io/gothic-remake-lockpick-solver/)** — works in the browser, on desktop and phone. No install, no account, no internet needed after the first load.

Tell it where the pins are sitting; it computes the **shortest sequence of moves in which no pin ever hits an edge** — so your lockpick never bends.

*[Po polsku ↓](#gothic-1-remake--solver-zamków)*

---

## How it works

**1 · Setup.** Pick the number of plates and click the hole where each pin currently sits. Plate 1 is the nearest one, at the bottom — the plate the cursor lands on after every reset.

**2 · Learn.** The links between plates are fixed for a chest, but they have to be discovered. The solver asks for one move per plate, and after each move you **read the lock back: click the hole where each pin now sits**. It works the directions out itself — you never have to judge what went "the same way" and what went "the opposite way".

If a plate is jammed in both directions, skip it and come back. At the end, press **Reset** in game (`R`, or `Y` on a pad) — the lock returns to its starting layout, so learning costs you nothing.

**3 · Solve.** One instruction at a time: which plate, which way, how many times. The links and a live picture of the lock stay on screen. You can jump back to the starting layout, or fix a pin by clicking straight on the lock.

## Details

The only input is what is visible on screen: **which hole each pin sits in**. Directions are derived from the readings, never assumed — if the game draws the movement mirrored, that inversion is recorded during the learning step.

The solver searches the whole state space (at most 7⁷ = 823,543 positions) and returns the shortest sequence in which no pin — moved or dragged — ever leaves its plate. If no such sequence exists, it says so instead of guessing.

**Consistency checks.** The solver validates its own model rather than trusting it:

- Warns when the learned links come out one-sided. Coupled plates in this game pull each other *both* ways, so a one-way link means a misread.
- Rejects physically impossible readings — a pin cannot move more than one hole per move.
- On a grind reported at the first move, identifies **which link must have been recorded with the wrong sign**, instead of returning another sequence that bends the pick.

**Chest library.** A chest can be saved under a name. On the next visit it is recognised by its starting layout and the sequence is ready immediately — nothing to re-enter.

## Built for the phone

The tool is used in one hand while the other one plays, so the interface is designed for the thumb, not the mouse.

- **Touch targets sized from the viewport.** Holes scale with screen width up to 44 px — Apple's minimum — and the lock fits without horizontal scrolling from an iPhone SE to a Pro Max.
- **Only reachable holes are live.** A pin moves at most one hole per move, so during the learning step just 3 of the 7 holes accept a tap. Bigger effective target, and an impossible reading can't even be entered.
- **Thumb bar.** A fixed bar at the bottom shows the one thing to do right now and carries every action for the current phase — so a whole lock is solved without scrolling. It calls the same handlers as the buttons in the cards; there is no second source of truth.
- **Progressive disclosure.** Phases (Setup / Learn / Solve) and a *hide notes* switch that is remembered. Explanations are worth reading once and are noise on the twentieth lock.
- **Safari specifics.** 16 px inputs (below that, Safari zooms the page on focus), `:hover` neutralised on touch (otherwise a highlight latches on after a tap), no 300 ms tap delay, no tap-flash, no text selection while tapping fast.
- **Fits the hardware.** Safe-area insets for the Dynamic Island and the home indicator. Installable to the home screen, runs full-screen, works offline after the first load.
- **Light and dark**, following the system, with a manual override.

## A tip from outside the tool

Train lockpicking with **Fingers**, by the arena in the Old Camp (10 LP + 100 ore). Your pick then survives 4 bends instead of 2, breaking one no longer resets the lock, and the locks themselves get fewer links.

## Development

Single file, no dependencies, no build step: `index.html` **is** the product. Open it and it runs.

```
open index.html      # run it
./tests/run.sh       # 9 test suites
```

The tests drive the **real script lifted out of `index.html`** against a simulated game that refuses illegal moves — so they can never drift from the app. Architecture and the decisions that must not be reverted: [`CLAUDE.md`](CLAUDE.md).

---

# Gothic 1 Remake — Solver zamków

**[▶ Otwórz solver](https://jareq7.github.io/gothic-remake-lockpick-solver/)** — działa w przeglądarce, na komputerze i na telefonie. Bez instalacji, bez konta, bez internetu po pierwszym wczytaniu.

Mówisz mu, gdzie stoją zapadki; on liczy **najkrótszą sekwencję ruchów, w której żadna zapadka nie uderzy o krawędź** — czyli bez wyginania wytrycha.

## Jak to działa

**1 · Ustawienie.** Wybierasz liczbę płytek i klikasz otwór, w którym *w tej chwili* siedzi każda zapadka. Płytka 1 to ta najbliższa, na dole — ta, na której staje kursor po każdym resecie.

**2 · Nauka.** Powiązania między płytkami są dla skrzyni stałe, ale trzeba je poznać. Solver prosi o jeden ruch na płytkę, a Ty po każdym **odczytujesz zamek: klikasz, w którym otworze siedzi teraz każda zapadka**. Kierunki wylicza sam — nie musisz oceniać, co poszło „w tę samą", a co „w przeciwną stronę".

Jeśli płytka jest zablokowana w obie strony, pomijasz ją i wracasz później. Na koniec wciskasz **Reset** w grze (`R`, na padzie `Y`) — zamek wraca do układu startowego, więc nauka nic nie kosztuje.

**3 · Rozwiązanie.** Jedna instrukcja na raz: która płytka, w którą stronę, ile razy. Powiązania i podgląd zamka masz cały czas na oczach. Możesz wrócić do pozycji startowej albo poprawić zapadkę, klikając wprost na zamku.

## Szczegóły

Jedyne dane wejściowe to to, co widać na ekranie: **w którym otworze siedzi każda zapadka**. Kierunki wynikają z odczytów, nigdy z założenia — jeśli gra rysuje ruch lustrzanie, ta odwrotność zapisuje się podczas nauki.

Solver przeszukuje całą przestrzeń stanów (najwyżej 7⁷ = 823 543 układów) i zwraca najkrótszą sekwencję, w której żadna zapadka — ani przesuwana, ani pociągnięta — nie wyjdzie poza swoją płytkę. Jeśli takiej sekwencji nie ma, mówi o tym wprost, zamiast zgadywać.

**Kontrola spójności.** Solver sprawdza własny model, zamiast mu ufać:

- Ostrzega, gdy wyuczone powiązania wychodzą jednostronne. Sprzężone płytki ciągną się w tej grze *wzajemnie*, więc jednostronne powiązanie oznacza przeoczony odczyt.
- Odrzuca odczyty fizycznie niemożliwe — zapadka nie przesunie się o więcej niż jeden otwór na ruch.
- Przy zgrzycie zgłoszonym na pierwszym ruchu wskazuje, **które powiązanie musiało zostać zapisane z odwrotnym znakiem**, zamiast podać kolejną sekwencję wyginającą wytrych.

**Biblioteka skrzyń.** Skrzynię można zapisać pod nazwą. Przy kolejnej wizycie zostaje rozpoznana po układzie startowym, a sekwencja jest gotowa od razu — bez wpisywania czegokolwiek.

## Zrobione pod telefon

Narzędzia używa się jedną ręką, gdy druga gra — więc interfejs jest zaprojektowany pod kciuk, nie pod mysz.

- **Cele dotykowe liczone z szerokości ekranu.** Otwory skalują się do 44 px — minimum zalecane przez Apple — a zamek mieści się bez przewijania w bok od iPhone'a SE po Pro Max.
- **Aktywne są tylko otwory osiągalne.** Zapadka przesuwa się najwyżej o jeden otwór na ruch, więc w fazie nauki tylko 3 z 7 otworów przyjmują dotknięcie. Większy cel — i niemożliwego odczytu nie da się nawet wprowadzić.
- **Pasek kciuka.** Przyklejony na dole pokazuje jedyną rzecz do zrobienia teraz i zawiera wszystkie akcje bieżącej fazy — cały zamek robi się bez przewijania. Wywołuje te same funkcje co przyciski w kartach; nie ma drugiego źródła prawdy.
- **Stopniowe odsłanianie.** Fazy (Ustawienie / Nauka / Rozwiązanie) i przełącznik *ukryj opisy*, który jest zapamiętywany. Wyjaśnienia warto przeczytać raz; przy dwudziestym zamku są już szumem.
- **Specyfika Safari.** Pola 16 px (poniżej Safari przybliża stronę przy dotknięciu), `:hover` wyłączony na dotyku (inaczej podświetlenie zostaje przyklejone po stuknięciu), brak opóźnienia 300 ms, brak błysku, brak zaznaczania tekstu przy szybkim stukaniu.
- **Dopasowane do sprzętu.** Marginesy bezpieczne dla Dynamic Island i paska gestów. Da się dodać do ekranu początkowego, uruchamia się na pełnym ekranie, po pierwszym wczytaniu działa bez internetu.
- **Jasny i ciemny motyw**, zgodnie z systemem, z ręcznym przełącznikiem.

## Wskazówka spoza narzędzia

Wytrenuj otwieranie zamków u **Rączki** przy arenie w Starym Obozie (10 punktów nauki + 100 bryłek rudy). Wytrych zniesie wtedy 4 wygięcia zamiast 2, złamanie nie zresetuje zamka, a same zamki dostają mniej sprzężeń.
