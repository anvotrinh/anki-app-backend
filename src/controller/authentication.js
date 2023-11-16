import ResponseError from "../util/error";
import { generate } from "../util/token_generator";
import isValidEmail from "../util/is_valid_email";
import isValidPassword from "../util/is_valid_password";
import isValidName from "../util/is_valid_name";
import sendEmail from "../util/send_email";
import {
  verifyEmailTitle,
  verifyEmailTemplate,
  resetPasswordEmailTitle,
  resetPasswordEmailTemplate
} from "../util/email_template";
import authByCookie from "../util/auth_by_cookie";
import User from "../model/user";
import Code from "../model/code";
import UserLevel from "../model/user_level";

function validateRegisterUserRequest({ email, password, name, birthday }) {
  return (
    isValidEmail(email) &&
    isValidPassword(password) &&
    isValidName(name) &&
    birthday &&
    !isNaN(new Date(birthday))
  );
}

export default {
  login: async function(req, res, next) {
    try {
      const request = req.body;
      // Validate
      if (!request.email || !request.password) {
        throw ResponseError.BadRequest("Invalid login request");
      }

      // Get user
      const existingUser = await User.findOne({ email: request.email }).exec();
      if (!existingUser || existingUser.password !== request.password) {
        throw ResponseError.BadRequest("Wrong email or password");
      }

      const userInfo = existingUser.getInfo();

      // Generate token
      const token = generate(userInfo);

      if (authByCookie(req)) {
        res.cookie("access_token", token, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true
        });
        res.cookie("has_token", "true", { maxAge: 365 * 24 * 60 * 60 * 1000 });
        res.json({ success: true });
      } else {
        // Return json
        res.json({
          ...userInfo,
          token
        });
      }
    } catch (error) {
      next(error);
    }
  },

  loginSocial: provider => async (req, res, next) => {
    try {
      // Validate
      if (!provider || !req.user) {
        throw ResponseError.BadRequest("Invalid login request");
      }

      const { id, email, name, birthday, profilePic } = req.user;
      // Get user
      let userInfo;
      const existingUser = await User.findOne({
        open_provider: provider,
        open_user_id: id
      }).exec();
      if (!existingUser) {
        let avatarUrl = "";
        switch (provider) {
          case "facebook":
            avatarUrl = `https://graph.facebook.com/${id}/picture?type=large`;
            break;
          case "instagram":
            avatarUrl = profilePic || "";
            break;
          case "twitter":
            avatarUrl = profilePic || "";
            break;
        }
        // Create user
        let newUser = new User({
          email,
          name,
          birthday,
          is_verified_email: true,
          avatar_url: avatarUrl,
          open_provider: provider,
          open_user_id: id
        });

        newUser = await newUser.save();
        const level = new UserLevel({
          user_id: newUser._id,
          level: 0,
          lastAnswerCorrect: true,
          lastQuestionId: null,
          consecutiveCorrect: 0
        });
        await level.save();
        userInfo = newUser.getInfo();
      } else {
        userInfo = existingUser.getInfo();
      }

      // Generate token
      const token = generate(userInfo);

      res.render("social", { token });
    } catch (error) {
      next(error);
    }
  },

  register: async function(req, res, next) {
    try {
      const request = req.body;
      // Validate
      const isValid = validateRegisterUserRequest(request);
      if (!isValid) throw ResponseError.BadRequest("Invalid register request");

      // Get user
      const existingUser = await User.findOne({ email: request.email }).exec();
      if (existingUser) {
        throw ResponseError.BadRequest("Email already in use");
      }

      // Create user
      let newUser = new User({
        email: request.email,
        password: request.password,
        name: request.name,
        birthday: request.birthday,
        is_verified_email: false,
        avatar_url: request.avatar_url || ""
      });

      newUser = await newUser.save();
      const level = new UserLevel({
        user_id: newUser._id,
        level: 0,
        lastAnswerCorrect: true,
        lastQuestionId: null,
        consecutiveCorrect: 0
      });
      await level.save();

      // Send confirm email
      let code = new Code({
        user_id: newUser._id,
        type: "email"
      });
      code = await code.save();
      sendEmail(
        newUser.email,
        verifyEmailTitle,
        verifyEmailTemplate(newUser.name, code.id)
      );

      // Generate token
      const userInfo = newUser.getInfo();
      const token = generate(userInfo);

      // Return json
      res.json({
        ...userInfo,
        token
      });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async function(req, res, next) {
    try {
      const request = req.body;
      // Validate
      if (!request.email) {
        throw ResponseError.BadRequest("Invalid resetPassword request");
      }

      // Get user
      const existingUser = await User.findOne({ email: request.email }).exec();
      if (!existingUser) {
        throw ResponseError.BadRequest("Email not found");
      }

      // Send reset password email
      let code = new Code({
        user_id: existingUser._id,
        type: "reset-password"
      });
      code = await code.save();
      sendEmail(
        existingUser.email,
        resetPasswordEmailTitle,
        resetPasswordEmailTemplate(existingUser.email, code.id)
      );

      // Return json
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};
