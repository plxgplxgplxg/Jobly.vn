import UserCV from '../models/UserCV';

class UserCVRepository {
  async findById(id: string): Promise<UserCV | null> {
    return await UserCV.findByPk(id);
  }

  async findByUserId(userId: string): Promise<UserCV[]> {
    return await UserCV.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  async findByUserIdAndId(userId: string, id: string): Promise<UserCV | null> {
    return await UserCV.findOne({
      where: { id, userId }
    });
  }

  async create(data: any): Promise<UserCV> {
    return await UserCV.create(data);
  }

  async update(id: string, data: any): Promise<void> {
    await UserCV.update(data, { where: { id } });
  }

  async delete(id: string): Promise<void> {
    await UserCV.destroy({ where: { id } });
  }
}

export default new UserCVRepository();
