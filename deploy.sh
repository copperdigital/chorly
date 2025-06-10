#!/bin/bash
wrangler pages deploy . --project-name chorly &
DEPLOY_PID=$!
sleep 30
kill $DEPLOY_PID 2>/dev/null || true
echo "Deployment process initiated"
