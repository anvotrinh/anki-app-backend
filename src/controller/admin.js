import { ObjectID } from "mongodb";

import ServerError from "../model/server_error";
import ResponseError from "../util/error";

function validateEditServerErrorRequest(request) {
  return request.resolved === true || request.resolved === false;
}

export default {
  index: function(req, res, next) {
    try {
      res.render("admin");
    } catch (error) {
      next(error);
    }
  },

  listServerError: async function(req, res, next) {
    try {
      const query = {};
      const resolved = req.query.resolved;
      if (typeof resolved !== "undefined") {
        query.resolved = resolved;
      }
      const serverErrors = await ServerError.find(query);
      res.json(serverErrors);
    } catch (error) {
      next(error);
    }
  },

  editServerError: async function(req, res, next) {
    try {
      const serverErrorId = ObjectID(req.params.serverErrorId);
      const savedServerError = await ServerError.findById(serverErrorId).exec();

      if (!savedServerError)
        throw ResponseError.NotFound(
          `No server error with id ${serverErrorId}`
        );

      const request = req.body;
      // Validate
      const isValid = validateEditServerErrorRequest(request);
      if (!isValid)
        throw ResponseError.BadRequest("Invalid edit server error request");

      if (typeof request.resolved !== "undefined") {
        savedServerError.resolved = request.resolved;
        await savedServerError.save();
      }

      res.json(savedServerError);
    } catch (error) {
      next(error);
    }
  },

  deleteServerError: async function(req, res, next) {
    try {
      const serverErrorId = ObjectID(req.params.serverErrorId);
      const savedServerError = await ServerError.findById(serverErrorId).exec();

      if (!savedServerError)
        throw ResponseError.NotFound(
          `No server error with id ${serverErrorId}`
        );

      await savedServerError.delete();

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};
