# Wytrych

Solver zamków do **Gothic 1 Remake**. Mówisz mu, gdzie stoją zapadki; on liczy najkrótszą sekwencję ruchów, w której żadna nie uderzy o krawędź — czyli bez wyginania wytrycha.

**Uruchomienie:** dwuklik na `index.html`. Nic nie trzeba instalować, nie potrzeba internetu ani konta. Plik jest samowystarczalny — możesz go wysłać komuś mailem i zadziała u niego tak samo.

## Jak to działa

**Krok 1 — zamek.** Wybierasz liczbę płytek i klikasz otwór, w którym *w tej chwili* siedzi każda zapadka. Płytka 1 to ta najbliższa, na dole — ta, na której staje kursor po każdym resecie.

**Krok 2 — rozpoznanie.** Powiązania między płytkami są dla skrzyni stałe, ale trzeba je poznać. Aplikacja prosi o jeden ruch na płytkę, a Ty po każdym **odczytujesz zamek: klikasz, w którym otworze siedzi teraz każda zapadka**. Kierunki wylicza sama — nie musisz oceniać, co poszło „w tę samą, a co w przeciwną stronę".

Jeśli płytka jest zablokowana w obie strony, pomijasz ją i wracasz później. Na koniec wciskasz **Reset** w grze (klawisz `R`, na padzie `Y`) — zamek wraca do układu z kroku 1, więc rozpoznanie nic Cię nie kosztuje.

**Krok 3 — otwieranie.** Dostajesz jedną instrukcję na raz: która płytka, w którą stronę, ile razy. Powiązania i podgląd zamka masz cały czas na oczach. Możesz w każdej chwili wrócić do pozycji startowej albo poprawić zapadkę, klikając wprost na zamku.

## Czym się różni od innych solverów

Konkurencyjne narzędzia każą wpisać macierz powiązań ręcznie i przyjmują założenie, że „w prawo" znaczy to samo w grze co u nich — stąd ich instrukcje w stylu *„jeśli rozwiązanie nie działa, odwróć wszystkie kierunki"*.

Wytrych nie zakłada niczego o kierunkach. Liczy wyłącznie w tym, co widać: **w numerze otworu, w którym siedzi zapadka**, i w kierunku, który faktycznie naciskasz. Jeśli gra rysuje ruch lustrzanie, ta odwrotność zapisuje się sama podczas rozpoznania.

Dodatkowo:

- **Biblioteka skrzyń.** Rozpoznaną skrzynię zapisujesz pod nazwą. Przy powrocie rozpoznaje ją po układzie startowym i podaje gotową sekwencję — bez żadnego wpisywania.
- **Wykrywa własne błędy.** Jeśli dane są sprzeczne, mówi o tym zamiast pewnie liczyć bzdury: ostrzega o jednostronnych powiązaniach (w tej grze sprzężenia są wzajemne), odrzuca niemożliwe odczyty, a gdy zgłosisz zgrzyt na pierwszym kroku — wskazuje, które powiązanie musiało zostać zapisane odwrotnie.

## Wskazówka spoza narzędzia

Wytrenuj otwieranie zamków u **Rączki** przy arenie w Starym Obozie (10 punktów nauki + 100 bryłek rudy). Wytrych zniesie wtedy 4 wygięcia zamiast 2, złamanie nie zresetuje zamka, a same zamki dostają mniej sprzężeń.

## Rozwój

Kod, model zamka i decyzje projektowe: [`CLAUDE.md`](CLAUDE.md).
Testy: `./tests/run.sh`
