# WhatsApp Cloud API OTP Setup Guide

This guide will help you set up Meta WhatsApp Cloud API for OTP authentication in your AgriTech application.

## Prerequisites

1. **Meta Developer Account**: You need a Meta Developer account
2. **Facebook Business Account**: Linked to your Meta Developer account
3. **WhatsApp Business Account**: Approved and linked to your Facebook Business account

## Step 1: Create Meta App

1. Go to [Meta Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Business" as app type
4. Select "WhatsApp" as the business service
5. Fill in your app details and create the app

## Step 2: Configure WhatsApp Business API

1. In your app dashboard, go to "WhatsApp" → "Getting Started"
2. Add your phone number (this will be your WhatsApp Business number)
3. Verify the phone number via SMS
4. Complete the business verification process

## Step 3: Get Required Credentials

### Access Token

1. Go to "App Settings" → "Basic"
2. Copy the "App Secret"
3. Go to "WhatsApp" → "API Setup"
4. Generate a "Permanent Access Token" (or use temporary for testing)
5. Copy the access token

### Phone Number ID

1. In "WhatsApp" → "API Setup"
2. Find your phone number and copy the "Phone Number ID"

### Verify Token (for webhooks - optional for OTP)

1. In "WhatsApp" → "Configuration"
2. Set a verify token (any string you choose)

## Step 4: Create WhatsApp Template

1. Go to "WhatsApp" → "Message Templates"
2. Click "Create Template"
3. Choose category: "Authentication"
4. Template name: `otp_verification` (must match the code)
5. Language: English
6. Template content:
   ```
   Your verification code is {{1}}. This code expires in 5 minutes.
   ```
7. Add the template and wait for approval (usually instant for authentication templates)

## Step 5: Configure Environment Variables

Update your `backend/.env` file with the credentials:

```env
# WhatsApp Cloud API Configuration
WHATSAPP_ACCESS_TOKEN=EAAYourActualAccessTokenHere
WHATSAPP_PHONE_NUMBER_ID=YourPhoneNumberIDHere
WHATSAPP_VERIFY_TOKEN=YourVerifyTokenHere
WHATSAPP_TEMPLATE_NAME=otp_verification
```

## Step 6: Test the Integration

### Using Postman

#### Send OTP

```http
POST http://localhost:5000/api/auth/send-whatsapp-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "purpose": "login"
}
```

#### Verify OTP

```http
POST http://localhost:5000/api/auth/verify-whatsapp-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "otp": "123456",
  "purpose": "login"
}
```

#### Resend OTP

```http
POST http://localhost:5000/api/auth/resend-whatsapp-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "purpose": "login"
}
```

## Step 7: Frontend Integration

Your frontend already has WhatsApp OTP UI. The backend endpoints are:

- `POST /api/auth/send-whatsapp-otp`
- `POST /api/auth/verify-whatsapp-otp`
- `POST /api/auth/resend-whatsapp-otp`

## API Response Formats

### Send OTP Success

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phoneNumber": "+919876543210",
    "purpose": "login",
    "expiresIn": "5 minutes",
    "isResend": false
  }
}
```

### Verify OTP Success

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "phoneNumber": "+919876543210",
    "purpose": "login",
    "userId": "user_id_here",
    "pendingUserId": "pending_user_id_here"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Rate Limiting

- **OTP Requests**: Max 5 requests per 15 minutes per IP
- **Resend**: Max 3 resends per hour per phone number
- **Verification Attempts**: Max 3 attempts per OTP

## Security Features

- ✅ 6-digit OTP with 5-minute expiry
- ✅ Rate limiting to prevent spam
- ✅ Max verification attempts protection
- ✅ Automatic OTP deletion after verification/expiry
- ✅ Phone number validation and formatting
- ✅ Secure OTP hashing in database

## Troubleshooting

### Common Issues

1. **"Template not approved or not found"**
   - Ensure your template is approved in WhatsApp Manager
   - Check template name matches `WHATSAPP_TEMPLATE_NAME`

2. **"Invalid parameter. Check phone number format"**
   - Phone numbers must include country code (+91 for India)
   - Must be exactly 10 digits after country code

3. **"Rate limit exceeded"**
   - Wait before sending another request
   - Check your app's rate limits in Meta Developer Console

4. **"Permission denied. Check access token"**
   - Verify your access token is correct and not expired
   - Ensure token has `whatsapp_business_messaging` permission

### Testing Tips

1. Use your own phone number for testing
2. Check WhatsApp Manager for message delivery status
3. Monitor API responses for error codes
4. Use Meta's webhook debugger for detailed logs

## Production Deployment

1. **Use Permanent Access Token**: Generate a permanent token for production
2. **Enable Two-Factor Authentication**: On your Meta Developer account
3. **Monitor Usage**: Set up alerts for API usage limits
4. **Webhook Security**: Implement webhook verification for production
5. **Rate Limiting**: Adjust rate limits based on your needs

## Support

- Meta WhatsApp Business API Documentation: https://developers.facebook.com/docs/whatsapp/
- Meta Developer Support: https://developers.facebook.com/support/

---

**Note**: WhatsApp Business API has usage limits and costs. Monitor your usage in the Meta Developer Console.
