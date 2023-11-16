import crypto from "crypto";

export default function hash(str) {
  return crypto
    .createHash("sha256")
    .update(str)
    .digest("base64")
    .toUpperCase();
}
