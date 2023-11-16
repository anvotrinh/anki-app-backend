import mongoose from "mongoose";

const userLevelSchema = mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  level: Number,
  lastAnswerCorrect: Boolean,
  lastQuestionId: mongoose.Schema.Types.ObjectId,
  consecutiveCorrect: Number
});

userLevelSchema.methods.increaseLevel = function() {
  this.level += 1;
  this.lastAnswerCorrect = true;
  this.consecutiveCorrect += 1;
};

userLevelSchema.methods.decreaseLevel = function() {
  if (this.level > 0) {
    this.level -= 1;
  }
  this.lastAnswerCorrect = false;
  this.consecutiveCorrect = 0;
};

userLevelSchema.methods.resetLevel = function() {
  this.level = 0;
  this.lastAnswerCorrect = true;
  this.consecutiveCorrect = 0;
  this.lastQuestionId = null;
};

const UserLevel = mongoose.model("UserLevel", userLevelSchema);
export default UserLevel;
