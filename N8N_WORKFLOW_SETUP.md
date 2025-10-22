# n8n Workflow Setup Guide

## 🔧 **Required Credentials & Configuration**

Your n8n workflow needs the following credentials and parameters configured:

### **1. Stripe Credentials**
- **What**: Stripe API Key for accessing MRR data
- **Where**: In the "Get Stripe MRR" node
- **How**: 
  - Go to Stripe Dashboard → Developers → API Keys
  - Copy your **Secret Key** (starts with `sk_live_` or `sk_test_`)
  - Paste in n8n Stripe credentials

### **2. Slack Credentials** 
- **What**: Slack Bot Token for sending messages
- **Where**: In the "Send Slack Message" nodes
- **How**:
  - Go to https://api.slack.com/apps
  - Create new app or use existing
  - Go to "OAuth & Permissions" → "Bot User OAuth Token"
  - Copy token (starts with `xoxb-`)
  - Paste in n8n Slack credentials

### **3. Slack Channel ID**
- **What**: The channel where messages will be sent
- **Where**: In "Send Slack Message" node parameters
- **How**:
  - In Slack, right-click the channel → "Copy link"
  - Extract the channel ID from the URL (e.g., `C1234567890`)
  - Or use `#general` format

### **4. Workflow Configuration Parameters**

#### **User ID**
- **What**: Your user ID from the Command Center
- **Where**: Workflow Configuration node
- **How**: This will be provided by the Command Center when you create an agent

#### **Instance ID** 
- **What**: Your agent instance ID
- **Where**: Workflow Configuration node  
- **How**: This will be provided by the Command Center when you create an agent

#### **Agent ID**
- **What**: The agent type (e.g., "daily-pulse")
- **Where**: Workflow Configuration node
- **How**: This will be provided by the Command Center

#### **Webhook Secret**
- **What**: Secret key for webhook authentication
- **Where**: Workflow Configuration node
- **How**: Set this in your backend environment variables:
  ```bash
  N8N_WEBHOOK_SECRET=your-secret-key-here
  ```

#### **Days to Look Back**
- **What**: Number of days for data analysis
- **Where**: Workflow Configuration node
- **Example**: `7` (for last 7 days)

#### **API Endpoint for New Signups**
- **What**: Your backend API endpoint for signup data
- **Where**: "Get New Signups" node
- **Example**: `https://revenue-ripple.onrender.com/api/signups`

#### **Recipient Email Address**
- **What**: Email address for notifications
- **Where**: "Send Email" node
- **Example**: `your-email@example.com`

## 🚀 **Step-by-Step Setup**

### **Step 1: Configure Credentials**
1. **Stripe**: Add your Stripe API key
2. **Slack**: Add your Slack bot token
3. **Email**: Configure your email service (Gmail, SendGrid, etc.)

### **Step 2: Set Workflow Parameters**
1. **User ID**: Will be provided by Command Center
2. **Instance ID**: Will be provided by Command Center  
3. **Agent ID**: Will be provided by Command Center
4. **Webhook Secret**: Set to match your backend
5. **Days to Look Back**: Set to `7` (or your preference)
6. **API Endpoint**: Set to your backend URL
7. **Email Address**: Set to your email

### **Step 3: Test the Workflow**
1. **Manual Test**: Run the workflow manually to test all connections
2. **Check Logs**: Verify all nodes execute successfully
3. **Verify Output**: Ensure data is being pulled correctly

### **Step 4: Connect to Command Center**
1. **Create Agent**: Use the Command Center to create a new agent
2. **Configure Credentials**: Add your API keys in the Command Center
3. **Test Run**: Use "Run Now" to trigger the workflow

## 🔐 **Security Notes**

- **Never commit credentials** to version control
- **Use environment variables** for sensitive data
- **Rotate API keys** regularly
- **Use webhook secrets** for authentication

## 📊 **Expected Data Flow**

1. **Command Center** triggers n8n workflow with user data
2. **n8n** pulls user's Stripe MRR data
3. **n8n** pulls user's signup data from your API
4. **n8n** generates personalized report
5. **n8n** sends results via Slack/Email
6. **n8n** calls webhook with results
7. **Command Center** displays results to user

## 🆘 **Troubleshooting**

### **Common Issues:**
- **401 Unauthorized**: Check API keys and tokens
- **Invalid Channel ID**: Verify Slack channel ID format
- **Webhook Fails**: Check webhook secret matches backend
- **No Data**: Verify API endpoints are accessible

### **Testing Commands:**
```bash
# Test Stripe API
curl -H "Authorization: Bearer sk_test_..." https://api.stripe.com/v1/charges

# Test Slack API  
curl -H "Authorization: Bearer xoxb-..." https://slack.com/api/auth.test

# Test your backend
curl https://revenue-ripple.onrender.com/api/command-center/health
```
