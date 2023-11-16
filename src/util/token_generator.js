import jwt from "jsonwebtoken";

export function generate(payload) {
  const secret = process.env.TOKEN_SECRET;
  const token = jwt.sign(payload, secret);
  return token;
}
