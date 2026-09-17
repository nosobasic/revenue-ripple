output "ses_domain_verification_token" {
  value       = aws_ses_domain_identity.main.verification_token
  description = "Add a TXT record at _amazonses.revenueripple.org with this value."
}

output "ses_dkim_tokens" {
  value       = aws_ses_domain_dkim.main.dkim_tokens
  description = "Three CNAME records: {token}._domainkey.revenueripple.org -> {token}.dkim.amazonses.com"
}

output "ses_mail_from_domain" {
  value       = aws_ses_domain_mail_from.main.mail_from_domain
  description = "MAIL FROM: MX 10 feedback-smtp.us-east-1.amazonses.com and SPF include:amazonses.com"
}

output "founders_queue_url" {
  value       = aws_sqs_queue.founders.url
  description = "FIFO queue Flask and the Founders worker use for 0/5-minute sends."
}

output "founders_dlq_url" {
  value = aws_sqs_queue.founders_dlq.url
}

output "ses_configuration_set" {
  value = aws_ses_configuration_set.main.name
}

output "template_bucket" {
  value = aws_s3_bucket.templates.id
}

output "sns_topic_arn" {
  value = aws_sns_topic.ses_events.arn
}

output "sqs_send_url" {
  value = aws_sqs_queue.send.url
}

output "due_worker_name" {
  value = aws_lambda_function.due_worker.function_name
}
