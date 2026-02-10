# Lesestjerner (Norsk)

Et nettbasert, berøringsvennlig norskspill for barn (6–10 år) med egne URL-sider:

- `login.html` for navn + Start
- `levels.html` for valg av spilldel og historikk
- `task.html` for oppgaveløsing

## Spillet har 3 deler

1. **Del 1: Sorter ikoner til riktig bokstav-kasse** (f.eks. 🚗 og 🧸 til B-kassen).
2. **Del 2: Sett inn riktig bokstav i ord** (f.eks. `B _ l`).
3. **Del 3: Omvendt sortering** – sorter ord til riktig ikon-kasse.

Funksjoner:

- umiddelbare tilbakemeldinger
- progresjon og historikk lagres per navn i `localStorage`
- stjerner og merker

## Kjør lokalt

```bash
python3 -m http.server 4173
```

Åpne `http://localhost:4173` (videresender til `login.html`).
