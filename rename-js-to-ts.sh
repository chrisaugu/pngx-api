#!/bin/bash

# Loop through all .js files in the current directory
for file in *.js; do
  # Check if any .js files exist
  if [[ -e "$file" ]]; then
    # Strip the .js extension
    base="${file%.js}"
    # Rename the file to .ts
    mv "$file" "${base}.ts"
    echo "Renamed $file to ${base}.ts"
  fi
done

# Find all .js files in the current directory and subdirectories
# find . -type f -name "*.js" | while read -r file; do
#   new_file="${file%.js}.ts"
#   mv "$file" "$new_file"
#   echo "Renamed $file to $new_file"
# done
