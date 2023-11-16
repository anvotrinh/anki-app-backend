import mongoose from "mongoose";

const serverErrorSchema = mongoose.Schema({
  user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  title: String,
  detail: String,
  count: Number,
  resolved: Boolean
});

const ServerError = mongoose.model("ServerError", serverErrorSchema);
export default ServerError;
