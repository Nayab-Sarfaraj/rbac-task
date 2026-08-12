import { z } from 'zod';

// Helper for validating MongoDB ObjectId
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Pagination query parameters
export const paginationSchema = z.object({
  page: z.string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val >= 1, 'Page must be greater than or equal to 1'),
  limit: z.string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val >= 1 && val <= 50, 'Limit must be between 1 and 50'),
});

// Authentication Schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/\d/, 'Password must contain at least 1 number'),
  }).strict(),
  params: z.object({}).strict(),
  query: z.object({}).strict(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }).strict(),
  params: z.object({}).strict(),
  query: z.object({}).strict(),
});

export const emptySchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).strict(),
  query: z.object({}).strict(),
});

// Users Schemas
export const getUsersSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).strict(),
  query: paginationSchema.extend({
    role: z.enum(['admin', 'manager', 'member']).optional(),
    search: z.string().optional(),
  }).strict(),
});

export const getUserByIdSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({
    id: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['admin', 'manager', 'member']),
  }).strict(),
  params: z.object({
    id: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

export const deactivateUserSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({
    id: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

// Projects Schemas
export const getProjectsSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).strict(),
  query: paginationSchema.strict(),
});

export const getProjectByIdSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({
    id: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(120, 'Title cannot exceed 120 characters').trim(),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  }).strict(),
  params: z.object({}).strict(),
  query: z.object({}).strict(),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(120, 'Title cannot exceed 120 characters').trim().optional(),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  }).strict(),
  params: z.object({
    id: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

export const deleteProjectSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({
    id: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

export const addProjectMemberSchema = z.object({
  body: z.object({
    userId: objectIdSchema,
  }).strict(),
  params: z.object({
    id: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

export const removeProjectMemberSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({
    id: objectIdSchema,
    userId: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

// Tasks Schemas
export const getTasksSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).strict(),
  query: paginationSchema.extend({
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    assignee: z.string().optional(),
    dueDate: z.string().datetime({ precision: 3 }).optional(), // ISO date string check
    search: z.string().optional(),
    project: objectIdSchema.optional(),
  }).strict(),
});

export const getTaskByIdSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({
    id: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters').trim(),
    description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
    status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    dueDate: z.string().datetime({ precision: 3 }).optional(),
    project: objectIdSchema,
    assignee: objectIdSchema.optional(),
  }).strict(),
  params: z.object({}).strict(),
  query: z.object({}).strict(),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(150, 'Title cannot exceed 150 characters').trim().optional(),
    description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().datetime({ precision: 3 }).optional(),
    assignee: objectIdSchema.optional(),
  }).strict(),
  params: z.object({
    id: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['todo', 'in_progress', 'done']),
  }).strict(),
  params: z.object({
    id: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

export const deleteTaskSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({
    id: objectIdSchema,
  }).strict(),
  query: z.object({}).strict(),
});

// Audit Logs Schemas
export const getAuditLogsSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).strict(),
  query: paginationSchema.extend({
    actor: z.string().optional(),
    action: z.enum([
      'USER_CREATED',
      'USER_ROLE_CHANGED',
      'USER_DEACTIVATED',
      'PROJECT_CREATED',
      'PROJECT_UPDATED',
      'PROJECT_DELETED',
      'TASK_CREATED',
      'TASK_UPDATED',
      'TASK_DELETED',
      'TASK_STATUS_CHANGED',
    ]).optional(),
    targetType: z.enum(['User', 'Project', 'Task']).optional(),
    startDate: z.string().datetime({ precision: 3 }).optional(),
    endDate: z.string().datetime({ precision: 3 }).optional(),
  }).strict(),
});
