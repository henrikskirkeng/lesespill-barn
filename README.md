# Lesestjerner

Et nettbasert, berøringsvennlig læringsspill for barn (6–10 år) med fysiske sider (egne URL-er):

- `login.html` for navn + Start
- `levels.html` for kategori- og nivåvalg, samt historikk
- `task.html` for oppgaveløsing
- 3 kategorier: **Norsk**, **Engelsk** og **Matematikk**
- interaktivt kategoriseringsspill med dra-og-slipp i Norsk (sorter ord i bokstav-kasser)
- automatisk overgang til neste oppgave ved riktig svar
- feil svar markeres rødt og barnet kan prøve igjen
- progresjon synlig på både `levels.html` og `task.html`
- progresjon/historikk lagres per navn i `localStorage`

## Kjør lokalt

```bash
python3 -m http.server 4173
```

Åpne deretter `http://localhost:4173` (videresender til `login.html`).
