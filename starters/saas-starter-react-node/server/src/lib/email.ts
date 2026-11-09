import { Resend } from "resend";
import { config } from "../config.ts";

interface Email {
  to: string;
  subject: string;
  text: string;
  /** The link the email is about, logged when no email provider is set. */
  link?: string;
}

const resend = config.email ? new Resend(config.email.apiKey) : null;

export async function sendEmail(email: Email): Promise<void> {
  if (!resend || !config.email) {
    // No provider: the deployer finds the link in the server log.
    console.log(`[email] (not sent, RESEND_API_KEY is not set) to=${email.to} subject="${email.subject}"${email.link ? ` link=${email.link}` : ""}`);
    return;
  }
  const { error } = await resend.emails.send({
    from: config.email.from,
    to: email.to,
    subject: email.subject,
    text: email.text,
  });
  if (error) {
    console.error(`[email] Resend rejected the email to ${email.to}: ${error.message}`);
    throw new Error("Could not send the email");
  }
}

const app = () => config.appName;

export const emails = {
  verify: (to: string, link: string) =>
    sendEmail({ to, link, subject: `Confirm your email for ${app()}`, text: `Confirm your email address by opening this link:\n\n${link}\n\nIf you did not sign up, ignore this email.` }),
  reset: (to: string, link: string) =>
    sendEmail({ to, link, subject: `Reset your ${app()} password`, text: `Choose a new password here:\n\n${link}\n\nThe link expires in one hour. If you did not ask for this, ignore this email.` }),
  invite: (to: string, link: string, workspace: string, inviter: string) =>
    sendEmail({ to, link, subject: `${inviter} invited you to ${workspace} on ${app()}`, text: `${inviter} invited you to join the ${workspace} workspace.\n\nAccept the invitation:\n\n${link}` }),
  welcome: (to: string, name: string) =>
    sendEmail({ to, subject: `Welcome to ${app()}`, text: `Hi ${name || "there"},\n\nYour account is ready. Create a workspace and your first project to get started.` }),
};
