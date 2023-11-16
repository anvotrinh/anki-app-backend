import mongoose from "mongoose";

const tagSchema = mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  name: String
});

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
