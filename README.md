# Lesestjerner

Et nettbasert, berøringsvennlig lesespill for barn (6–10 år) med fysiske sider (egne URL-er):

- `login.html` for navn + Start
- `levels.html` for nivåvalg og historikk
- `task.html` for oppgaveløsing
- progresjon synlig både på `levels.html` og `task.html`
- progresjon/historikk lagres per navn i `localStorage`

## Kjør lokalt

```bash
python3 -m http.server 4173
```

Åpne deretter `http://localhost:4173` (videresender til `login.html`).
