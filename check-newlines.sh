#!/bin/bash

echo "Checking files without trailing newline..."
count=0

for file in $(git ls-files); do
  if [ -f "$file" ]; then
    if [ -n "$(tail -c 1 "$file" 2>/dev/null)" ]; then
      echo "❌ No newline: $file"
      ((count++))
    fi
  fi
done

echo ""
echo "Total files without trailing newline: $count"