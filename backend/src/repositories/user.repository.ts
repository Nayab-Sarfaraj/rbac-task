import { User, IUser } from '../models/user.model';
import mongoose from 'mongoose';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = User.findOne({ email });
    if (includePassword) {
      query.select('+passwordHash');
    }
    return query.exec();
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async update(id: string, updateData: mongoose.UpdateQuery<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async find(
    filter: any,
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      User.countDocuments(filter).exec(),
    ]);
    return { users, total };
  }

  async count(filter: any): Promise<number> {
    return User.countDocuments(filter).exec();
  }
}
