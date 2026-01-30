#!/usr/bin/env sh
set -eu

VERSION=v1.58.1-noble@sha256:feae0b1581609d3dc2ba22567b4703dd6a3e7a219984bb86a19ed35007148a91
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
