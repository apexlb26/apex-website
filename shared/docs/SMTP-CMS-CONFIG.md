# APEX SMTP + CMS mail configuration

## Resolution order

1. Protected CMS mail settings in `/admin/settings` override environment values.
2. Missing CMS fields fall back to `.env` / deployment environment variables.
3. If CMS overrides are cleared, the site returns completely to environment fallback.

No provider host, mailbox, password or recipient is hardcoded in application code.

## Environment fallback

Supported keys:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `APEX_NOTIFY_EMAIL`
- `SMTP_URL` (optional alternative)
- `RESEND_API_KEY` (optional alternative transport)

## CMS security

The SMTP password is never returned by the admin API after saving. When a password
is saved from `/admin/settings`, it is encrypted with AES-256-GCM before being
stored in the MongoDB `state` collection. The encryption key is derived from
`APEX_MAIL_SETTINGS_KEY`, or `APEX_ADMIN_SECRET` when the dedicated key is not set.

Do not commit `.env`, `.env.local`, passwords, app passwords, or API keys. The provided setup helper writes the fallback to `.env`, which this repository already ignores.

## Admin workflow

Go to `/admin/settings`:

- edit host / port / secure / username / from / recipients
- optionally replace the SMTP password
- save
- click **Send test email**
- click **Use environment fallback** to clear CMS overrides

## Deployment

Set the environment fallback in the deployment platform first. Then optionally
use CMS overrides for operational changes that should not require a code deploy.
