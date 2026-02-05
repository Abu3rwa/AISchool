# Gmail OAuth Integration Plan

## Overview
Allow teachers (and admins) to connect their Gmail account so the system can send emails on their behalf (e.g., grade notifications to parents/students). Users can enable Gmail connection from:
1. **Settings page** — dedicated "Email Settings" section
2. **Login flow** — optional prompt after first login

---

## User Flow

### Option A: Connect from Settings Page
1. User navigates to `/portal/settings`
2. Sees "Email Settings" section with "Connect Gmail" button
3. Clicks button → redirected to Google OAuth consent screen
4. Grants permission → redirected back to `/portal/settings?gmail=connected`
5. Settings page shows "Gmail Connected ✓" with option to disconnect

### Option B: Prompt After Login (Optional)
1. User logs in successfully
2. If `user.gmailConnected === false`, show a dismissible banner/modal:
   > "Connect your Gmail to send grade notifications directly from your email address."
   > [Connect Gmail] [Maybe Later]
3. If dismissed, don't show again for 7 days (store in localStorage)
4. If connected, banner never shows again

---

## Data Model Changes

### `User` model additions
| Field | Type | Notes |
|-------|------|-------|
| `gmailConnected` | Boolean | Default false |
| `gmailRefreshToken` | String | Encrypted refresh token |
| `gmailEmail` | String | The connected Gmail address (for display) |
| `gmailConnectedAt` | Date | When the connection was made |
| `gmailScopes` | [String] | Granted scopes (for future expansion) |

**Security:**
- `gmailRefreshToken` must be encrypted at rest (use `crypto` AES-256)
- Never expose refresh token to client
- Only expose `gmailConnected`, `gmailEmail`, `gmailConnectedAt` to client

---

## Google Cloud Setup (Prerequisites)

### 1. Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Gmail API**
4. Go to **Credentials** → Create **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:5000/api/auth/gmail/callback` (dev)
   - `https://yourdomain.com/api/auth/gmail/callback` (prod)
7. Download client credentials (Client ID + Client Secret)

### 2. Configure OAuth Consent Screen
1. Go to **OAuth consent screen**
2. User type: **External** (or Internal if Google Workspace)
3. App name: "GradeBooking" (or your app name)
4. Scopes: Add `https://www.googleapis.com/auth/gmail.send`
5. Test users: Add your test accounts (while in testing mode)

### 3. Environment Variables
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/gmail/callback
GMAIL_TOKEN_ENCRYPTION_KEY=32-byte-hex-key-for-aes-256
```

---

## API Endpoints

### Gmail OAuth Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/auth/gmail/connect` | Initiate OAuth flow, redirect to Google | Required |
| GET | `/api/auth/gmail/callback` | Handle OAuth callback, store tokens | Required (via state) |
| POST | `/api/auth/gmail/disconnect` | Revoke access, clear tokens | Required |
| GET | `/api/auth/gmail/status` | Check connection status | Required |

### Endpoint Details

#### `GET /api/auth/gmail/connect`
```js
// Generate OAuth URL and redirect
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.send'],
  prompt: 'consent', // Force consent to get refresh token
  state: encryptedUserId // To identify user on callback
});
res.redirect(authUrl);
```

#### `GET /api/auth/gmail/callback`
```js
// Exchange code for tokens
const { tokens } = await oauth2Client.getToken(code);

// Get user's Gmail address
oauth2Client.setCredentials(tokens);
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
const profile = await gmail.users.getProfile({ userId: 'me' });

// Encrypt and store refresh token
const encryptedToken = encrypt(tokens.refresh_token);
await User.findByIdAndUpdate(userId, {
  gmailConnected: true,
  gmailRefreshToken: encryptedToken,
  gmailEmail: profile.data.emailAddress,
  gmailConnectedAt: new Date(),
  gmailScopes: ['gmail.send']
});

// Redirect back to settings with success
res.redirect('/portal/settings?gmail=connected');
```

#### `POST /api/auth/gmail/disconnect`
```js
// Revoke token at Google
const refreshToken = decrypt(user.gmailRefreshToken);
await oauth2Client.revokeToken(refreshToken);

// Clear from database
await User.findByIdAndUpdate(userId, {
  gmailConnected: false,
  gmailRefreshToken: null,
  gmailEmail: null,
  gmailConnectedAt: null,
  gmailScopes: []
});

res.json({ message: 'Gmail disconnected' });
```

#### `GET /api/auth/gmail/status`
```js
res.json({
  connected: user.gmailConnected,
  email: user.gmailEmail,
  connectedAt: user.gmailConnectedAt
});
```

---

## Email Sending Service

### `src/services/emailService.js`
```js
const { google } = require('googleapis');
const { encrypt, decrypt } = require('../helpers/encryption');

class EmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Send email using user's connected Gmail
   * Falls back to system email if user not connected
   */
  async sendEmail({ fromUser, to, subject, html }) {
    if (fromUser.gmailConnected && fromUser.gmailRefreshToken) {
      return this.sendViaUserGmail(fromUser, to, subject, html);
    } else {
      return this.sendViaSystemEmail(to, subject, html);
    }
  }

  async sendViaUserGmail(user, to, subject, html) {
    const refreshToken = decrypt(user.gmailRefreshToken);
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const raw = this.createRawEmail({
      from: user.gmailEmail,
      to,
      subject,
      html
    });

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw }
    });
  }

  async sendViaSystemEmail(to, subject, html) {
    // Fallback: use Nodemailer with system Gmail or SendGrid
    // Implementation depends on your fallback choice
  }

  createRawEmail({ from, to, subject, html }) {
    const message = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      html
    ].join('\r\n');

    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}

module.exports = new EmailService();
```

---

## Encryption Helper

### `src/helpers/encryption.js`
```js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.GMAIL_TOKEN_ENCRYPTION_KEY, 'hex');

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText) {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

module.exports = { encrypt, decrypt };
```

---

## Client Implementation

### Settings Page: Email Settings Section
```jsx
// client/src/pages/school/settings/EmailSettingsSection.jsx

const EmailSettingsSection = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGmailStatus();
  }, []);

  const fetchGmailStatus = async () => {
    const res = await api.get('/auth/gmail/status');
    setStatus(res.data);
    setLoading(false);
  };

  const handleConnect = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_URL}/auth/gmail/connect`;
  };

  const handleDisconnect = async () => {
    await api.post('/auth/gmail/disconnect');
    setStatus({ connected: false });
  };

  if (loading) return <Spinner />;

  return (
    <Card className="mb-4">
      <Card.Header>Email Settings</Card.Header>
      <Card.Body>
        {status?.connected ? (
          <div>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="text-success">✓</span>
              <span>Connected as <strong>{status.email}</strong></span>
            </div>
            <div className="text-muted mb-3" style={{ fontSize: 13 }}>
              Connected on {new Date(status.connectedAt).toLocaleDateString()}
            </div>
            <Button variant="outline-danger" size="sm" onClick={handleDisconnect}>
              Disconnect Gmail
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-muted mb-3">
              Connect your Gmail to send grade notifications directly from your email address.
            </p>
            <Button variant="primary" onClick={handleConnect}>
              <img src="/google-icon.svg" alt="" width={18} className="me-2" />
              Connect Gmail
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
```

### Post-Login Prompt (Optional)
```jsx
// client/src/components/GmailConnectPrompt.jsx

const GmailConnectPrompt = () => {
  const user = useSelector(selectSchoolUser);
  const [dismissed, setDismissed] = useState(false);

  // Check if already dismissed recently
  useEffect(() => {
    const dismissedAt = localStorage.getItem('gmailPromptDismissed');
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) setDismissed(true);
    }
  }, []);

  if (user?.gmailConnected || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('gmailPromptDismissed', Date.now().toString());
    setDismissed(true);
  };

  const handleConnect = () => {
    window.location.href = `${API_URL}/auth/gmail/connect`;
  };

  return (
    <Alert variant="info" dismissible onClose={handleDismiss} className="mb-4">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <strong>Connect your Gmail</strong>
          <div className="text-muted">Send grade notifications directly from your email address.</div>
        </div>
        <Button variant="primary" size="sm" onClick={handleConnect}>
          Connect Gmail
        </Button>
      </div>
    </Alert>
  );
};
```

---

## File Structure

### Backend
```
src/
├── controllers/
│   └── gmailAuthController.js
├── routes/
│   └── gmailAuthRoutes.js
├── services/
│   └── emailService.js
├── helpers/
│   └── encryption.js
└── models/
    └── User.js (add gmail fields)
```

### Client
```
client/src/
├── pages/school/settings/
│   ├── SettingsPage.jsx
│   └── EmailSettingsSection.jsx
├── components/
│   └── GmailConnectPrompt.jsx
└── store/slices/
    └── schoolAuthSlice.js (add gmail status)
```

---

## Implementation Order

### Phase 1: Backend OAuth Flow
1. Add gmail fields to User model
2. Create encryption helper
3. Create gmailAuthController (connect, callback, disconnect, status)
4. Create gmailAuthRoutes
5. Wire routes in server.js

### Phase 2: Email Service
1. Create emailService with Gmail API integration
2. Add fallback to system email
3. Test sending via connected account

### Phase 3: Client Settings
1. Create EmailSettingsSection component
2. Add to SettingsPage
3. Handle OAuth redirect success/error

### Phase 4: Post-Login Prompt (Optional)
1. Create GmailConnectPrompt component
2. Add to SchoolLayout or dashboard
3. Implement dismiss logic with localStorage

### Phase 5: Integration with Grades
1. When teacher publishes grades, use emailService
2. Send notification to student/parent
3. Email comes from teacher's connected Gmail (or fallback)

---

## Security Checklist

- [ ] Refresh tokens encrypted with AES-256-GCM
- [ ] Encryption key stored in environment variable (not in code)
- [ ] OAuth state parameter includes encrypted user ID (prevent CSRF)
- [ ] Tokens never exposed to client
- [ ] Revoke token at Google when user disconnects
- [ ] Handle token expiration/refresh gracefully
- [ ] Rate limit OAuth endpoints
- [ ] Log all OAuth events for audit

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| User denies consent | Redirect to settings with `?gmail=denied` |
| Token expired | Refresh automatically, or prompt reconnect |
| Token revoked externally | Detect on send, clear local state, prompt reconnect |
| Google API error | Log error, fall back to system email |
| Encryption key missing | Fail startup with clear error message |

---

## Notes

- **Fallback email**: If user hasn't connected Gmail, use a system email (SendGrid, SES, or school's shared Gmail)
- **Scope**: Only request `gmail.send` — minimal permissions
- **Consent prompt**: Use `prompt: 'consent'` to always get refresh token
- **Token storage**: Never store access tokens (short-lived), only refresh tokens
