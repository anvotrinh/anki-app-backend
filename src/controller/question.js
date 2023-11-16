import { ObjectID } from "mongodb";

import User from "../model/user";
import Question from "../model/question";
import AnswerLog from "../model/answer_log";
import ResponseError from "../util/error";
import { captureError } from "./error_handling";

function validateAddQuestionRequest(request) {
  return (
    request.question_text &&
    request.answer &&
    request.type &&
    (request.type === "image_answer" || request.type === "text_answer") &&
    Number.isInteger(request.difficulty) &&
    request.difficulty >= 0
  );
}

function validateEditQuestionRequest(request) {
  if (request.type) {
    return request.type === "image_answer" || request.type === "text_answer";
  }
  if (request.difficulty) {
    return Number.isInteger(request.difficulty) && request.difficulty >= 0;
  }
  return true;
}

export default {
  listQuestion: async function(req, res, next) {
    try {
      const user = req.user;
      const query = { user_id: ObjectID(user.id) };

      const tagIds = req.query.tag_ids;
      if (tagIds) {
        query.tag_ids = { $all: tagIds.split(",").map(id => ObjectID(id)) };
      }

      const categoryIds = req.query.category_ids;
      if (categoryIds) {
        query.category_ids = {
          $all: categoryIds.split(",").map(id => ObjectID(id))
        };
      }
      const questions = await Question.find(query);
      res.json(questions);
    } catch (error) {
      next(error);
    }
  },

  addQuestion: async function(req, res, next) {
    try {
      const user = req.user;
      const request = req.body;

      // Validate
      const isValid = validateAddQuestionRequest(request);
      if (!isValid)
        throw ResponseError.BadRequest("Invalid add question request");

      const data = {
        user_id: ObjectID(user.id),
        question_text: request.question_text,
        question_image_url: request.question_image_url,
        question_raw_image_url: request.question_raw_image_url,
        answer: request.answer,
        type: request.type,
        difficulty: request.difficulty || 0,
        correctCount: 0,
        wrongCount: 0
      };

      if (request.tag_ids) {
        data.tag_ids = request.tag_ids.split(",").map(id => ObjectID(id));
      } else {
        data.tag_ids = [];
      }

      if (request.category_ids) {
        data.category_ids = request.category_ids
          .split(",")
          .map(id => ObjectID(id));
      } else {
        data.category_ids = [];
      }

      let question = new Question(data);
      question = await question.save();
      res.json(question);
    } catch (error) {
      next(error);
    }
  },

  detailQuestion: async function(req, res, next) {
    try {
      const user = req.user;
      const questionId = ObjectID(req.params.questionId);
      const savedQuestion = await Question.findById(questionId).exec();

      if (!savedQuestion)
        throw ResponseError.NotFound(`No question with id ${questionId}`);
      const isSameUser = savedQuestion.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this question"
        );

      res.json(savedQuestion);
    } catch (error) {
      next(error);
    }
  },

  editQuestion: async function(req, res, next) {
    try {
      const user = req.user;
      const questionId = ObjectID(req.params.questionId);
      let savedQuestion = await Question.findById(questionId).exec();

      if (!savedQuestion)
        throw ResponseError.NotFound(`No question with id ${questionId}`);
      const isSameUser = savedQuestion.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this question"
        );

      const request = req.body;
      // Validate
      const isValid = validateEditQuestionRequest(request);
      if (!isValid)
        throw ResponseError.BadRequest("Invalid edit question request");

      // Update
      savedQuestion.question_text =
        request.question_text || savedQuestion.question_text;
      savedQuestion.question_image_url = request.question_image_url || "";
      savedQuestion.question_raw_image_url =
        request.question_raw_image_url || "";
      savedQuestion.answer = request.answer || savedQuestion.answer;
      savedQuestion.type = request.type || savedQuestion.type;
      savedQuestion.difficulty = request.difficulty || savedQuestion.difficulty;
      if (typeof request.tag_ids !== "undefined") {
        if (request.tag_ids === "") {
          savedQuestion.tag_ids = [];
        } else {
          const tagIds = request.tag_ids.split(",").map(id => ObjectID(id));
          savedQuestion.tag_ids = tagIds;
        }
      }
      if (typeof request.category_ids !== "undefined") {
        if (request.category_ids === "") {
          savedQuestion.category_ids = [];
        } else {
          const categoryIds = request.category_ids
            .split(",")
            .map(id => ObjectID(id));
          savedQuestion.category_ids = categoryIds;
        }
      }

      savedQuestion = await savedQuestion.save();

      res.json(savedQuestion);
    } catch (error) {
      next(error);
    }
  },

  deleteQuestion: async function(req, res, next) {
    try {
      const user = req.user;
      const questionId = ObjectID(req.params.questionId);
      const savedQuestion = await Question.findById(questionId).exec();

      // Delete question
      if (!savedQuestion)
        throw ResponseError.NotFound(`No question with id ${questionId}`);
      const isSameUser = savedQuestion.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this question"
        );
      await savedQuestion.delete();

      // Delete all answer log
      await AnswerLog.delete({ question_id: questionId });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  updateDifficulty: async function() {
    try {
      const users = await User.find();
      for (const user of users) {
        const query = { user_id: ObjectID(user.id) };
        const questions = await Question.find(query);
        const answerLogs = await AnswerLog.find(query);
        const promises = questions.map(question => {
          const answerByQuestionLogs = answerLogs.filter(log =>
            question._id.equals(log.question_id)
          );
          if (answerByQuestionLogs.length === 0) {
            return Promise.resolve();
          }
          const answerByQuestionCorrectLogs = answerByQuestionLogs.filter(log =>
            log.isAnswerCorrect()
          );
          const difficulty = Math.floor(
            (1 -
              answerByQuestionCorrectLogs.length /
                answerByQuestionLogs.length) *
              10
          );
          question.difficulty = difficulty;
          return question.save();
        });
        await Promise.all(promises);
      }
    } catch (error) {
      await captureError(error);
    }
  }
};
