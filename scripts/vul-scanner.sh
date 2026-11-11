#!/bin/bash
# Automated MCP security scanning pipeline

# Static analysis of tool definitions
echo "Running static security analysis..."
mcp-scan analyze --server ./dist/server.js \
  --checks tool-poisoning,schema-validation \
  --output reports/static-analysis.json

# Dynamic runtime testing
echo "Starting server for dynamic testing..."
npm start &
SERVER_PID=$!
sleep 5

# Fuzzing tool inputs
echo "Fuzzing MCP tool parameters..."
rpc-fuzzer --target http://localhost:3000/rpc \
  --wordlist ./security/fuzzing-payloads.txt \
  --timeout 30 \
  --report reports/fuzzing-results.json

# Authentication bypass attempts  
echo "Testing authentication mechanisms..."
python -m pytest tests/security/test_auth.py \
  --json-report --json-report-file=reports/auth-test.json

# Cleanup
kill $SERVER_PID

# Generate consolidated report
mcp-scan report --input reports/ --format html > security-report.html
