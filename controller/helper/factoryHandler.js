// findQuery: {prop:value}
const findOne = async (Model, findQuery) => {
  try {
    return await Model.findOne(findQuery);
  } catch (err) {
    return new Error(`Error in factoryHandler findOne: ${err}`);
  }
};

// data: {prop:value}
const createOne = async (Model, data) => {
  try {
    return await Model.create(data);
  } catch (err) {
    return new Error(`Error in factoryHandler CreateOne: ${err}`);
  }
};
// options : its an optional argument , pass queryParams
const getAll = async (Model, queryConstant, options) => {
  try {
    if (queryConstant == "getAllPosts") {
      return await Model.find().populate("postedPerson");
    } else if (queryConstant == "getUserPosts") {
      return await Model.find({ postedBy: options.email }).populate(
        "postedPerson"
      );
    } else if (queryConstant == "getAllComments") {
      return await Model.find({ forPost: options.postId }).populate(
        "postedByPerson"
      );
    } else if (queryConstant == "getAllFollowers") {
      return await Model.find({ first: options.email });
    } else if (queryConstant == "getAllFollowings")
      return await Model.find({ second: options.email });
  } catch (err) {
    return new Error(`Error in factoryHandler Find: ${err}`);
  }
};
// deleteOne, query: {key:value}
const deleteOne = async (Model, query) => {
  try {
    return await Model.deleteOne(query);
  } catch (err) {
    return new Error(`Error in deleting one: ${err}`);
  }
};
// deleteMany
const deleteMany = async (Model, query) => {
  try {
    return await Model.deleteMany(query);
  } catch (err) {
    return new Error(`Error in deleting one: ${err}`);
  }
};
// updateOne : query and data both are js objects

const updateOne = async (Model, query, data) => {
  try {
    return await Model.updateOne(query, data);
  } catch {
    return new Error(`Error in updating one: ${err}`);
  }
};
module.exports = {
  findOne,
  createOne,
  getAll,
  deleteOne,
  updateOne,
  deleteMany,
};
