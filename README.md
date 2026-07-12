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

Some chests in this game are just brutal. I have lockpicking maxed out and I'd still sit there retrying the same lock over and over — burning time and getting more annoyed with every attempt.

So I looked at the solvers that already exist. They're either too complicated or simply awkward to use. Every one of them wants the **link matrix typed in by hand** — which is precisely the part that takes the thinking. Do that, and you've done the puzzle yourself.

This one asks only for what you can read straight off the screen: **which hole each pin sits in**. It figures out the rest — including the directions, which is why you never have to decide what moved "the same way" and what moved "the opposite way".

It also argues with itself. It warns when the links it learned come out one-sided (in this game coupled plates always pull each other *both* ways, so a one-way link means a misread), refuses readings that are physically impossible, and when a move grinds in game it tells you **which link must have been recorded with the wrong sign** — rather than quietly handing you another sequence that bends your pick.

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

Niektóre skrzynie w tej grze są po prostu wredne. Mam wymaksowane otwieranie zamków, a i tak potrafiłem siedzieć nad jednym zamkiem, próbując raz za razem — traciłem czas i irytowałem się coraz bardziej z każdym podejściem.

Więc zajrzałem do solverów, które już istnieją. Są albo zbyt skomplikowane, albo zwyczajnie niewygodne. Każdy chce, żeby **wklepać macierz powiązań ręcznie** — a to jest dokładnie ta część, która wymaga myślenia. Jak ją zrobisz, to zagadkę rozwiązałeś sam.

Ten pyta wyłącznie o to, co da się odczytać wprost z ekranu: **w którym otworze siedzi każda zapadka**. Resztę wylicza sam — łącznie z kierunkami, więc nigdy nie musisz rozstrzygać, co poszło „w tę samą", a co „w przeciwną stronę".

Do tego spiera się sam ze sobą. Ostrzega, gdy wyuczone powiązania wychodzą jednostronne (w tej grze sprzężone płytki ciągną się *wzajemnie*, więc jednostronne = przeoczony odczyt), odrzuca odczyty fizycznie niemożliwe, a gdy ruch zgrzytnie w grze — wskazuje, **które powiązanie musiało zostać zapisane z odwrotnym znakiem**, zamiast po cichu podać kolejną sekwencję, która wygina wytrych.

Poza tym:

- **Biblioteka skrzyń.** Zapisujesz skrzynię pod nazwą. Przy powrocie rozpoznaje ją po układzie startowym i podaje gotową sekwencję — bez żadnego wpisywania.
- **Pod telefon.** Duże cele do kliknięcia, wszystko potrzebne pod kciukiem, da się dodać do ekranu początkowego. Ma się trzymać w jednej ręce, gdy druga gra.

## Wskazówka spoza narzędzia

Wytrenuj otwieranie zamków u **Rączki** przy arenie w Starym Obozie (10 punktów nauki + 100 bryłek rudy). Wytrych zniesie wtedy 4 wygięcia zamiast 2, złamanie nie zresetuje zamka, a same zamki dostają mniej sprzężeń.
