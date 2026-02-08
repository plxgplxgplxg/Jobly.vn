import UploadedCV from '../models/UploadedCV';

class UploadedCVRepository {
  async create(data: {
    userId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }): Promise<UploadedCV> {
    return await UploadedCV.create(data);
  }

  async findById(id: string): Promise<UploadedCV | null> {
    return await UploadedCV.findByPk(id);
  }

  async findByUserIdAndId(userId: string, id: string): Promise<UploadedCV | null> {
    return await UploadedCV.findOne({ where: { id, userId } });
  }

  async findByUserId(userId: string): Promise<UploadedCV[]> {
    return await UploadedCV.findAll({
      where: { userId },
      order: [['uploadedAt', 'DESC']]
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return await UploadedCV.count({ where: { userId } });
  }

  async delete(id: string): Promise<void> {
    await UploadedCV.destroy({ where: { id } });
  }

  async resetDefaults(userId: string): Promise<void> {
    await UploadedCV.update({ isDefault: false }, { where: { userId } });
  }
}

export default new UploadedCVRepository();
