import mongoose from "mongoose";

const calendarSchema = mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  time: String,
  hour: Number,
  min: Number,
  type: String,
  is_active: Boolean
});

const Calendar = mongoose.model("Calendar", calendarSchema);
export default Calendar;
