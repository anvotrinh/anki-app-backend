import { ObjectID } from "mongodb";
import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  question_text: String,
  question_image_url: String,
  question_raw_image_url: String,
  answer: String,
  type: String,
  difficulty: Number,
  correctCount: Number,
  wrongCount: Number,
  category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  tag_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }]
});

// Once question is answered correct
// It stay correct forever
questionSchema.methods.updateStatus = function(isAnswerCorrect) {
  if (isAnswerCorrect) {
    this.correctCount += 1;
  } else {
    this.wrongCount += 1;
  }
};

questionSchema.methods.isAnsweredCorrect = function() {
  return this.correctCount > 0;
};

questionSchema.methods.isUnanswered = function() {
  return this.correctCount === 0 && this.wrongCount === 0;
};

questionSchema.methods.isAnsweredWrong = function() {
  return this.correctCount === 0 && this.wrongCount > 0;
};

questionSchema.methods.getTotalAnsweredCount = function() {
  return this.correctCount + this.wrongCount;
};

questionSchema.methods.getCorrectRate = function() {
  if (this.correctCount === 0 && this.wrongCount === 0) {
    return 0;
  }
  return (this.correctCount / this.getTotalAnsweredCount()) * 100;
};

questionSchema.methods.getStatusAsCompareValue = function() {
  if (this.isAnsweredCorrect()) return 0;
  if (this.isAnsweredWrong()) return 1;
  return 2;
};

questionSchema.statics.findUnansweredQuestions = function(userId) {
  return Question.find({
    user_id: ObjectID(userId),
    correctCount: 0,
    wrongCount: 0
  });
};

questionSchema.statics.findAnsweredCorrectQuestions = function(userId) {
  return Question.find({
    user_id: ObjectID(userId),
    correctCount: { $gt: 0 }
  });
};

questionSchema.statics.findAnsweredWrongQuestions = function(userId) {
  return Question.find({
    user_id: ObjectID(userId),
    correctCount: 0,
    wrongCount: { $gt: 0 }
  });
};

questionSchema.statics.findUnansweredOrWrongQuestions = function(userId) {
  return Question.find({
    user_id: ObjectID(userId),
    correctCount: 0
  });
};

questionSchema.statics.resetUserQuestions = function(userId) {
  return Question.update(
    { user_id: ObjectID(userId) },
    { correctCount: 0, wrongCount: 0 },
    { multi: true }
  );
};

questionSchema.set("toJSON", {
  transform(doc, ret) {
    if (typeof ret.correctCount !== "undefined") {
      delete ret.correctCount;
    }
    if (typeof ret.wrongCount !== "undefined") {
      delete ret.wrongCount;
    }
  }
});

const Question = mongoose.model("Question", questionSchema);
export default Question;
