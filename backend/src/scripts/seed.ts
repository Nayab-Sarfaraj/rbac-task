import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { AuditLog } from '../models/auditLog.model';
import { logger } from '../utils/logger';

const seed = async () => {
  logger.info('🌱 Starting database seeding...');
  await connectDB();

  // Clean collections
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  logger.info('🧹 Cleared existing database collections.');

  // Create default passwords
  const passwordHash = await bcrypt.hash('Password123', 10);

  // 1. Seed Users
  const users = await User.insertMany([
    {
      name: 'Default Admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
      isDeleted: false,
    },
    {
      name: 'Default Manager',
      email: 'manager@example.com',
      passwordHash,
      role: 'manager',
      isDeleted: false,
    },
    {
      name: 'Default Member',
      email: 'member@example.com',
      passwordHash,
      role: 'member',
      isDeleted: false,
    },
  ]);

  const admin = users[0];
  const manager = users[1];
  const member = users[2];

  logger.info('👥 Seeded default users.');

  // Log user creation
  await AuditLog.insertMany(
    users.map((u) => ({
      actor: admin._id,
      action: 'USER_CREATED',
      targetType: 'User',
      targetId: u._id,
      metadata: { email: u.email, role: u.role },
    }))
  );

  // 2. Seed Projects
  const projects = await Project.insertMany([
    {
      title: 'Company Website Redesign',
      description: 'Revamping the landing page and dashboard application.',
      owner: manager._id,
      members: [member._id],
      isDeleted: false,
    },
    {
      title: 'Internal Audit Tool',
      description: 'Building an internal microservice to scrape audit data.',
      owner: manager._id,
      members: [],
      isDeleted: false,
    },
  ]);

  const websiteProject = projects[0];
  logger.info('📁 Seeded sample projects.');

  await AuditLog.insertMany(
    projects.map((p) => ({
      actor: manager._id,
      action: 'PROJECT_CREATED',
      targetType: 'Project',
      targetId: p._id,
      metadata: { title: p.title },
    }))
  );

  // 3. Seed Tasks
  const tasks = await Task.insertMany([
    {
      title: 'Design high-fidelity wireframes',
      description: 'Create UI mockups for the main application pages.',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      project: websiteProject._id,
      assignee: member._id,
      isDeleted: false,
    },
    {
      title: 'Setup Express template',
      description: 'Initialize a clean project layout structure with TypeScript.',
      status: 'done',
      priority: 'medium',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      project: websiteProject._id,
      assignee: manager._id,
      isDeleted: false,
    },
    {
      title: 'Write API Documentation',
      description: 'Draft OpenAPI specifications for all client resources.',
      status: 'todo',
      priority: 'low',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      project: websiteProject._id,
      assignee: member._id,
      isDeleted: false,
    },
  ]);

  logger.info('📋 Seeded sample tasks.');

  await AuditLog.insertMany(
    tasks.map((t) => ({
      actor: manager._id,
      action: 'TASK_CREATED',
      targetType: 'Task',
      targetId: t._id,
      metadata: { title: t.title },
    }))
  );

  logger.info('🎉 Database seeding complete!');
  logger.info('----------------------------------------------------');
  logger.info('Test credentials for README (all passwords are "Password123"):');
  logger.info(`🔑 Admin:   ${admin.email}`);
  logger.info(`🔑 Manager: ${manager.email}`);
  logger.info(`🔑 Member:  ${member.email}`);
  logger.info('----------------------------------------------------');

  await mongoose.disconnect();
};

seed().catch((error) => {
  logger.error('❌ Seeding failed:', error);
  process.exit(1);
});
