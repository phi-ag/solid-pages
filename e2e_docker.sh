#!/usr/bin/env sh
set -eu

VERSION=v1.58.0-noble@sha256:35c7d48b4ccaf3aca5018f5f1bf7f50c7da7d61d176c530741f4f2e9ca336c34
STORE_PATH="$(pnpm store path --silent)"

mkdir -p .playwright

cat <<EOF >.playwright/run.sh
#!/usr/bin/env bash
set -euo pipefail
npm install -g --force corepack
corepack enable
corepack prepare --activate
pnpm config set store-dir ${STORE_PATH}
pnpm install --frozen-lockfile
pnpm test:e2e
EOF

chmod +x .playwright/run.sh

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  -v ${STORE_PATH}:${STORE_PATH} \
  -e CI=true -e HOME=/root -e STORE_PATH -e BASE_URL \
  mcr.microsoft.com/playwright:${VERSION} \
  .playwright/run.sh
