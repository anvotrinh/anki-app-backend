import { ObjectID } from "mongodb";

import ServerError from "../model/server_error";
import send_email from "../util/send_email";
import {
  serverErrorEmailTitle,
  serverErrorEmailTemplate
} from "../util/email_template";

const shouldLogOnStatus = [500];

function sendServerErrorEmail(serverError) {
  send_email(
    process.env.ADMIN_EMAILS,
    serverErrorEmailTitle(serverError.title),
    serverErrorEmailTemplate(serverError)
  );
}

export async function captureError(err, user) {
  try {
    const query = { title: err.message, detail: err.stack };
    const savedServerError = await ServerError.findOne(query);
    if (savedServerError) {
      savedServerError.count = savedServerError.count + 1;
      savedServerError.resolved = false;
      if (user) {
        const reqUserId = ObjectID(user.id);
        const exist = savedServerError.user_ids.find(objectID =>
          objectID.equals(reqUserId)
        );
        if (!exist) {
          savedServerError.user_ids = savedServerError.user_ids.concat(
            reqUserId
          );
        }
      }
      await savedServerError.save();
    } else {
      const serverError = new ServerError({
        user_ids: [],
        title: err.message,
        detail: err.stack,
        count: 1,
        resolved: false
      });
      if (user) {
        serverError.user_ids = [ObjectID(user.id)];
      }
      await serverError.save();
      sendServerErrorEmail(serverError);
    }
  } catch (e) {
    console.error(`[ERROR] ${e.message}`);
  }
}

export async function errorLogger(err, req, res, next) {
  const httpStatus = err.code || err.status || err.statusCode || 500;
  if (shouldLogOnStatus.indexOf(httpStatus) > -1) {
    console.error(`[ERROR] ${err.message}`);
    await captureError(err, req.user);
  }
  next(err);
}

// eslint-disable-next-line
export function errorHandler(err, req, res, next) {
  const httpStatus = err.code || err.status || err.statusCode || 500;
  res.status(httpStatus);
  res.json({ error: err.message });
}
