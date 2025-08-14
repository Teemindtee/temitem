# Email Notification System Setup

## Overview
FinderMeister now includes a comprehensive email notification system that sends alerts to both finders and clients for various platform activities.

## Email Notifications

### For Finders:
- New message from client
- Hired for a project (proposal accepted)  
- Work submission approved
- Work submission rejected/revision requested

### For Clients:
- New proposal received on request
- Work submission from finder
- New message from finder

## Environment Variables Required

Add these environment variables to your `.env` file or Replit Secrets:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Settings
FROM_EMAIL=noreply@findermeister.com
FRONTEND_URL=https://your-replit-url.replit.app
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate a password
   - Use this password as `SMTP_PASS`

## Alternative SMTP Providers

### Using SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Using Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

## Testing Email Setup

Once configured, emails will be automatically sent when:
- Clients message finders
- Finders submit proposals
- Proposals are accepted (hiring)
- Work is submitted for review
- Work submissions are approved/rejected

## Troubleshooting

If emails aren't sending:
1. Check server logs for email errors
2. Verify SMTP credentials
3. Ensure SMTP_HOST and SMTP_PORT are correct
4. For Gmail, confirm app password is used (not regular password)
5. Check spam folders for test emails

## Security Notes

- Never commit email credentials to version control
- Use app passwords instead of regular passwords
- Consider using a dedicated email service for production
- Set appropriate FROM_EMAIL for your domain