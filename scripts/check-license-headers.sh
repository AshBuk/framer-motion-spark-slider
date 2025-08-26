#!/bin/bash

# License header validation script
# Checks that all TypeScript/JavaScript files have proper MIT license headers

set -e

echo "🔍 Checking license headers in TypeScript/JavaScript files..."

# Expected patterns
EXPECTED_COPYRIGHT="Copyright (c) 2025 Asher Buk"
EXPECTED_SPDX="SPDX-License-Identifier: MIT"

# Find and check files
missing_files=0
total_files=0

# Check TypeScript/JavaScript files in src/
for file in $(find ./src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"); do
    total_files=$((total_files + 1))
    
    # Check if both copyright and SPDX are present in first 10 lines
    if ! head -10 "$file" | grep -q "$EXPECTED_COPYRIGHT"; then
        echo "❌ Missing copyright: $file"
        missing_files=$((missing_files + 1))
    elif ! head -10 "$file" | grep -q "$EXPECTED_SPDX"; then
        echo "❌ Missing SPDX license: $file"  
        missing_files=$((missing_files + 1))
    fi
done

# Also check config files in root
for file in *.config.js *.config.ts jest.config.js postcss.config.js tailwind.config.js; do
    if [[ -f "$file" ]]; then
        total_files=$((total_files + 1))
        
        if ! head -10 "$file" | grep -q "$EXPECTED_COPYRIGHT"; then
            echo "❌ Missing copyright: $file"
            missing_files=$((missing_files + 1))
        elif ! head -10 "$file" | grep -q "$EXPECTED_SPDX"; then
            echo "❌ Missing SPDX license: $file"  
            missing_files=$((missing_files + 1))
        fi
    fi
done

echo "📊 Processed $total_files TypeScript/JavaScript files"

if [ $missing_files -eq 0 ]; then
    echo "✅ All source files have valid MIT license headers!"
    exit 0
else
    echo "❌ Found $missing_files files with missing or invalid license headers"
    echo ""
    echo "Expected header format:"
    echo "  /**"
    echo "   * Copyright (c) 2025 Asher Buk"
    echo "   * SPDX-License-Identifier: MIT"
    echo "   */"
    exit 1
fi