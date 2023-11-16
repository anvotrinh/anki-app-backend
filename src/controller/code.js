import { ObjectID } from "mongodb";

import User from "../model/user";
import Code from "../model/code";
import makeId from "../util/make_id";

export default {
  verifyEmail: async function(req, res, next) {
    try {
      const codeId = ObjectID(req.params.codeId);
      const savedCode = await Code.findById(codeId).exec();

      // Get code
      if (!savedCode || savedCode.type !== "email") {
        res.render("message", {
          title: "Verify Email",
          message: "Bad Request."
        });
        return;
      }

      const userId = savedCode.user_id;
      await savedCode.delete();
      await User.findOneAndUpdate({ _id: userId }, { is_verified_email: true });

      res.render("message", {
        title: "Verify Email",
        message: "Successfully verified your email."
      });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async function(req, res, next) {
    try {
      const codeId = ObjectID(req.params.codeId);
      const savedCode = await Code.findById(codeId).exec();

      // Get code
      if (!savedCode || savedCode.type !== "reset-password") {
        res.render("message", {
          title: "Reset password",
          message: "Bad Request."
        });
        return;
      }

      const userId = savedCode.user_id;
      await savedCode.delete();

      // create new password
      const newPassword = makeId(8);
      await User.findOneAndUpdate({ _id: userId }, { password: newPassword });

      res.render("message", {
        title: "Reset password",
        message: `Successfully reset your password. Your new password is ${newPassword}`
      });
    } catch (error) {
      next(error);
    }
  }
};
