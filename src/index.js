import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import http from "http";
import https from "https";
import useragent from "express-useragent";
import request from "request";
import cron from "node-cron";

import db from "./model/connection";
db.initialize({
  host: process.env.MONGODB_HOST || "localhost",
  port: process.env.MONGODB_PORT || 27017,
  database: process.env.MONGODB_DATABASE || "anki"
});

import jwtMdw from "./middleware/jwt";
import docHandler from "./controller/doc";
import adminHandler from "./controller/admin";
import serverInfoHandler from "./controller/server_info";
import authHandler from "./controller/authentication";
import userHandler from "./controller/user";
import imageHandler from "./controller/image";
import questionHandler from "./controller/question";
import categoryHandler from "./controller/category";
import tagHandler from "./controller/tag";
import calendarHandler from "./controller/calendar";
import playHandler from "./controller/play";
import codeHandler from "./controller/code";
import notFoundHandler from "./controller/not_found";
import { errorLogger, errorHandler } from "./controller/error_handling";

import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as InstagramStrategy } from "passport-instagram";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as YahooJPStrategy } from "./util/passport-yahoo-jp";

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.SERVER_URL + "/auth/facebook/callback",
      profileFields: ["id", "displayName", "email", "birthday"]
    },
    (accessToken, refreshToken, profile, cb) => {
      return cb(null, profile._json);
    }
  )
);

passport.use(
  new InstagramStrategy(
    {
      clientID: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      callbackURL: process.env.SERVER_URL + "/auth/instagram/callback"
    },
    (accessToken, refreshToken, profile, cb) => {
      request(
        `https://www.instagram.com/${profile.username}/?__a=1`,
        { json: true },
        (err, res, body) => {
          if (err) {
            cb(null, profile._json);
          } else {
            cb(null, {
              id: profile.id,
              email: "",
              name: body.graphql.user.full_name,
              birthday: "",
              profilePic: body.graphql.user.profile_pic_url
            });
          }
        }
      );
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      includeEmail: true,
      callbackURL: process.env.SERVER_URL + "/auth/twitter/callback"
    },
    (token, tokenSecret, profile, cb) => {
      return cb(null, {
        id: profile._json.id,
        email: profile._json.email,
        name: profile._json.name,
        birthday: "",
        profilePic: profile._json.profile_image_url_https
      });
    }
  )
);

passport.use(
  new YahooJPStrategy(
    {
      clientID: process.env.YAHOOJP_CLIENT_ID,
      clientSecret: process.env.YAHOOJP_CLIENT_SECRET,
      scope: ["openid", "profile", "email"],
      callbackURL: process.env.SERVER_URL + "/auth/yahoo-jp/callback"
    },
    (token, tokenSecret, profile, cb) => {
      return cb(null, profile);
    }
  )
);

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    const { host } = req.headers;
    const { url } = req;
    const hasWWW = /^www\..*/i.test(host);
    if (!hasWWW) {
      res.redirect(`https://www.${host}${url}`);
      return;
    }
    if (!req.secure) {
      res.redirect(`https://${host}${url}`);
      return;
    }
  }
  next();
});
app.use(morgan("dev"));
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use(
  require("express-session")({
    secret: process.env.TOKEN_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(cookieParser());
app.use(useragent.express());
app.use(express.static(path.join(__dirname, "../public")));

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["public_profile", "email", "user_birthday"],
    session: false
  })
);
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  authHandler.loginSocial("facebook")
);
app.get(
  "/auth/instagram",
  passport.authenticate("instagram", { session: false })
);
app.get(
  "/auth/instagram/callback",
  passport.authenticate("instagram", { session: false }),
  authHandler.loginSocial("instagram")
);
app.get("/auth/twitter", passport.authenticate("twitter", { session: false }));
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { session: false }),
  authHandler.loginSocial("twitter")
);
app.get(
  "/auth/yahoo-jp",
  passport.authenticate("yahoo-jp", { session: false })
);
app.get(
  "/auth/yahoo-jp/callback",
  passport.authenticate("yahoo-jp", { session: false }),
  authHandler.loginSocial("yahoo-jp")
);

app.get("/admin(/*)?", adminHandler.index);

app.get("/", docHandler);
app.get("/test", (req, res) => res.json({ success: true }));
app.get("/server_info", serverInfoHandler);
app.get("/verify/:codeId", codeHandler.verifyEmail);
app.get("/resetPassword/:codeId", codeHandler.resetPassword);

app.post("/auth/login", authHandler.login);
app.post("/auth/register", authHandler.register);
app.post("/auth/resetPassword", authHandler.resetPassword);

app.use("/api/v1", jwtMdw);
app.post("/api/v1/image", fileUpload(), imageHandler.upload);

app.get("/api/v1/serverError", adminHandler.listServerError);
app.put("/api/v1/serverError/:serverErrorId", adminHandler.editServerError);
app.delete(
  "/api/v1/serverError/:serverErrorId",
  adminHandler.deleteServerError
);

app.get("/api/v1/me", userHandler.info);
app.put("/api/v1/me", userHandler.edit);
app.post("/api/v1/resendVerifyEmail", userHandler.resendVerifyEmail);

app.get("/api/v1/user", userHandler.listUser);
app.post("/api/v1/user", userHandler.addUser);
app.delete("/api/v1/user/:userId", userHandler.deleteUser);

app.get("/api/v1/question", questionHandler.listQuestion);
app.post("/api/v1/question", questionHandler.addQuestion);
app.get("/api/v1/question/:questionId", questionHandler.detailQuestion);
app.put("/api/v1/question/:questionId", questionHandler.editQuestion);
app.delete("/api/v1/question/:questionId", questionHandler.deleteQuestion);

app.get("/api/v1/category", categoryHandler.listCategory);
app.post("/api/v1/category", categoryHandler.addCategory);
app.get("/api/v1/category/:categoryId", categoryHandler.detailCategory);
app.put("/api/v1/category/:categoryId", categoryHandler.editCategory);
app.delete("/api/v1/category/:categoryId", categoryHandler.deleteCategory);

app.get("/api/v1/tag", tagHandler.listTag);
app.post("/api/v1/tag", tagHandler.addTag);
app.get("/api/v1/tag/:tagId", tagHandler.detailTag);
app.put("/api/v1/tag/:tagId", tagHandler.editTag);
app.delete("/api/v1/tag/:tagId", tagHandler.deleteTag);

app.get("/api/v1/calendar", calendarHandler.listCalendar);
app.post("/api/v1/calendar", calendarHandler.addCalendar);
app.get("/api/v1/calendar/:calendarId", calendarHandler.detailCalendar);
app.put("/api/v1/calendar/:calendarId", calendarHandler.editCalendar);
app.delete("/api/v1/calendar/:calendarId", calendarHandler.deleteCalendar);

app.get("/api/v1/play/next_question", playHandler.getNextQuestion);
app.post("/api/v1/play/save_answer", playHandler.saveAnswer);
app.post("/api/v1/play/reset", playHandler.resetLearningHistory);
app.get("/api/v1/play/history", playHandler.getHistory);
app.get("/testError", () => {
  throw new Error("Test error!");
});

app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

cron.schedule("0 0 * * *", questionHandler.updateDifficulty, {
  timezone: "Asia/Tokyo"
});

const httpPort = process.env.HTTP_PORT || 3000;
http.createServer(app).listen(httpPort, function() {
  console.log(`ServerHTTP running on :${httpPort}`);
});

const httpsPort = process.env.HTTPS_PORT || 3001;
const options = {
  key: fs.readFileSync(__dirname + "/../certs/key.pem"),
  cert: fs.readFileSync(__dirname + "/../certs/cert.pem")
};
https.createServer(options, app).listen(httpsPort, function() {
  console.log(`ServerHTTPS running on :${httpsPort}`);
});
console.log(`Environment: ${process.env.NODE_ENV}`);
