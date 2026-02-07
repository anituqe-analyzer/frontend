export function About() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-16">
      <div className="rounded-3xl border bg-background/70 backdrop-blur-sm p-6 md:p-12 shadow-sm">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-5">O projekcie</h1>
          <p className="text-muted-foreground leading-relaxed mb-4">
            AntiqueVerify to platforma, ktora wspiera ocene autentycznosci antykow w aukcjach online. Powstala, aby
            ograniczyc ryzyko oszustw i przyspieszyc decyzje zakupowe, gdy brakuje czasu na konsultacje rzeczoznawcy lub
            specjalisty.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            System laczy analize sztucznej inteligencji (obrazy oraz opisy aukcji) z opinia ekspertow i spolecznosci.
            Dodatkowe oceny pozwalaja korygowac wyniki modelu, a zebrane dane moga sluzyc do dalszego doskonalenia
            algorytmow. Projekt pelni tez funkcje edukacyjna, dostarczajac wskazowek bezpiecznego kupowania antykow.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-muted/20 p-5">
            <h2 className="text-lg font-semibold mb-2">Dlaczego powstal</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Rynek aukcyjny rozwija sie dynamicznie, ale wraz z nim rosnie liczba falszerstw. Projekt odpowiada na
              potrzebe szybkiej, zrozumialej weryfikacji wiarygodnosci ofert.
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/20 p-5">
            <h2 className="text-lg font-semibold mb-2">Co to jest</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Serwis internetowy, ktory analizuje aukcje na podstawie danych z ogloszenia, wskazuje potencjalne ryzyka i
              umozliwia ekspertom oraz uzytkownikom potwierdzenie lub korekte werdyktu.
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/20 p-5">
            <h2 className="text-lg font-semibold mb-2">Autorzy</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Kamil Kukielka</li>
              <li>Bartosz Kawa</li>
              <li>Michal Zychowski</li>
              <li>Kamil Michna</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
