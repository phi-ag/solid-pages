# Solid Pages

[![Production](https://shields.io/badge/production-0369a1?style=for-the-badge)](https://solid-pages.phi.ag)
[![Preview](https://shields.io/badge/preview-c2410c?style=for-the-badge)](https://preview-solid-pages.phi.ag)
[![E2E Report](https://shields.io/badge/e2e_report-334155?style=for-the-badge)](https://phi-ag.github.io/solid-pages/)
[![Coverage](https://img.shields.io/codecov/c/github/phi-ag/solid-pages?style=for-the-badge)](https://app.codecov.io/github/phi-ag/solid-pages)

Opinionated demo app running [SolidStart](https://start.solidjs.com/) on [Cloudflare Pages](https://pages.cloudflare.com/).

## Setup

### Accounts

- Create a [Cloudflare Account](https://dash.cloudflare.com/sign-up)
- Sign-up for [Terraform Cloud](https://www.terraform.io/) or [similar](https://opentofu.org/supporters/)

### Tools

- Install [Terraform](https://developer.hashicorp.com/terraform/install) or [OpenTofu](https://opentofu.org/docs/intro/install)
- Install [fnm](https://github.com/Schniz/fnm?tab=readme-ov-file#installation) or [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) ([nvm-windows](https://github.com/coreybutler/nvm-windows?tab=readme-ov-file#installation--upgrades))

### Cloudflare API token

> [!WARNING]
> Cloudflare Account API tokens currently can't be used to create Pages with Terraform (internal server error)

Create a personal API token for Terraform with the following permissions

- Account / D1 / Edit
- Account / Cloudflare Pages / Edit
- Account / Workers R2 Storage / Edit
- Account / Workers KV Storage / Edit
- Account / Access: Apps and Policies / Edit
- Account / Access: Service Tokens / Edit
- Account / Access: Organizations, Identity Providers, and Groups / Read
- Zone / DNS / Edit

Copy the token into your Terraform Cloud Workspace variables as `cloudflare_api_token` (sensitive).

Create a API token for GitHub with the following permissions

- Account / D1 / Edit
- Account / Cloudflare Pages / Edit

Copy the token into your GitHub Action Secrets as `CLOUDFLARE_API_TOKEN`.

### Cloudflare Zero Trust

This app uses [Zero Trust](https://developers.cloudflare.com/cloudflare-one/) with a [GitHub Identity Provider](https://developers.cloudflare.com/cloudflare-one/identity/idp-integration/github/) to protect the preview deployment.

If you don't want this setup you can remove everything related to Zero Trust, JWT and E2E from [main.tf](main.tf), [wrangler.toml](wrangler.toml), the `user` middleware from [middleware.ts](src/middleware.ts) and related code from `src/lib`.

Alternatively if you want to protect the production deployment copy `JWT_ISSUER`, `JWT_AUDIENCE` and `E2E_CLIENT_ID` to `[env.production.vars]` in your [wrangler.toml](wrangler.toml) and add the production domains to the Zero Trust Application in [main.tf](main.tf).

```tf
destinations {
  uri = cloudflare_pages_domain.production.domain
}
destinations {
  uri = cloudflare_pages_project.page.subdomain
}
```

Follow the official documentation to setup the [GitHub Identity Provider](https://developers.cloudflare.com/cloudflare-one/identity/idp-integration/github/) and update [terraform.tfvars](terraform.tfvars).

After applying Terraform add `E2E_CLIENT_ID` and `E2E_CLIENT_SECRET` to your GitHub Action Secrets

    terraform output -raw e2e_client_id
    terraform output -raw e2e_client_secret

### Terraform

Update [terraform.tfvars](terraform.tfvars)

    terraform login
    terraform init
    terraform apply

Use the output from `terraform apply` (or `terraform output`) to update [wrangler.toml](wrangler.toml).

### Web Analytics

Web Analytics need to be enabled manually in the Cloudflare dashboard in your Page project -> Metrics.

    terraform apply
    terraform output -raw web_analytics_token
    pnpm wrangler pages secret put ANALYTICS_TOKEN
    pnpm wrangler pages secret put ANALYTICS_TOKEN --env preview

## Development

Create `.dev.vars` (see [.dev.vars.template](.dev.vars.template))

Install `Node.js`

    fnm install
    fnm use

Install `pnpm`

    corepack enable
    corepack prepare --activate

Install packages

    pnpm i

Apply migrations

    pnpm db:migrate

Watch

    pnpm dev

Test

    pnpm test
    pnpm test:dev

End-to-End tests

    pnpm playwright install chromium

    pnpm test:e2e --project=chromium
    pnpm test:e2e --project=a11y
    pnpm test:e2e --project=lighthouse

Run format, lint, typecheck and test

    pnpm check

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

> [!WARNING]
> When switching D1 you need to update the `url` in [drizzle.config.ts](drizzle.config.ts) and the database name in [package.json](package.json)

Info

    pnpm wrangler d1 info solid-pages-preview
    pnpm wrangler d1 info solid-pages-production

Push changes during development

    pnpm db:push

Start Drizzle Studio

    pnpm db:studio

Generate migration

    pnpm db:generate --name <name>

Apply migrations

    pnpm db:migrate
