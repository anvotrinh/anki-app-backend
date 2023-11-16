export const verifyEmailTitle = "Please verify your email address";

export const verifyEmailTemplate = (name, code) => `Hi ${name},

Thanks for getting started with AntRe! We need a little more information to complete your registration, including confirmation of your email address. Click below to confirm your email address: ${process.env.SERVER_URL}/verify/${code}
If you have problems, please paste the above URL into your web browser.

Thanks,
AntRe Support`;

export const resetPasswordEmailTitle = "Password Reset";

export const resetPasswordEmailTemplate = (
  email,
  code
) => `Someone recently requested that the password be reset for account with email: ${email}. Click below to reset your password: ${process.env.SERVER_URL}/resetPassword/${code}
If you have problems, please paste the above URL into your web browser.

Thanks,
AntRe Support`;

export const serverErrorEmailTitle = title => `[Antre] Server Error: ${title}`;

export const serverErrorEmailTemplate = ({
  title,
  created_at,
  detail,
  user_ids
}) => `New server error from Antre: ${title}.
Click here to view on dashboard: ${process.env.SERVER_URL}/admin/server-errors
Occurred date: ${created_at}
The users are affected: ${user_ids.length === 0 ? "None" : user_ids.join(",")}
Detail: ${detail}`;
