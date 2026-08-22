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
  git fetch origin "$branch" main
  git checkout main
  git merge --ff-only "origin/$branch"
  git tag -a "$tag" -m "$title"
  git push origin main
  git push origin "$tag"
  gh release create "$tag" --title "$title" --notes "$notes"
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
