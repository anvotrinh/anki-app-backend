import mongoose from "mongoose";

const codeSchema = mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  type: String
});

const Code = mongoose.model("Code", codeSchema);
export default Code;
