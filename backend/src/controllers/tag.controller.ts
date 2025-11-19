import { Response, NextFunction } from 'express';
import Tag from '../models/Tag';
import Todo from '../models/Todo';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all tags
// @route   GET /api/tags
// @access  Private
export const getTags = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tags = await Tag.find({ userId: req.user._id }).sort({ name: 1 });

    // Get todo count for each tag
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const count = await Todo.countDocuments({
          tags: tag._id,
          userId: req.user._id
        });
        return {
          ...tag.toObject(),
          count
        };
      })
    );

    res.json({
      success: true,
      count: tags.length,
      data: tagsWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single tag
// @route   GET /api/tags/:id
// @access  Private
export const getTag = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tag = await Tag.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create tag
// @route   POST /api/tags
// @access  Private
export const createTag = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tagData = {
      ...req.body,
      userId: req.user._id
    };

    const tag = await Tag.create(tagData);

    res.status(201).json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private
export const updateTag = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tag = await Tag.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private
export const deleteTag = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tag = await Tag.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Remove tag from all todos
    await Todo.updateMany(
      { userId: req.user._id },
      { $pull: { tags: tag._id } }
    );

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
