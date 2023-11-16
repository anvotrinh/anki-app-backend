import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  email: String,
  password: String,
  name: String,
  birthday: String,
  is_verified_email: Boolean,
  avatar_url: String,
  open_provider: String,
  open_user_id: String
});

userSchema.methods.getInfo = function() {
  const user = this.toJSON();
  delete user.password;
  return user;
};

const User = mongoose.model("User", userSchema);
export default User;
