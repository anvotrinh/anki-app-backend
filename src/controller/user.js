import { ObjectID } from "mongodb";
import User from "../model/user";
import UserLevel from "../model/user_level";
import Code from "../model/code";
import ResponseError from "../util/error";
import isValidEmail from "../util/is_valid_email";
import isValidPassword from "../util/is_valid_password";
import isValidName from "../util/is_valid_name";
import sendEmail from "../util/send_email";
import { verifyEmailTitle, verifyEmailTemplate } from "../util/email_template";

function validateAddUserRequest({ email, password, name, birthday }) {
  return (
    isValidEmail(email) &&
    isValidPassword(password) &&
    isValidName(name) &&
    birthday &&
    !isNaN(new Date(birthday))
  );
}

function validateUpdateUserRequest({ name, password, birthday }) {
  if (name && !isValidName(name)) {
    return false;
  }
  if (password && !isValidPassword(password)) {
    return false;
  }
  if (birthday && isNaN(new Date(birthday))) {
    return false;
  }
  return true;
}

function validateAddListUserRequest({ emails, names, passwords, birthdays }) {
  const isSameLength =
    emails.length === names.length &&
    emails.length === passwords.length &&
    emails.length === birthdays.length;
  if (!isSameLength) {
    return false;
  }

  const isAllEmailValid = emails.every(email => {
    return isValidEmail(email);
  });
  if (!isAllEmailValid) {
    return false;
  }
  const isAllNameValid = names.every(name => {
    return isValidName(name);
  });
  if (!isAllNameValid) {
    return false;
  }
  const isAllPasswordValid = passwords.every(password => {
    return isValidPassword(password);
  });
  if (!isAllPasswordValid) {
    return false;
  }
  const isAllBirthdayValid = birthdays.every(birthday => {
    return birthday && !isNaN(new Date(birthday));
  });
  if (!isAllBirthdayValid) {
    return false;
  }
  return true;
}

export default {
  info: async function(req, res, next) {
    try {
      const user = req.user;
      const userId = ObjectID(user.id);
      const savedUser = await User.findById(userId).exec();

      // Get user
      if (!savedUser) throw ResponseError.NotFound(`No user with id ${userId}`);

      const userInfo = savedUser.getInfo();

      res.json(userInfo);
    } catch (error) {
      next(error);
    }
  },

  edit: async function(req, res, next) {
    try {
      const user = req.user;
      const userId = ObjectID(user.id);
      let savedUser = await User.findById(userId).exec();

      if (!savedUser) throw ResponseError.NotFound(`No user with id ${userId}`);

      const request = req.body;
      // Validate
      const isValid = validateUpdateUserRequest(request);
      if (!isValid) throw ResponseError.BadRequest("Invalid edit user request");

      // Update
      savedUser.name = request.name || savedUser.name;
      savedUser.birthday = request.birthday || savedUser.birthday;
      savedUser.avatar_url = request.avatar_url || savedUser.avatar_url;

      if (request.password && request.current_password) {
        if (request.current_password === savedUser.password) {
          savedUser.password = request.password;
        } else {
          throw ResponseError.BadRequest("Wrong Current Password");
        }
      }

      savedUser = await savedUser.save();
      const userInfo = savedUser.getInfo();

      res.json(userInfo);
    } catch (error) {
      next(error);
    }
  },

  resendVerifyEmail: async function(req, res, next) {
    try {
      const user = req.user;
      const userId = ObjectID(user.id);
      const savedUser = await User.findById(userId).exec();

      if (!savedUser) throw ResponseError.NotFound(`No user with id ${userId}`);

      // User already verified
      if (savedUser.is_verified_email) {
        throw ResponseError.BadRequest("Email already verified");
      }

      // Send confirm email
      let code = new Code({
        user_id: savedUser._id,
        type: "email"
      });
      code = await code.save();
      sendEmail(
        savedUser.email,
        verifyEmailTitle,
        verifyEmailTemplate(savedUser.name, code.id)
      );

      // Return json
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  listUser: async function(req, res, next) {
    try {
      // const user = req.user;
      // TODO check admin
      const users = await User.find();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  addListUser: async function(req, res, next) {
    try {
      // const user = req.user;
      const request = req.body;
      // TODO check admin

      const emails = request.emails.split(",");
      const names = request.names.split(",");
      const passwords = request.passwords.split(",");
      const birthdays = request.birthdays.split(",");
      // Validate
      const isValid = validateAddListUserRequest({
        emails,
        names,
        passwords,
        birthdays
      });
      if (!isValid)
        throw ResponseError.BadRequest("Invalid add list user request");

      const existUsers = await User.find()
        .where("email")
        .in(emails);
      if (existUsers.length > 0) {
        const emails = existUsers.map(user => user.email);
        throw ResponseError.BadRequest(
          `Existed user email ${emails.join(",")}`
        );
      }

      let users = [];
      for (let i = 0; i < emails.length; i++) {
        users.push(
          new User({
            email: emails[i],
            name: names[i],
            password: passwords[i],
            birthday: birthdays[i],
            is_verified_email: false,
            avatar_url: ""
          })
        );
      }

      users = await User.insertMany(users);
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  addUser: async function(req, res, next) {
    try {
      // const user = req.user;
      const request = req.body;
      // TODO check admin

      // Validate
      const isValid = validateAddUserRequest(request);
      if (!isValid) throw ResponseError.BadRequest("Invalid add user request");

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

      res.json(newUser);
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async function(req, res, next) {
    try {
      // const user = req.user;
      // TODO check admin

      const userId = ObjectID(req.params.userId);
      const savedUser = await User.findById(userId).exec();

      // Delete user
      if (!savedUser) throw ResponseError.NotFound(`No user with id ${userId}`);

      await savedUser.delete();

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};
