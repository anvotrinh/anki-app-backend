import { ObjectID } from "mongodb";
import mongoose from "mongoose";
import { uniq_array } from "../util/array";

const answerLogSchema = mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  know_answer: Boolean,
  answer_correct: Boolean
});

answerLogSchema.methods.isAnswerCorrect = function() {
  return this.know_answer && this.answer_correct;
};

answerLogSchema.statics.findRecentIncorrectQuestions = async function(
  userId,
  limit
) {
  const logs = await this.find({
    $and: [
      { user_id: ObjectID(userId) },
      {
        $or: [{ know_answer: false }, { answer_correct: false }]
      }
    ]
  })
    .sort({ created_at: -1 })
    .populate("question_id")
    .select("question_id");
  let questions = logs.map(l => l.question_id);
  questions = uniq_array(questions, q => q._id);
  questions = questions.slice(0, limit);
  return questions;
};

const AnswerLog = mongoose.model("AnswerLog", answerLogSchema);
export default AnswerLog;
