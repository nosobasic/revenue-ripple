locals {
  name = "rr-email"
  env = {
    SUPABASE_URL              = var.supabase_url
    SUPABASE_SERVICE_ROLE_KEY = var.supabase_service_role_key
    SES_FROM                  = var.from_address
    SES_CONFIGURATION_SET     = aws_ses_configuration_set.main.name
    APP_BASE_URL              = var.app_base_url
    EMAIL_SEND_ENABLED         = var.email_send_enabled ? "true" : "false"
    EMAIL_DAILY_SEND_CAP      = tostring(var.email_daily_send_cap)
    EMAIL_TEMPLATE_BUCKET      = aws_s3_bucket.templates.id
    EMAIL_PHYSICAL_ADDRESS     = var.email_physical_address
    AWS_DEFAULT_REGION         = var.region
    EMAIL_FOUNDERS_QUEUE_URL   = aws_sqs_queue.founders.url
  }
}

data "archive_file" "due_worker" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/due_worker"
  output_path = "${path.module}/.build/due_worker.zip"
}

data "archive_file" "bounce_handler" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/bounce_handler"
  output_path = "${path.module}/.build/bounce_handler.zip"
}

data "archive_file" "founders_send" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/founders_send"
  output_path = "${path.module}/.build/founders_send.zip"
}

resource "aws_iam_role" "lambda" {
  name = "${local.name}-lambda"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda" {
  name = "${local.name}-lambda"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.templates.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ChangeMessageVisibility"
        ]
        Resource = [
          aws_sqs_queue.send.arn,
          aws_sqs_queue.founders.arn,
          aws_sqs_queue.founders_dlq.arn
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "due_worker" {
  function_name    = "${local.name}-due-worker"
  filename         = data.archive_file.due_worker.output_path
  source_code_hash = data.archive_file.due_worker.output_base64sha256
  handler          = "handler.handler"
  runtime          = "python3.12"
  role             = aws_iam_role.lambda.arn
  timeout          = 120
  environment { variables = local.env }
}

resource "aws_lambda_function" "bounce_handler" {
  function_name    = "${local.name}-bounce"
  filename         = data.archive_file.bounce_handler.output_path
  source_code_hash = data.archive_file.bounce_handler.output_base64sha256
  handler          = "handler.handler"
  runtime          = "python3.12"
  role             = aws_iam_role.lambda.arn
  timeout          = 30
  environment { variables = local.env }
}

resource "aws_lambda_function" "founders_send" {
  function_name    = "${local.name}-founders-send"
  filename         = data.archive_file.founders_send.output_path
  source_code_hash = data.archive_file.founders_send.output_base64sha256
  handler          = "handler.handler"
  runtime          = "python3.12"
  role             = aws_iam_role.lambda.arn
  timeout          = 30
  environment { variables = local.env }
}

resource "aws_cloudwatch_event_rule" "due" {
  name                = "${local.name}-due"
  schedule_expression = "rate(${var.due_worker_rate_minutes} minutes)"
}

resource "aws_cloudwatch_event_target" "due" {
  rule      = aws_cloudwatch_event_rule.due.name
  target_id = "due-worker"
  arn       = aws_lambda_function.due_worker.arn
}

resource "aws_lambda_permission" "due_events" {
  statement_id  = "AllowEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.due_worker.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.due.arn
}

resource "aws_lambda_event_source_mapping" "founders" {
  event_source_arn                   = aws_sqs_queue.founders.arn
  function_name                      = aws_lambda_function.founders_send.arn
  batch_size                         = 1
  function_response_types           = ["ReportBatchItemFailures"]
  scaling_config {
    maximum_concurrency = 2
  }
}
