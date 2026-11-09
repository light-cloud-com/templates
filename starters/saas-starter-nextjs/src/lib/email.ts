import { Resend } from "resend";
import { config, emailEnabled } from "./config";

type Email = { to: string; subject: string; text: string };

const resend = emailEnabled ? new Resend(config.email.resendApiKey) : null;

/** Sends through Resend when RESEND_API_KEY is set; otherwise prints the email (and its link) to the server log. */
export async function sendEmail({ to, subject, text }: Email) {
  if (!resend) {
    console.log(`[email] Not sent, RESEND_API_KEY is not set. To: ${to}\nSubject: ${subject}\n${text}\n[email] end`);
    return;
  }
  const { error } = await resend.emails.send({ from: config.email.from, to, subject, text });
  if (error) throw new Error(`Email to ${to} failed: ${error.message}`);
}

const name = config.appName;

export const emails = {
  verify: (url: string) => ({
    subject: `Confirm your email for ${name}`,
    text: `Confirm your email address by opening this link:\n\n${url}\n\nIf you did not sign up, ignore this email.`,
  }),
  reset: (url: string) => ({
    subject: `Reset your ${name} password`,
    text: `Choose a new password here (the link works for one hour):\n\n${url}\n\nIf you did not ask for this, ignore this email.`,
  }),
  invite: (url: string, workspace: string, inviter: string) => ({
    subject: `${inviter} invited you to ${workspace} on ${name}`,
    text: `${inviter} invited you to join the ${workspace} workspace on ${name}.\n\nAccept the invitation:\n\n${url}`,
  }),
  welcome: (userName: string) => ({
    subject: `Welcome to ${name}`,
    text: `Hi ${userName},\n\nThanks for signing up to ${name}. Your dashboard has a short checklist to get you going.`,
  }),
};
