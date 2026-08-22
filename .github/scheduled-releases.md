# Releases agendadas

Pra publicar um módulo pronto numa data futura (sem backdatar nada — a
publicação de verdade só acontece na hora marcada):

1. Termine o trabalho numa branch separada (não em `main`) e dê push nela:
   ```
   git checkout -b release/v0.4.0
   git push origin release/v0.4.0
   ```
2. Adicione uma entrada em `.github/scheduled-releases.json` (na `main`) e
   dê push:
   ```json
   {
     "branch": "release/v0.4.0",
     "tag": "v0.4.0",
     "title": "v0.4.0 — ...",
     "notes": "...",
     "publishAt": "2026-09-05T20:00:00Z"
   }
   ```
   `publishAt` tem que ser ISO 8601 em UTC, terminando em `Z`.
3. Pronto. O workflow `scheduled-release.yml` roda a cada hora, confere se
   alguma entrada já venceu e, se sim, faz merge da branch em `main`, cria a
   tag, publica a release no GitHub e remove a entrada da fila.

Pra testar sem esperar a hora certa: rode o workflow manualmente na aba
Actions do GitHub (`workflow_dispatch`) depois de colocar um `publishAt` no
passado.
