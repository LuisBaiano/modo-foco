#!/usr/bin/env bash
# Publica releases agendadas em .github/scheduled-releases.json cujo publishAt
# já passou: faz merge da branch indicada em main, cria a tag e a release no
# GitHub, e remove a entrada da fila. Rodado periodicamente pelo workflow
# scheduled-release.yml — ver esse arquivo pra entender quando isso executa.
set -euo pipefail

FILE=".github/scheduled-releases.json"
NOW=$(date -u +%s)

git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

DUE_INDICES=$(jq -r --argjson now "$NOW" '
  to_entries
  | map(select((.value.publishAt | fromdateiso8601) <= $now))
  | map(.key)
  | .[]
' "$FILE")

if [ -z "$DUE_INDICES" ]; then
  echo "Nada pra publicar agora."
  exit 0
fi

for i in $DUE_INDICES; do
  entry=$(jq -c ".[$i]" "$FILE")
  branch=$(echo "$entry" | jq -r '.branch')
  tag=$(echo "$entry" | jq -r '.tag')
  title=$(echo "$entry" | jq -r '.title')
  notes=$(echo "$entry" | jq -r '.notes')

  echo "Publicando $tag a partir da branch $branch..."
  git fetch --prune --tags origin main "$branch"

  if ! git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
    echo "Erro: a branch remota '$branch' não existe." >&2
    exit 1
  fi

  # A branch de release pode ter sido criada antes de outros commits em main.
  # Um merge explícito preserva os dois históricos; --ff-only abortaria nesse
  # cenário, deixando a release agendada sem publicar.
  git checkout -B main origin/main
  git merge --no-ff --no-edit "origin/$branch"

  if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
    tag_commit=$(git rev-list -n 1 "$tag")
    head_commit=$(git rev-parse HEAD)
    if [ "$tag_commit" != "$head_commit" ]; then
      echo "Erro: a tag '$tag' já existe e não aponta para o commit da release." >&2
      exit 1
    fi
    echo "A tag $tag já existe neste commit; continuando."
  else
    git tag -a "$tag" -m "$title"
  fi

  git push origin main
  git push origin "$tag"

  if gh release view "$tag" >/dev/null 2>&1; then
    echo "A release $tag já existe; continuando."
  else
    gh release create "$tag" --title "$title" --notes "$notes"
  fi
done

jq --argjson now "$NOW" '
  map(select((.publishAt | fromdateiso8601) > $now))
' "$FILE" > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"

if ! git diff --quiet -- "$FILE"; then
  git add "$FILE"
  git commit -m "chore: remove releases publicadas da fila de agendamento"
  git push origin main
fi
