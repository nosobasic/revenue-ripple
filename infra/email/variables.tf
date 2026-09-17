variable "region" {
  type    = string
  default = "us-east-1"
}

variable "domain" {
  type    = string
  default = "revenueripple.org"
}

variable "from_address" {
  type    = string
  default = "Donte Willis <donte@revenueripple.org>"
}

variable "app_base_url" {
  type    = string
  default = "https://revenueripple.org"
}

variable "supabase_url" {
  type = string
}

variable "supabase_service_role_key" {
  type      = string
  sensitive = true
}

variable "email_send_enabled" {
  type    = bool
  default = false
}

variable "email_daily_send_cap" {
  type    = number
  default = 200
}

variable "email_physical_address" {
  type    = string
  default = "Revenue Ripple, support@revenueripple.org"
}

variable "due_worker_rate_minutes" {
  type    = number
  default = 15
}
