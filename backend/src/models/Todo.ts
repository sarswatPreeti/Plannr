import mongoose, { Document, Schema } from 'mongoose';

export interface ITodo extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate?: Date;
  icon?: string;
  completed: boolean;
  projectId?: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  subtasks: {
    title: string;
    completed: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    default: 'Personal'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo'
  },
  dueDate: Date,
  icon: String,
  completed: {
    type: Boolean,
    default: false
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  subtasks: [{
    title: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
todoSchema.index({ userId: 1, completed: 1 });
todoSchema.index({ userId: 1, dueDate: 1 });

export default mongoose.model<ITodo>('Todo', todoSchema);
