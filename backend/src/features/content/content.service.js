import Content from "./content.model.js";

export const createContent = async (data, userId) => {
  const content = await Content.create({
    ...data,
    authorId: userId
  });

  return content;
};

export const getAllContent = async () => {
  return await Content.find();
};

export const getContentById = async (id) => {
  return await Content.findById(id);
};

export const updateContent = async (id, data) => {
  return await Content.findByIdAndUpdate(id, data, { new: true });
};

export const deleteContent = async (id) => {
  return await Content.findByIdAndDelete(id);
};