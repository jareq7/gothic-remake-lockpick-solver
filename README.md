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

## Why I built it

I play with lockpicking maxed out, and the chests still ate my picks. So I tried the solvers — and every one of them wanted the **link matrix typed in by hand**. But working out which plate drags which is *the hard part*; once you've done it in your head, you barely need the tool. And they all ship the same disclaimer: *"if the solution doesn't work, invert all the directions."* That isn't a solver. That's homework with extra steps.

So this one asks for the only thing you can read off the screen without thinking: **which hole each pin sits in**. It works the directions out itself — and if the game draws the movement mirrored, that inversion simply gets recorded, and you never even find out.

The part I care about most: it **argues with itself**. It warns when the links it learned come out one-sided (in this game coupled plates always pull each other *both* ways, so a one-way link means a misread). It refuses readings that are physically impossible. And when a move grinds in game, it tells you **which link must have been recorded with the wrong sign** — instead of quietly handing you another sequence that bends your pick.

I know that failure mode intimately, because this tool did it to me before I fixed it. Now the test suite drives every sequence against a simulated game that refuses illegal moves, so it can't happen again quietly.

Also:

- **Chest library.** Save a chest under a name. On your next visit it is recognised by its starting layout and hands you a ready sequence — nothing to re-enter.
- **Phone-first.** Big touch targets, everything you need under your thumb, and it can be added to the home screen. Meant to be held in one hand while the other one plays.

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

## Dlaczego to powstało

Gram z wymaksowanym otwieraniem zamków, a skrzynie i tak zjadały mi wytrychy. Więc sięgnąłem po solvery — i każdy chciał, żebym **wklepał macierz powiązań ręcznie**. Tylko że rozgryzienie, która płytka ciągnie którą, to jest *ta trudna część*; jak już masz to w głowie, narzędzie prawie nie jest potrzebne. A do tego wszystkie mają tę samą adnotację: *„jeśli rozwiązanie nie działa, odwróć wszystkie kierunki"*. To nie jest solver. To praca domowa z dodatkowymi krokami.

Ten pyta więc o jedyną rzecz, którą da się odczytać z ekranu bez myślenia: **w którym otworze siedzi każda zapadka**. Kierunki wylicza sam — a jeśli gra rysuje ruch lustrzanie, ta odwrotność po prostu się zapisuje i nawet się o niej nie dowiesz.

Najbardziej zależy mi na tym, że narzędzie **spiera się samo ze sobą**. Ostrzega, gdy wyuczone powiązania wychodzą jednostronne (w tej grze sprzężone płytki ciągną się *wzajemnie*, więc jednostronne = przeoczony odczyt). Odrzuca odczyty fizycznie niemożliwe. A gdy ruch zgrzytnie w grze, mówi, **które powiązanie musiało zostać zapisane z odwrotnym znakiem** — zamiast po cichu podać kolejną sekwencję, która wygina wytrych.

Ten sposób psucia się znam z pierwszej ręki, bo to narzędzie zrobiło mi to zanim je naprawiłem. Teraz każda sekwencja przechodzi w testach przez symulowaną grę, która odrzuca nielegalne ruchy — więc po cichu już się to nie powtórzy.

Poza tym:

- **Biblioteka skrzyń.** Zapisujesz skrzynię pod nazwą. Przy powrocie rozpoznaje ją po układzie startowym i podaje gotową sekwencję — bez żadnego wpisywania.
- **Pod telefon.** Duże cele do kliknięcia, wszystko potrzebne pod kciukiem, da się dodać do ekranu początkowego. Ma się trzymać w jednej ręce, gdy druga gra.

## Wskazówka spoza narzędzia

Wytrenuj otwieranie zamków u **Rączki** przy arenie w Starym Obozie (10 punktów nauki + 100 bryłek rudy). Wytrych zniesie wtedy 4 wygięcia zamiast 2, złamanie nie zresetuje zamka, a same zamki dostają mniej sprzężeń.
