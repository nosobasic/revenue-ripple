resource "aws_ses_domain_identity" "main" {
  domain = var.domain
}

resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "mail.${var.domain}"
}

resource "aws_ses_configuration_set" "main" {
  name = "${local.name}-cfg"
}

resource "aws_ses_event_destination" "sns" {
  name                   = "bounces-complaints"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true
  matching_types         = ["bounce", "complaint", "reject"]

  sns_destination {
    topic_arn = aws_sns_topic.ses_events.arn
  }
}

resource "aws_sns_topic" "ses_events" {
  name = "${local.name}-ses-events"
}

resource "aws_sns_topic_subscription" "bounce_lambda" {
  topic_arn = aws_sns_topic.ses_events.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.bounce_handler.arn
}

resource "aws_lambda_permission" "sns_bounce" {
  statement_id  = "AllowSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.bounce_handler.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.ses_events.arn
}

resource "aws_sesv2_account_suppression_attributes" "main" {
  suppressed_reasons = ["BOUNCE", "COMPLAINT"]
}

resource "aws_sqs_queue" "send" {
  name                       = "${local.name}-send"
  visibility_timeout_seconds = 120
  message_retention_seconds  = 86400
}

resource "aws_sqs_queue" "founders_dlq" {
  name                        = "${local.name}-founders-dlq.fifo"
  fifo_queue                  = true
  content_based_deduplication  = false
  message_retention_seconds    = 1209600
}

resource "aws_sqs_queue" "founders" {
  name                        = "${local.name}-founders.fifo"
  fifo_queue                  = true
  content_based_deduplication  = false
  visibility_timeout_seconds  = 180
  message_retention_seconds   = 86400
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.founders_dlq.arn
    maxReceiveCount      = 3
  })
}

resource "aws_s3_bucket" "templates" {
  bucket = "revenue-ripple-email-templates-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "templates" {
  bucket                  = aws_s3_bucket.templates.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets  = true
}

resource "aws_s3_object" "templates" {
  for_each = fileset("${path.module}/../../email_crm/templates", "**/*.html")
  bucket   = aws_s3_bucket.templates.id
  key      = "email-templates/${each.value}"
  source   = "${path.module}/../../email_crm/templates/${each.value}"
  etag     = filemd5("${path.module}/../../email_crm/templates/${each.value}")
  content_type = "text/html"
}
