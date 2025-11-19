import { Response, NextFunction } from 'express';
import Todo from '../models/Todo';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all todos for user
// @route   GET /api/todos
// @access  Private
export const getTodos = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, category, priority, completed, projectId } = req.query;
    
    const filter: any = { userId: req.user._id };
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (completed !== undefined) filter.completed = completed === 'true';
    if (projectId) filter.projectId = projectId;

    const todos = await Todo.find(filter)
      .populate('tags', 'name color')
      .populate('projectId', 'name color')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single todo
// @route   GET /api/todos/:id
// @access  Private
export const getTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('tags', 'name color')
      .populate('projectId', 'name color');

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new todo
// @route   POST /api/todos
// @access  Private
export const createTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const todoData = {
      ...req.body,
      userId: req.user._id
    };

    const todo = await Todo.create(todoData);

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Private
export const updateTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const todo = await Todo.findOneAndUpdate(
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

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
export const deleteTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle todo completed status
// @route   PATCH /api/todos/:id/toggle
// @access  Private
export const toggleTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    todo.completed = !todo.completed;
    todo.status = todo.completed ? 'completed' : 'todo';
    await todo.save();

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};
