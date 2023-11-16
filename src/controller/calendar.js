import { ObjectID } from "mongodb";
import Calendar from "../model/calendar";
import ResponseError from "../util/error";

const DAYS_OF_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function validateDaysOfWeek(time) {
  return !time.split(",").some(day => {
    return DAYS_OF_WEEK.indexOf(day) === -1;
  });
}

function validateAddCalendarRequest(request) {
  if (request.type !== "days_of_week" && request.type !== "date") {
    return false;
  }
  if (request.type === "days_of_week" && !validateDaysOfWeek(request.time)) {
    return false;
  }
  if (request.type === "date" && isNaN(new Date(request.time))) {
    return false;
  }
  return (
    Number.isInteger(request.hour) &&
    request.hour >= 0 &&
    request.hour < 24 &&
    Number.isInteger(request.min) &&
    request.min >= 0 &&
    request.min < 60
  );
}

function validateEditCalendarRequest(request) {
  if (request.time) {
    if (request.type !== "days_of_week" && request.type !== "date") {
      return false;
    }
    if (request.type === "days_of_week" && !validateDaysOfWeek(request.time)) {
      return false;
    }
    if (request.type === "date" && isNaN(new Date(request.time))) {
      return false;
    }
  }
  if (
    request.hour &&
    (!Number.isInteger(request.hour) || request.hour < 0 || request.hour >= 24)
  ) {
    return false;
  }
  if (
    request.min &&
    (!Number.isInteger(request.min) || request.min < 0 || request.min >= 60)
  ) {
    return false;
  }
  return true;
}

export default {
  listCalendar: async function(req, res, next) {
    try {
      const user = req.user;
      const calendars = await Calendar.find({
        user_id: ObjectID(user.id)
      });
      res.json(calendars);
    } catch (error) {
      next(error);
    }
  },

  addCalendar: async function(req, res, next) {
    try {
      const user = req.user;
      const request = req.body;

      // Validate
      const isValid = validateAddCalendarRequest(request);
      if (!isValid)
        throw ResponseError.BadRequest("Invalid add calendar request");

      let calendar = new Calendar({
        user_id: ObjectID(user.id),
        time: request.time,
        hour: request.hour,
        min: request.min,
        type: request.type,
        is_active: Boolean(request.is_active)
      });
      calendar = await calendar.save();
      res.json(calendar);
    } catch (error) {
      next(error);
    }
  },

  detailCalendar: async function(req, res, next) {
    try {
      const user = req.user;
      const calendarId = ObjectID(req.params.calendarId);
      const savedCalendar = await Calendar.findById(calendarId).exec();

      if (!savedCalendar)
        throw ResponseError.NotFound(`No calendar with id ${calendarId}`);
      const isSameUser = savedCalendar.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this calendar"
        );

      res.json(savedCalendar);
    } catch (error) {
      next(error);
    }
  },

  editCalendar: async function(req, res, next) {
    try {
      const user = req.user;
      const calendarId = ObjectID(req.params.calendarId);
      let savedCalendar = await Calendar.findById(calendarId).exec();

      if (!savedCalendar)
        throw ResponseError.NotFound(`No calendar with id ${calendarId}`);
      const isSameUser = savedCalendar.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this calendar"
        );

      const request = req.body;
      // Validate
      const isValid = validateEditCalendarRequest(request);
      if (!isValid)
        throw ResponseError.BadRequest("Invalid edit calendar request");

      // Update
      savedCalendar.time = request.time || savedCalendar.time;
      savedCalendar.hour = request.hour || savedCalendar.hour;
      savedCalendar.min = request.min || savedCalendar.min;
      savedCalendar.type = request.type || savedCalendar.type;
      if (typeof request.is_active !== "undefined") {
        savedCalendar.is_active = Boolean(request.is_active);
      }

      savedCalendar = await savedCalendar.save();

      res.json(savedCalendar);
    } catch (error) {
      next(error);
    }
  },

  deleteCalendar: async function(req, res, next) {
    try {
      const user = req.user;
      const calendarId = ObjectID(req.params.calendarId);
      const savedCalendar = await Calendar.findById(calendarId).exec();

      // Delete calendar
      if (!savedCalendar)
        throw ResponseError.NotFound(`No calendar with id ${calendarId}`);
      const isSameUser = savedCalendar.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this calendar"
        );
      await savedCalendar.delete();

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};
