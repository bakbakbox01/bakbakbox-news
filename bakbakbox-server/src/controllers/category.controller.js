import * as categoryService from '../services/category.service.js';
import { sendSuccess } from '../utils/apiResponse.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export const getCategories = asyncHandler(async (req, res) => {
  const { page, limit, search, isActive, sortBy, sortOrder } = req.query;

  const result = await categoryService.getCategories({
    page,
    limit,
    search,
    isActive: isActive === undefined ? undefined : isActive === 'true',
    sortBy,
    sortOrder,
  });

  sendSuccess(res, 200, 'Categories retrieved successfully', result);
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);

  sendSuccess(res, 200, 'Category retrieved successfully', { category });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(
    req.body,
    req.admin._id
  );

  sendSuccess(res, 201, 'Category created successfully', { category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body,
    req.admin._id
  );

  sendSuccess(res, 200, 'Category updated successfully', { category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.deleteCategory(req.params.id);

  sendSuccess(res, 200, 'Category deleted successfully', { category });
});
