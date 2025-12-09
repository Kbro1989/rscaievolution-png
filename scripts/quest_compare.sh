#!/usr/bin/env bash
set -eo pipefail
out=/workspaces/rscaievolution-png/quest-diff-summary.txt
rm -f "$out"

src_root='rsc-cloudflare/rsc-server/src/plugins/quests'
other_root='openrsc-vanilla/rsc-server/src/plugins/quests'

if [ ! -d "$src_root" ]; then
  echo "Source quests directory $src_root not found."
  exit 1
fi
if [ ! -d "$other_root" ]; then
  echo "Other quests directory $other_root not found."
  exit 1
fi

find "$src_root" -name "*.js" | sort | while IFS= read -r f; do
  rel=${f#${src_root}/}
  other="${other_root}/${rel}"
  lines1=$(wc -l < "$f")
  if [ -f "$other" ]; then
    lines2=$(wc -l < "$other")
    # Count differing lines: exclude diff headers
    diffcount=$(diff -U0 "$f" "$other" | sed -n "s/^+[^+].*/+/p; s/^-[^-].*/-/p" | wc -l || true)
    # Naive stub signals
    retfalse=$(grep -nE "return false|return undefined|return null" "$f" | wc -l || true)
    todos=$(grep -nEi "TODO|stub|not implemented|placeholder|FIXME" "$f" | wc -l || true)
    echo "$rel|$lines1|$lines2|$diffcount|$retfalse|$todos" >> "$out"
  else
    retfalse=$(grep -nE "return false|return undefined|return null" "$f" | wc -l || true)
    todos=$(grep -nEi "TODO|stub|not implemented|placeholder|FIXME" "$f" | wc -l || true)
    echo "$rel|$lines1|MISSING|NA|$retfalse|$todos" >> "$out"
  fi
done

echo "Written summary to $out"
head -n 200 "$out"
