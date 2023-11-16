const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
export default function isValidPassword(password) {
  return passwordRegex.test(password);
}
