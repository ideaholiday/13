#!/usr/bin/env bash
# Lightweight helper to run integration tests locally using LocalStack
# - starts LocalStack (docker) using the official LocalStack image
# - creates the S3 bucket `test-bucket`
# - starts the Next dev server
# - runs the integration test

set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required. Install Docker Desktop and try again."
  exit 2
fi

# start LocalStack container if not running
if [ -z "$(docker ps --filter "name=localstack" --format '{{.Names}}')" ]; then
  echo "Starting LocalStack container..."
  docker run -d --name localstack -p 4566:4566 -p 4571:4571 localstack/localstack:latest
  # give LocalStack a second to initialize
  sleep 3
else
  echo "LocalStack already running"
fi

export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_S3_BUCKET=test-bucket
export AWS_ENDPOINT=http://localhost:4566

# ensure awscli is available inside host (script uses host awscli)
if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI not found on host. Attempting to run awscli via docker..."
  docker run --rm -it --network host amazon/aws-cli --endpoint-url=http://localhost:4566 s3 mb s3://$AWS_S3_BUCKET || true
else
  aws --endpoint-url=$AWS_ENDPOINT s3 mb s3://$AWS_S3_BUCKET || true
fi

cd ih-frontend
npm ci
# start dev server
npm run dev &
DEV_PID=$!
sleep 3

# run integration tests
npm run test:integration
EXIT_CODE=$?

# cleanup
kill $DEV_PID || true

exit $EXIT_CODE
