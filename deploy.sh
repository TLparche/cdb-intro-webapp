#!/bin/sh
# S3 동기화 + CloudFront 캐시 무효화
set -e
BUCKET="${BUCKET:?BUCKET 필요}"
DIST_ID="${DIST_ID:?DIST_ID 필요}"
aws s3 sync . "s3://$BUCKET" --delete \
  --exclude ".git/*" --exclude ".claude/*" --exclude "README.md" --exclude "deploy.sh" --exclude ".DS_Store"
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" --query 'Invalidation.Id' --output text
