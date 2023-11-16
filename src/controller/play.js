import { ObjectID } from "mongodb";
import Question from "../model/question";
import UserLevel from "../model/user_level";
import AnswerLog from "../model/answer_log";
import ResponseError from "../util/error";

function validateAnswerRequest(request) {
  return (
    request.question_id &&
    request.know_answer !== undefined &&
    request.answer_correct !== undefined
  );
}

function sortByLastQuestion(q1, q2, level) {
  if (q1._id.equals(level.lastQuestionId)) return 1;
  if (q2._id.equals(level.lastQuestionId)) return -1;
  return 0;
}

function sortByDifficulty(q1, q2, level) {
  if (q1.difficulty === q2.difficulty) return 0;
  const direction = level.lastAnswerCorrect ? 1 : -1;
  const q1Distance = direction * (q1.difficulty - level.level);
  const q2Distance = direction * (q2.difficulty - level.level);

  // One of them is 0
  if (q1Distance === 0) return -1;
  if (q2Distance === 0) return 1;

  // Same positive side
  if (q1Distance > 0 && q2Distance > 0) {
    return q1Distance - q2Distance > 0 ? 1 : -1;
  }
  // Same negative side
  if (q1Distance < 0 && q2Distance < 0) {
    return q2Distance - q1Distance > 0 ? 1 : -1;
  }

  // In 2 difference side of user level
  return q2Distance - q1Distance > 0 ? 1 : -1;
}

// Temporary comment out compare correct rate
function sortByStatus(q1, q2) {
  // if (q1.isAnsweredCorrect() && q2.isAnsweredCorrect()) {
  //   return q1.getCorrectRate() - q2.getCorrectRate();
  // }
  return q2.getStatusAsCompareValue() - q1.getStatusAsCompareValue();
}

function sortByRandom() {
  return -10 + Math.floor(Math.random() * 21);
}

function sortQuestionByPriority(questions, level) {
  const ret = questions.sort((q1, q2) => {
    const byLastQuestion = sortByLastQuestion(q1, q2, level);
    if (byLastQuestion !== 0) return byLastQuestion;

    const byDifficulty = sortByDifficulty(q1, q2, level);
    if (byDifficulty !== 0) return byDifficulty;

    const byStatus = sortByStatus(q1, q2);
    if (byStatus !== 0) return byStatus;

    return sortByRandom();
  });
  return ret;
}

export default {
  getNextQuestion: async function(req, res, next) {
    try {
      const user = req.user;
      const level = await await UserLevel.findOne({
        user_id: ObjectID(user.id)
      });

      // Get list of available questions
      let questions;
      let exclude_unanswered = req.query.exclude_unanswered;
      exclude_unanswered =
        exclude_unanswered !== undefined &&
        exclude_unanswered.toLowerCase() === "true";
      if (exclude_unanswered) {
        questions = await Question.findAnsweredWrongQuestions(user.id);
      } else {
        questions = await Question.findUnansweredOrWrongQuestions(user.id);
      }

      // Check is finished
      const isAllAnswered = questions.length === 0;
      if (isAllAnswered) {
        res.json({
          finished: true,
          question: null
        });
        return;
      }

      // Sort questions by priority
      const prioritizedQuestions = sortQuestionByPriority(questions, level);

      res.json({
        finished: false,
        question: prioritizedQuestions[0]
      });
    } catch (error) {
      next(error);
    }
  },

  saveAnswer: async function(req, res, next) {
    try {
      const user = req.user;
      const request = req.body;
      if (!validateAnswerRequest(request))
        throw ResponseError.BadRequest("Invalid answer request");

      const savedQuestion = await Question.findById(
        ObjectID(request.question_id)
      );
      if (!savedQuestion)
        throw ResponseError.BadRequest(
          `No question with id ${request.question_id}`
        );

      // Save log
      const log = new AnswerLog({
        user_id: ObjectID(user.id),
        question_id: ObjectID(request.question_id),
        know_answer: request.know_answer,
        answer_correct: request.answer_correct
      });
      await log.save();

      // Update question status
      // Once a question is answered correct => it stay correct forever
      const isAnswerCorrect = log.isAnswerCorrect();
      savedQuestion.updateStatus(isAnswerCorrect);
      await savedQuestion.save();

      // Update user level
      const level = await UserLevel.findOne({ user_id: ObjectID(user.id) });
      if (isAnswerCorrect) {
        level.increaseLevel();
      } else {
        level.decreaseLevel();
      }
      level.lastQuestionId = savedQuestion.id;
      await level.save();

      res.json({
        success: true
      });
    } catch (error) {
      next(error);
    }
  },

  resetLearningHistory: async function(req, res, next) {
    try {
      const user = req.user;

      // Reset user level
      const level = await UserLevel.findOne({ user_id: ObjectID(user.id) });
      if (!level)
        throw ResponseError.InternalError(
          `Expected to find level of user ${user.id} but cannot find`
        );
      level.resetLevel();
      await level.save();

      // Reset status of all questions
      await Question.resetUserQuestions(user.id);

      // Clear all answer logs
      await AnswerLog.delete({ user_id: ObjectID(user.id) });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  getHistory: async function(req, res, next) {
    try {
      const user = req.user;

      // Fetch statistic
      const total = await Question.find({ user_id: ObjectID(user.id) }).count();
      const correct = await Question.findAnsweredCorrectQuestions(
        user.id
      ).count();
      const incorrect = await Question.findAnsweredWrongQuestions(
        user.id
      ).count();

      // Fetch list of incorrect question
      const wrong_questions = await Question.findAnsweredWrongQuestions(
        user.id
      );

      res.json({
        total,
        correct,
        incorrect,
        wrong_questions
      });
    } catch (error) {
      next(error);
    }
  }
};
