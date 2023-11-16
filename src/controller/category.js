import { ObjectID } from "mongodb";
import Category from "../model/category";
import Question from "../model/question";
import ResponseError from "../util/error";

function validateAddCategoryRequest(request) {
  return request.name;
}

function validateEditCategoryRequest(request) {
  return request.name;
}

export default {
  listCategory: async function(req, res, next) {
    try {
      const user = req.user;
      const categories = await Category.find({ user_id: ObjectID(user.id) });
      res.json(categories);
    } catch (error) {
      next(error);
    }
  },

  addCategory: async function(req, res, next) {
    try {
      const user = req.user;
      const request = req.body;

      // Validate
      const isValid = validateAddCategoryRequest(request);
      if (!isValid)
        throw ResponseError.BadRequest("Invalid add category request");

      let category = new Category({
        user_id: ObjectID(user.id),
        name: request.name
      });
      category = await category.save();
      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  detailCategory: async function(req, res, next) {
    try {
      const user = req.user;
      const categoryId = ObjectID(req.params.categoryId);
      const savedCategory = await Category.findById(categoryId).exec();

      if (!savedCategory)
        throw ResponseError.NotFound(`No category with id ${categoryId}`);
      const isSameUser = savedCategory.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this category"
        );

      res.json(savedCategory);
    } catch (error) {
      next(error);
    }
  },

  editCategory: async function(req, res, next) {
    try {
      const user = req.user;
      const categoryId = ObjectID(req.params.categoryId);
      let savedCategory = await Category.findById(categoryId).exec();

      if (!savedCategory)
        throw ResponseError.NotFound(`No category with id ${categoryId}`);
      const isSameUser = savedCategory.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this category"
        );

      const request = req.body;
      // Validate
      const isValid = validateEditCategoryRequest(request);
      if (!isValid)
        throw ResponseError.BadRequest("Invalid edit category request");

      // Update
      savedCategory.name = request.name || savedCategory.name;

      savedCategory = await savedCategory.save();

      res.json(savedCategory);
    } catch (error) {
      next(error);
    }
  },

  deleteCategory: async function(req, res, next) {
    try {
      const user = req.user;
      const categoryId = ObjectID(req.params.categoryId);
      const savedCategory = await Category.findById(categoryId).exec();

      // Delete category
      if (!savedCategory)
        throw ResponseError.NotFound(`No category with id ${categoryId}`);
      const isSameUser = savedCategory.user_id.equals(ObjectID(user.id));
      if (!isSameUser)
        throw ResponseError.Unauthorized(
          "You dont have privilege to access this category"
        );

      const query = {
        user_id: ObjectID(user.id),
        category_ids: categoryId
      };
      const questions = await Question.find(query);
      const promises = questions.map(question => {
        question.category_ids = question.category_ids.filter(
          id => !id.equals(categoryId)
        );
        return question.save();
      });
      await Promise.all(promises);

      await savedCategory.delete();

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};
