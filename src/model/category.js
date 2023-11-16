import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  name: String
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
