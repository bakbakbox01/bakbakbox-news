import Category from '../models/Category.js';
import { ApiError } from '../utils/apiError.util.js';
import { isMockMode } from '../config/dataMode.js';
import * as mock from '../data/mock/store.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getCategories = async ({
  page = 1,
  limit = 10,
  search = '',
  isActive,
  sortBy = 'sortOrder',
  sortOrder = 'asc',
}) => {
  if (isMockMode()) {
    return mock.mockGetCategories({ page, limit, search, isActive, sortBy, sortOrder });
  }

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  const allowedSortFields = ['name', 'sortOrder', 'createdAt', 'updatedAt'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'sortOrder';
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .sort({ [sortField]: sortDirection, name: 1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email'),
    Category.countDocuments(filter),
  ]);

  return {
    categories,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getCategoryById = async (identifier) => {
  if (isMockMode()) return mock.mockGetCategoryById(identifier);

  const query = isValidObjectId(identifier)
    ? { _id: identifier }
    : { slug: identifier };

  const category = await Category.findOne(query)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  return category;
};

export const createCategory = async (data, adminId) => {
  if (isMockMode()) return mock.mockCreateCategory(data, adminId);

  const existingCategory = await Category.findOne({
    $or: [{ name: data.name }, { slug: data.slug }],
  });

  if (existingCategory) {
    throw new ApiError(409, 'A category with this name or slug already exists');
  }

  const category = await Category.create({
    ...data,
    createdBy: adminId,
    updatedBy: adminId,
  });

  return category;
};

export const updateCategory = async (id, data, adminId) => {
  if (isMockMode()) return mock.mockUpdateCategory(id, data, adminId);

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (data.name && data.name !== category.name) {
    const duplicateName = await Category.findOne({
      name: data.name,
      _id: { $ne: id },
    });

    if (duplicateName) {
      throw new ApiError(409, 'A category with this name already exists');
    }
  }

  Object.assign(category, data, { updatedBy: adminId });
  await category.save();

  return category;
};

export const deleteCategory = async (id) => {
  if (isMockMode()) return mock.mockDeleteCategory(id);

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  await category.deleteOne();

  return category;
};
