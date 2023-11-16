import jwt from "jsonwebtoken";
import ResponseError from "../util/error";
import authByCookie from "../util/auth_by_cookie";

function getTokenFromHeader(req) {
  if (!req.headers || !req.headers.authorization) return "";
  const [protocol, token] = req.headers.authorization.split(" ");
  if (protocol !== "Bearer") return "";
  return token;
}

function getTokenFromCookie(req) {
  if (!req.cookies) return "";
  if (req.cookies.has_token === "true") {
    return req.cookies.access_token || "";
  }
  return "";
}

export default function(req, res, next) {
  try {
    const token = authByCookie(req)
      ? getTokenFromCookie(req)
      : getTokenFromHeader(req);
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = user;
    next();
  } catch (error) {
    if (req.useragent.isMobile) {
      next(ResponseError.Unauthorized("Missing or invalid token"));
    } else {
      res.setHeader("Set-Cookie", [
        `access_token=; HttpOnly`,
        "has_token=false"
      ]);
      res.redirect("/admin/login");
    }
  }
}
