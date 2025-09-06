#!/bin/bash

set -e

# Function to display usage
usage() {
    echo "Usage: $0 [--recursive | -r] [--dry-run | -n] [--exclude-dirs dir1,dir2]"
    echo "  --recursive, -r      Convert files in current directory and all subdirectories"
    echo "  --dry-run, -n        Show what would be converted without actually doing it"
    echo "  --exclude-dirs       Comma-separated list of directories to exclude"
    echo "  --help, -h           Show this help message"
    exit 1
}

# Default values
RECURSIVE=false
DRY_RUN=false
EXCLUDE_DIRS="node_modules,.git,dist,build"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--recursive)
            RECURSIVE=true
            shift
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --exclude-dirs)
            EXCLUDE_DIRS="$EXCLUDE_DIRS,$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Function to convert CommonJS to ES6
convert_module() {
    local file="$1"
    local content
    local converted_content
    
    # Read file content
    content=$(cat "$file")
    
    # Convert module.exports to export default
    converted_content=$(echo "$content" | sed -E '
        # Convert module.exports = ... to export default ...
        s/^([[:space:]]*)module\.exports[[:space:]]*=[[:space:]]*/export default /
        
        # Convert exports.foo = ... to export const foo = ...
        s/^([[:space:]]*)exports\.([a-zA-Z_][a-zA-Z0-9_]*)[[:space:]]*=[[:space:]]*/export const \2 = /
        
        # Convert module.exports = { ... } to export default { ... }
        s/^([[:space:]]*)module\.exports[[:space:]]*=[[:space:]]*\{/export default {/
        
        # Remove require statements (you might want to handle these differently)
        # s/^([[:space:]]*)const[[:space:]]+[a-zA-Z_][a-zA-Z0-9_]*[[:space:]]*=[[:space:]]*require\([^)]+\);//
    ')
    
    # Add import statements for common Node.js modules
    if echo "$converted_content" | grep -q "export default" || echo "$converted_content" | grep -q "export const"; then
        # Check if it's a Node.js module and add appropriate imports
        if echo "$converted_content" | grep -q "process\." || echo "$converted_content" | grep -q "require("; then
            converted_content=$(echo "$converted_content" | sed '1i\
// @ts-check\
import { createRequire } from '"'module'"';\
const require = createRequire(import.meta.url);\
')
        fi
    fi
    
    echo "$converted_content"
}

# Function to process files
process_files() {
    local pattern="$1"
    local count=0
    local find_cmd="find \"$pattern\" -type f -name \"*.js\""
    
    # Build exclude patterns
    IFS=',' read -ra EXCLUDE_ARRAY <<< "$EXCLUDE_DIRS"
    for dir in "${EXCLUDE_ARRAY[@]}"; do
        find_cmd+=" ! -path \"*/${dir}/*\" ! -name \"${dir}\""
    done
    
    while IFS= read -r -d '' file; do
        # Skip if it's a directory
        if [[ -d "$file" ]]; then
            continue
        fi
        
        echo "Processing: $file"
        
        # Convert the file content
        converted_content=$(convert_module "$file")
        
        if [[ "$DRY_RUN" == true ]]; then
            echo "=== DRY RUN - Content would be changed to: ==="
            echo "$converted_content"
            echo "=== END DRY RUN ==="
            echo ""
        else
            # Write converted content to .ts file
            ts_file="${file%.js}.ts"
            echo "$converted_content" > "$ts_file"
            
            # Remove original .js file
            rm "$file"
            
            echo "Converted: $file -> $ts_file"
        fi
        
        ((count++))
    done < <(eval "$find_cmd -print0")
    
    echo "Total files processed: $count"
}

# Main execution
if [[ "$RECURSIVE" == true ]]; then
    echo "Converting .js files to ES6 modules recursively..."
    echo "Excluding directories: $EXCLUDE_DIRS"
    process_files "."
else
    echo "Converting .js files in current directory only..."
    # Process files in current directory
    shopt -s nullglob
    files=(*.js)
    
    if [[ ${#files[@]} -eq 0 ]]; then
        echo "No .js files found in current directory."
        exit 0
    fi
    
    count=0
    for file in "${files[@]}"; do
        # Skip excluded directories (though unlikely in current dir)
        skip=false
        IFS=',' read -ra EXCLUDE_ARRAY <<< "$EXCLUDE_DIRS"
        for dir in "${EXCLUDE_ARRAY[@]}"; do
            if [[ "$file" == *"/${dir}/"* ]]; then
                skip=true
                break
            fi
        done
        
        if [[ "$skip" == true ]]; then
            continue
        fi
        
        echo "Processing: $file"
        
        # Convert the file content
        converted_content=$(convert_module "$file")
        
        if [[ "$DRY_RUN" == true ]]; then
            echo "=== DRY RUN - Content would be changed to: ==="
            echo "$converted_content"
            echo "=== END DRY RUN ==="
            echo ""
        else
            # Write converted content to .ts file
            ts_file="${file%.js}.ts"
            echo "$converted_content" > "$ts_file"
            
            # Remove original .js file
            rm "$file"
            
            echo "Converted: $file -> $ts_file"
        fi
        
        ((count++))
    done
    echo "Total files processed: $count"
fi

echo "Conversion completed successfully."