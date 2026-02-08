import CVTemplate from '../models/CVTemplate';

class CVTemplateRepository {
  async findAll(): Promise<CVTemplate[]> {
    return await CVTemplate.findAll({
      order: [['createdAt', 'DESC']]
    });
  }

  async findById(id: string): Promise<CVTemplate | null> {
    return await CVTemplate.findByPk(id);
  }

  async findByCategory(category: string): Promise<CVTemplate[]> {
    return await CVTemplate.findAll({
      where: { category },
      order: [['createdAt', 'DESC']]
    });
  }

  async create(data: any): Promise<CVTemplate> {
    return await CVTemplate.create(data);
  }

  async update(id: string, data: any): Promise<void> {
    await CVTemplate.update(data, { where: { id } });
  }

  async delete(id: string): Promise<void> {
    await CVTemplate.destroy({ where: { id } });
  }
}

export default new CVTemplateRepository();
