import ResponseError from "../util/error";

export default function notFoundController(req, res, next) {
  const error = ResponseError.NotFound("Page not found");
  next(error);
}
