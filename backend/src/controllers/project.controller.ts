import { Response, NextFunction } from 'express';
import Project from '../models/Project';
import Todo from '../models/Todo';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    
    const filter: any = { userId: req.user._id };
    if (status) filter.status = status;

    const projects = await Project.find(filter).sort({ createdAt: -1 });

    // Get todo count for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const todoCount = await Todo.countDocuments({
          projectId: project._id,
          userId: req.user._id
        });
        return {
          ...project.toObject(),
          todoCount
        };
      })
    );

    res.json({
      success: true,
      count: projects.length,
      data: projectsWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get todos for this project
    const todos = await Todo.find({
      projectId: project._id,
      userId: req.user._id
    });

    res.json({
      success: true,
      data: {
        ...project.toObject(),
        todos
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projectData = {
      ...req.body,
      userId: req.user._id
    };

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findOneAndUpdate(
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

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Optionally delete all todos in this project
    await Todo.deleteMany({
      projectId: project._id,
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'Project and associated todos deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
