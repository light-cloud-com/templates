import { type EmailSender } from "@wasp.sh/spec";

export const emailSender: EmailSender = {
  // SMTP works with any transactional email service (Resend, SendGrid,
  // Mailgun, Postmark, ...) — set SMTP_HOST, SMTP_PORT, SMTP_USERNAME and
  // SMTP_PASSWORD in the environment variables, and change `defaultFrom`
  // below to an address your provider lets you send from.
  //
  // The deployment starts with placeholder SMTP_* values so the server can
  // boot, but no email leaves the app until you replace them — and signup
  // requires a verification email, so set these up early. Guide:
  // https://docs.opensaas.sh/guides/email-sending/
  //
  // (The upstream template uses the "Dummy" provider here, which only logs
  // emails and refuses to build for production.)
  provider: "SMTP",
  defaultFrom: {
    name: "Open SaaS App",
    // Must be an address your email provider is configured to send from!
    email: "me@example.com",
  },
};
