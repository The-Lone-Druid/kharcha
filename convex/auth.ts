import { convexAuth } from "@convex-dev/auth/server";
import type { EmailConfig } from "@auth/core/providers";

const customResendProvider: EmailConfig = {
  id: "resend",
  type: "email",
  name: "Resend",
  from: process.env.RESEND_FROM_EMAIL || "noreply@kharcha.app",
  apiKey: process.env.RESEND_API_KEY,
  maxAge: 24 * 60 * 60,
  async sendVerificationRequest(params) {
    const { identifier: to, provider, url, theme } = params;
    const { host } = new URL(url);

    // Custom HTML template with button and manual link
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to ${host}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #e1e5e9;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a202c;">Welcome to Kharcha</h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; color: #718096;">Your Personal Expense Tracker</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 500; color: #1a202c;">Sign in to your account</h2>
              <p style="margin: 0 0 32px 0; font-size: 16px; color: #4a5568; line-height: 1.5;">
                Click the button below to sign in to your Kharcha account. This link will expire in 24 hours.
              </p>

              <!-- Sign In Button -->
              <a href="${url}" style="display: inline-block; padding: 16px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2); transition: background-color 0.2s;">
                Sign In to Kharcha
              </a>

              <p style="margin: 32px 0 16px 0; font-size: 14px; color: #718096;">
                Or copy and paste this link into your browser:
              </p>

              <!-- Manual Link -->
              <p style="margin: 0; word-break: break-all;">
                <a href="${url}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">${url}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #e1e5e9;">
              <p style="margin: 0; font-size: 14px; color: #718096;">
                If you didn't request this email, you can safely ignore it.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #a0aec0;">
                © 2025 Kharcha. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const textContent = `Sign in to ${host}

Welcome to Kharcha!

Click this link to sign in to your account:
${url}

This link will expire in 24 hours.

If you didn't request this email, you can safely ignore it.

© 2025 Kharcha. All rights reserved.`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: provider.from,
        to,
        subject: `Sign in to ${host}`,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!res.ok) {
      throw new Error("Resend error: " + JSON.stringify(await res.json()));
    }
  },
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [customResendProvider],
});
