import { ObjectID } from "mongodb";
import Tag from "../model/tag";
import Question from "../model/question";
import ResponseError from "../util/error";

function validateAddTagRequest(request) {
  return request.name;
}

function validateEditTagRequest(request) {
  return request.name;
}

export default {
  listTag: async function(req, res, next) {
    try {
      const user = req.user;
      const tags = await Tag.find({ user_id: ObjectID(user.id) });
      res.json(tags);
    } catch (error) {
      next(error);
    }
  },

  addTag: async function(req, res, next) {
    try {
      const user = req.user;
      const request = req.body;

      // Validate
      const isValid = validateAddTagRequest(request);
      if (!isValid) throw ResponseError.BadRequest("Invalid add tag request");

      let tag = new Tag({
        user_id: ObjectID(user.id),
        name: request.name
      });
      tag = await tag.save();
      res.json(tag);
    } catch (error) {
      next(error);
    }
  },

  detailTag: async function(req, res, next) {
    try {
      const user = req.user;
      const tagId = ObjectID(req.params.tagId);
      const savedTag = await Tag.findById(tagId).exec();

      if (!savedTag) throw ResponseError.NotFound(`No tag with id ${tagId}`);
      const isSameUser = savedTag.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this tag"
        );

      res.json(savedTag);
    } catch (error) {
      next(error);
    }
  },

  editTag: async function(req, res, next) {
    try {
      const user = req.user;
      const tagId = ObjectID(req.params.tagId);
      let savedTag = await Tag.findById(tagId).exec();

      if (!savedTag) throw ResponseError.NotFound(`No tag with id ${tagId}`);
      const isSameUser = savedTag.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this tag"
        );

      const request = req.body;
      // Validate
      const isValid = validateEditTagRequest(request);
      if (!isValid) throw ResponseError.BadRequest("Invalid edit tag request");

      // Update
      savedTag.name = request.name || savedTag.name;

      savedTag = await savedTag.save();

      res.json(savedTag);
    } catch (error) {
      next(error);
    }
  },

  deleteTag: async function(req, res, next) {
    try {
      const user = req.user;
      const tagId = ObjectID(req.params.tagId);
      const savedTag = await Tag.findById(tagId).exec();

      // Delete tag
      if (!savedTag) throw ResponseError.NotFound(`No tag with id ${tagId}`);
      const isSameUser = savedTag.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this tag"
        );

      const query = {
        user_id: ObjectID(user.id),
        tag_ids: tagId
      };
      const questions = await Question.find(query);
      const promises = questions.map(question => {
        question.tag_ids = question.tag_ids.filter(id => !id.equals(tagId));
        return question.save();
      });
      await Promise.all(promises);

      await savedTag.delete();

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};
