export default class ResponseError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.code = code;
    this.message = message;
  }

  static NotFound(message) {
    return new ResponseError(message, 404);
  }

  static BadRequest(message) {
    return new ResponseError(message, 400);
  }

  static Unauthorized(message) {
    return new ResponseError(message, 401);
  }

  static InternalError(message) {
    return new ResponseError(message);
  }
}
