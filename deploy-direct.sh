#!/bin/bash
export CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN"
cd /home/runner/workspace
echo "Deploying corrected interface..."
wrangler pages deploy . --project-name chorly --compatibility-date=2024-01-01 || 
wrangler pages deploy . --project-name chorly