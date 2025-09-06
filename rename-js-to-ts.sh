#!/bin/bash

set -e  # Exit on any error

# Loop through all .js files in the current directory
# for file in *.js; do
#   # Check if any .js files exist
#   if [[ -e "$file" ]]; then
#     # Strip the .js extension
#     base="${file%.js}"
#     # Rename the file to .ts
#     mv "$file" "${base}.ts"
#     echo "Renamed $file to ${base}.ts"
#   fi
# done

# Find all .js files in the current directory and subdirectories
# find . -name "node_modules" -prune -o -type f -name "*.js" -print | while read -r file; do
find . -type f -name "*.js" | while read -r file; do
# Skip files in node_modules directory
  if [[ "$file" == *"/node_modules/"* ]]; then
    continue
  fi
  if [[ "$file" == *"/tests/"* ]]; then
    continue
  fi
  if [[ "$file" == *"/package/"* ]]; then
    continue
  fi
  if [[ "$file" == *"/sdk/"* ]]; then
    continue
  fi
  if [[ "$file" == *"/demo/"* ]]; then
    continue
  fi
  if [[ "$file" == *"/coverage/"* ]]; then
    continue
  fi
  new_file="${file%.js}.ts"
  mv "$file" "$new_file"
  echo "Renamed $file to $new_file"
done

# Function to display usage
usage() {
    echo "Usage: $0 [--recursive | -r] [--dry-run | -n]"
    echo "  --recursive, -r  Rename files in current directory and all subdirectories"
    echo "  --dry-run, -n    Show what would be renamed without actually doing it"
    echo "  --help, -h       Show this help message"
    exit 1
}

# Parse command line arguments
RECURSIVE=false
DRY_RUN=false

# while [[ $# -gt 0 ]]; do
#     case $1 in
#         -r|--recursive)
#             RECURSIVE=true
#             shift
#             ;;
#         -n|--dry-run)
#             DRY_RUN=true
#             shift
#             ;;
#         -h|--help)
#             usage
#             ;;
#         *)
#             echo "Unknown option: $1"
#             usage
#             ;;
#     esac
# done

# # Function to rename files
# rename_files() {
#     local pattern="$1"
#     local count=0
    
#     while IFS= read -r -d '' file; do
#         # Get the directory and base filename
#         dir=$(dirname "$file")
#         base=$(basename "$file" .js)
        
#         # Skip if it's a directory (shouldn't happen with -type f but just in case)
#         if [[ -d "$file" ]]; then
#             continue
#         fi
        
#         # Check if .ts file already exists
#         new_file="$dir/${base}.ts"
#         if [[ -e "$new_file" ]]; then
#             echo "Warning: $new_file already exists. Skipping $file"
#             continue
#         fi
        
#         if [[ "$DRY_RUN" == true ]]; then
#             echo "[DRY RUN] Would rename: $file -> $new_file"
#         else
#             mv -- "$file" "$new_file"
#             echo "Renamed: $file -> $new_file"
#         fi
#         ((count++))
#     done < <(find "$pattern" -type f -name "*.js" -print0 2>/dev/null)
    
#     echo "Total files processed: $count"
# }

# # Main execution
# if [[ "$RECURSIVE" == true ]]; then
#     echo "Renaming .js files recursively in current directory and subdirectories..."
#     rename_files "."
# else
#     echo "Renaming .js files in current directory only..."
#     # Use a different approach for current directory to handle no files case
#     shopt -s nullglob
#     files=(*.js)
    
#     if [[ ${#files[@]} -eq 0 ]]; then
#         echo "No .js files found in current directory."
#         exit 0
#     fi
    
#     count=0
#     for file in "${files[@]}"; do
#         base="${file%.js}"
#         new_file="${base}.ts"
        
#         # Check if .ts file already exists
#         if [[ -e "$new_file" ]]; then
#             echo "Warning: $new_file already exists. Skipping $file"
#             continue
#         fi
        
#         if [[ "$DRY_RUN" == true ]]; then
#             echo "[DRY RUN] Would rename: $file -> $new_file"
#         else
#             mv -- "$file" "$new_file"
#             echo "Renamed: $file -> $new_file"
#         fi
#         ((count++))
#     done
#     echo "Total files processed: $count"
# fi

# echo "Operation completed successfully."