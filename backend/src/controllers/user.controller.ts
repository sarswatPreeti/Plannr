import { Response, NextFunction } from 'express';
import User from '../models/User';
import Todo from '../models/Todo';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const allowedFields = ['name', 'avatar', 'jobTitle', 'location', 'bio'];
    const updates: any = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    Object.keys(req.body).forEach(key => {
      if (user.preferences.hasOwnProperty(key)) {
        (user.preferences as any)[key] = req.body[key];
      }
    });

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Delete all user's todos
    await Todo.deleteMany({ userId: req.user._id });
    
    // Delete all user's projects
    await Project.deleteMany({ userId: req.user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalTodos = await Todo.countDocuments({ userId: req.user._id });
    const completedTodos = await Todo.countDocuments({
      userId: req.user._id,
      completed: true
    });
    const activeTodos = await Todo.countDocuments({
      userId: req.user._id,
      completed: false
    });
    const totalProjects = await Project.countDocuments({
      userId: req.user._id,
      status: 'active'
    });

    // Get todos by priority
    const todosByPriority = await Todo.aggregate([
      { $match: { userId: req.user._id, completed: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Get todos due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todosToday = await Todo.countDocuments({
      userId: req.user._id,
      completed: false,
      dueDate: { $gte: today, $lt: tomorrow }
    });

    res.json({
      success: true,
      data: {
        totalTodos,
        completedTodos,
        activeTodos,
        totalProjects,
        todosToday,
        todosByPriority: todosByPriority.reduce((acc: any, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};
