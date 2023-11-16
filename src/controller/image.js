import Image from "../model/image";
import ResponseError from "../util/error";

export default {
  upload: async function(req, res, next) {
    try {
      if (!req.files || !req.files.image) {
        throw ResponseError.BadRequest("Missing image");
      }

      const result = await Image.save(req.files.image);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
