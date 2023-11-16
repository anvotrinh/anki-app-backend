import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default function(to, subject, text) {
  const msg = {
    to: to.split(","),
    from: process.env.FROM_EMAIL,
    subject,
    text
  };
  sgMail.send(msg);
}
