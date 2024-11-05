# Solid Pages

[![Production](https://shields.io/badge/production-blue?style=for-the-badge)](https://solid-pages.phi.ag)
[![Preview](https://shields.io/badge/preview-yellow?style=for-the-badge)](https://preview-solid-pages.phi.ag)

Opinionated demo app running [SolidStart](https://start.solidjs.com/) on [Cloudflare Pages](https://pages.cloudflare.com/).

## Setup

### Accounts

- Create a [Cloudflare Account](https://dash.cloudflare.com/sign-up)
- Sign-up for [Terraform Cloud](https://www.terraform.io/) or [similar](https://opentofu.org/supporters/)

### Tools

- Install [Terraform](https://developer.hashicorp.com/terraform/install) or [OpenTofu](https://opentofu.org/docs/intro/install)
- Install [fnm](https://github.com/Schniz/fnm?tab=readme-ov-file#installation) or [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) ([nvm-windows](https://github.com/coreybutler/nvm-windows?tab=readme-ov-file#installation--upgrades))

### Cloudflare API token

> :warning: **Cloudflare Account API tokens currently can't be used to create Pages with Terraform** (internal server error)

Create a personal API token for terraform with the following permissions

- Account / D1 / Edit
- Account / Cloudflare Pages / Edit
- Account / Workers R2 Storage / Edit
- Account / Workers KV Storage / Edit
- Account / Access: Apps and Policies / Edit
- Account / Access: Service Tokens / Edit
- Account / Access: Organizations, Identity Providers, and Groups / Read
- Account / Bulk URL Redirects / Edit
- Zone / DNS / Edit

Copy the token into your Terraform Cloud Workspace variables as `cloudflare_api_token` (sensitive).

Create a API token for GitHub with the following permissions

- Account / Cloudflare Pages / Edit

Copy the token into your GitHub Action Secrets as `CLOUDFLARE_API_TOKEN`.

### Terraform

    terraform login
    terraform init
    terraform apply

Use the output from `terraform apply` to update your [wrangler.toml](wrangler.toml).

## Development

- Create `.dev.vars` (see [.dev.vars.template](.dev.vars.template))
- Install [fnm](https://github.com/Schniz/fnm?tab=readme-ov-file#installation)

Install `Node.js`

    fnm install
    fnm use

Install `pnpm`

    corepack enable
    corepack prepare --activate

Install packages

    pnpm i

Watch

    pnpm dev

Deploy

    pnpm build
    pnpm run deploy
    pnpm run deploy:production

### Add environment variables

- Add the variable to [wrangler.toml](wrangler.toml) in the `[vars]` and `[env.production.vars]` sections
- Run `pnpm typegen`

### Secrets

#### List secrets

    pnpm wrangler pages secret list --env preview
    pnpm wrangler pages secret list

#### Add secrets

    pnpm wrangler pages secret put MY_SECRET --env preview
    pnpm wrangler pages secret put MY_SECRET

- Add the secret to `.dev.vars` and [.dev.vars.template](.dev.vars.template)
- Run `pnpm typegen`

### Stream logs

    pnpm tail
    pnpm tail:production

### Deployments

    pnpm wrangler pages deployment list

### KV

    pnpm wrangler kv key list --binding KV
    pnpm wrangler kv key list --binding KV --env production

### R2

    pnpm wrangler r2 object get solid-pages-preview/ -p | jq
    pnpm wrangler r2 object get solid-pages-production/ -p | jq

### D1

    pnpm wrangler d1 info solid-pages-preview
    pnpm wrangler d1 info solid-pages-production
