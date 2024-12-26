terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.49.1"
    }
  }

  required_version = ">= 1.7.0"
}

variable "cloudflare_api_token" {
  type        = string
  sensitive   = true
  description = "The Cloudflare API token."
}

variable "cloudflare_account_id" {
  type        = string
  description = "The Cloudflare account id."
}

variable "cloudflare_zone_id" {
  type        = string
  description = "The Cloudflare zone id."
}

# see https://registry.terraform.io/providers/cloudflare/cloudflare/4.44.0/docs/resources/pages_project#required
variable "pages_project_name" {
  type        = string
  description = "Name of the project."
}

# see https://registry.terraform.io/providers/cloudflare/cloudflare/4.44.0/docs/resources/pages_domain
variable "pages_preview_domain" {
  type        = string
  description = "Custom preview domain."
}

# see https://registry.terraform.io/providers/cloudflare/cloudflare/4.44.0/docs/resources/pages_domain
variable "pages_production_domain" {
  type        = string
  description = "Custom production domain."
}

variable "pages_preview_branch" {
  type        = string
  default     = "main"
  description = "The name of the branch that is used for the preview environment."
}

# see https://registry.terraform.io/providers/cloudflare/cloudflare/4.44.0/docs/resources/pages_project#required
variable "pages_production_branch" {
  type        = string
  default     = "production"
  description = "The name of the branch that is used for the production environment."
}

# see https://registry.terraform.io/providers/cloudflare/cloudflare/4.44.0/docs/resources/workers_kv_namespace
variable "kv_namespace" {
  type        = string
  description = "Title value of the Worker KV Namespace."
}

# see https://registry.terraform.io/providers/cloudflare/cloudflare/4.44.0/docs/resources/r2_bucket
variable "r2_bucket_name" {
  type        = string
  description = "The name of the R2 bucket."
}

# see https://registry.terraform.io/providers/cloudflare/cloudflare/4.44.0/docs/resources/r2_bucket#optional
variable "r2_bucket_location" {
  type        = string
  default     = "WEUR"
  description = "The location hint of the R2 bucket."
}

# see https://registry.terraform.io/providers/cloudflare/cloudflare/4.44.0/docs/resources/d1_database
variable "d1_name" {
  type        = string
  description = "The name of the D1 Database."
}

# see https://registry.terraform.io/providers/cloudflare/cloudflare/4.44.0/docs/data-sources/zero_trust_access_identity_provider#required
variable "github_identity_provider_name" {
  type        = string
  description = "GitHub Access Identity Provider name."
}

# see https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/zero_trust_access_policy#nestedatt--include--github_organization
variable "github_organization" {
  type        = string
  description = "The name of the organization."
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_workers_kv_namespace" "preview" {
  account_id = var.cloudflare_account_id
  title      = "${var.kv_namespace}-preview"
}

resource "cloudflare_workers_kv_namespace" "production" {
  account_id = var.cloudflare_account_id
  title      = "${var.kv_namespace}-production"
}

resource "cloudflare_r2_bucket" "preview" {
  account_id = var.cloudflare_account_id
  name       = "${var.r2_bucket_name}-preview"
  location   = var.r2_bucket_location
}

resource "cloudflare_r2_bucket" "production" {
  account_id = var.cloudflare_account_id
  name       = "${var.r2_bucket_name}-production"
  location   = var.r2_bucket_location
}

resource "cloudflare_d1_database" "preview" {
  account_id = var.cloudflare_account_id
  name       = "${var.d1_name}-preview"
}

resource "cloudflare_d1_database" "production" {
  account_id = var.cloudflare_account_id
  name       = "${var.d1_name}-production"
}

resource "cloudflare_pages_project" "page" {
  account_id        = var.cloudflare_account_id
  name              = var.pages_project_name
  production_branch = var.pages_production_branch

  lifecycle {
    ignore_changes = [build_config]
  }
}

resource "cloudflare_pages_domain" "preview" {
  account_id   = var.cloudflare_account_id
  project_name = var.pages_project_name
  domain       = var.pages_preview_domain
  depends_on   = [cloudflare_pages_project.page]
}

resource "cloudflare_pages_domain" "production" {
  account_id   = var.cloudflare_account_id
  project_name = var.pages_project_name
  domain       = var.pages_production_domain
  depends_on   = [cloudflare_pages_project.page]
}

resource "cloudflare_record" "preview" {
  zone_id = var.cloudflare_zone_id
  name    = cloudflare_pages_domain.preview.domain
  content = "${var.pages_preview_branch}.${cloudflare_pages_project.page.subdomain}"
  type    = "CNAME"
  proxied = true
}

resource "cloudflare_record" "production" {
  zone_id = var.cloudflare_zone_id
  name    = cloudflare_pages_domain.production.domain
  content = cloudflare_pages_project.page.subdomain
  type    = "CNAME"
  proxied = true
}

data "cloudflare_zero_trust_access_identity_provider" "idp" {
  account_id = var.cloudflare_account_id
  name       = var.github_identity_provider_name
}

resource "cloudflare_zero_trust_access_service_token" "e2e" {
  account_id           = var.cloudflare_account_id
  name                 = "${cloudflare_pages_domain.production.domain} End-to-End"
  duration             = "8760h"
  min_days_for_renewal = 30
}

resource "cloudflare_zero_trust_access_policy" "github_organization" {
  account_id = var.cloudflare_account_id
  name       = "Allow GitHub organization"
  decision   = "allow"

  include {
    github {
      identity_provider_id = data.cloudflare_zero_trust_access_identity_provider.idp.id
      name                 = var.github_organization
    }
  }
}

resource "cloudflare_zero_trust_access_policy" "e2e" {
  account_id = var.cloudflare_account_id
  name       = "Allow End-to-End service token"
  decision   = "non_identity"

  include {
    service_token = [cloudflare_zero_trust_access_service_token.e2e.id]
  }
}

resource "cloudflare_zero_trust_access_application" "preview" {
  account_id                 = var.cloudflare_account_id
  name                       = cloudflare_pages_domain.preview.domain
  domain                     = cloudflare_pages_domain.preview.domain
  type                       = "self_hosted"
  session_duration           = "24h"
  auto_redirect_to_identity  = true
  http_only_cookie_attribute = true
  same_site_cookie_attribute = "lax"
  allowed_idps               = [data.cloudflare_zero_trust_access_identity_provider.idp.id]
  policies = [
    cloudflare_zero_trust_access_policy.github_organization.id,
    cloudflare_zero_trust_access_policy.e2e.id
  ]
  destinations {
    uri = cloudflare_pages_domain.preview.domain
  }
  destinations {
    uri = "*.${cloudflare_pages_project.page.subdomain}"
  }
}

output "domain_page" {
  value = cloudflare_pages_project.page.subdomain
}

output "domain_preview" {
  value = cloudflare_pages_domain.preview.domain
}

output "domain_production" {
  value = cloudflare_pages_domain.production.domain
}

output "kv_preview" {
  value = cloudflare_workers_kv_namespace.preview.id
}

output "kv_production" {
  value = cloudflare_workers_kv_namespace.production.id
}

output "r2_preview" {
  value = cloudflare_r2_bucket.preview.id
}

output "r2_production" {
  value = cloudflare_r2_bucket.production.id
}

output "d1_preview" {
  value = cloudflare_d1_database.preview.id
}

output "d1_production" {
  value = cloudflare_d1_database.production.id
}

output "jwt_audience" {
  value = cloudflare_zero_trust_access_application.preview.aud
}

output "e2e_client_id" {
  value = cloudflare_zero_trust_access_service_token.e2e.client_id
}

output "e2e_client_secret" {
  value     = cloudflare_zero_trust_access_service_token.e2e.client_secret
  sensitive = true
}

output "web_analytics_token" {
  value = cloudflare_pages_project.page.build_config[0].web_analytics_token
}
