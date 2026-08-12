import { UserRepository } from '../repositories/user.repository';
import { auditLogService } from './auditLog.service';
import { IUser } from '../models/user.model';
import { NotFoundError, BadRequestError } from '../utils/errors';
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUsers(
    filters: { role?: string; search?: string },
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }> {
    const query: any = { isDeleted: false };

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    return this.userRepository.find(query, page, limit);
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateUserRole(
    adminId: string,
    targetUserId: string,
    newRole: 'admin' | 'manager' | 'member'
  ): Promise<IUser> {
    const user = await this.userRepository.findById(targetUserId);
    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found');
    }

    const previousRole = user.role;
    user.role = newRole;
    const updated = await user.save();

    await auditLogService.log(adminId, 'USER_ROLE_CHANGED', 'User', targetUserId, {
      previousRole,
      newRole,
    });

    return updated;
  }

  async deactivateUser(adminId: string, targetUserId: string): Promise<IUser> {
    if (adminId === targetUserId) {
      throw new BadRequestError('Cannot deactivate yourself');
    }

    const user = await this.userRepository.findById(targetUserId);
    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found');
    }

    user.isDeleted = true;
    const updated = await user.save();

    await auditLogService.log(adminId, 'USER_DEACTIVATED', 'User', targetUserId);

    return updated;
  }
}

export const userService = new UserService();
