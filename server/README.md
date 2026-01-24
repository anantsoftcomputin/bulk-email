# Bulk Email Sender - Backend API

Node.js backend server with Nodemailer for sending emails via SMTP.

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your SMTP credentials.

3. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /api/email/health
```

### Test SMTP Configuration
```
POST /api/email/test
Content-Type: application/json

{
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "username": "your-email@gmail.com",
    "password": "your-app-password",
    "fromEmail": "your-email@gmail.com",
    "fromName": "Your Name"
  },
  "toEmail": "recipient@example.com"
}
```

### Verify SMTP Configuration
```
POST /api/email/verify
Content-Type: application/json

{
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "username": "your-email@gmail.com",
    "password": "your-app-password"
  }
}
```

### Send Single Email
```
POST /api/email/send
Content-Type: application/json

{
  "config": { /* SMTP config */ },
  "emailData": {
    "to": "recipient@example.com",
    "subject": "Hello",
    "body": "<h1>Email content</h1>",
    "html": "<h1>Email content</h1>"
  }
}
```

### Send Bulk Emails
```
POST /api/email/send-bulk
Content-Type: application/json

{
  "config": { /* SMTP config */ },
  "rateLimit": 100,
  "emails": [
    {
      "to": "user1@example.com",
      "subject": "Hello User 1",
      "body": "<p>Content for user 1</p>"
    },
    {
      "to": "user2@example.com",
      "subject": "Hello User 2",
      "body": "<p>Content for user 2</p>"
    }
  ]
}
```

## SMTP Configuration Examples

### Gmail
```json
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "username": "your-email@gmail.com",
  "password": "your-app-password"
}
```
**Note:** Use [App Passwords](https://support.google.com/accounts/answer/185833) for Gmail.

### Outlook/Office365
```json
{
  "host": "smtp-mail.outlook.com",
  "port": 587,
  "secure": false,
  "username": "your-email@outlook.com",
  "password": "your-password"
}
```

### Custom SMTP
```json
{
  "host": "mail.yourdomain.com",
  "port": 587,
  "secure": false,
  "username": "user@yourdomain.com",
  "password": "your-password"
}
```

## Rate Limiting

The `send-bulk` endpoint automatically rate-limits emails based on the `rateLimit` parameter (emails per hour). This helps prevent SMTP server restrictions.

## Error Handling

All endpoints return JSON responses:

**Success:**
```json
{
  "success": true,
  "messageId": "...",
  "message": "Email sent successfully"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Security Notes

- Never commit `.env` file
- Use app-specific passwords for email providers
- Enable CORS only for trusted origins
- Use HTTPS in production
- Implement rate limiting and authentication in production
