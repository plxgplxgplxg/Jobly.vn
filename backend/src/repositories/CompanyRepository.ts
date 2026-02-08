import Company from '../models/Company';

class CompanyRepository {
  async create(data: {
    name: string;
    taxCode: string;
    industry: string;
    logoUrl?: string;
    description?: string;
    userId: string;
  }): Promise<Company> {
    return await Company.create(data);
  }

  async findById(id: string): Promise<Company | null> {
    return await Company.findByPk(id);
  }

  async findByUserId(userId: string): Promise<Company[]> {
    return await Company.findAll({ where: { userId } });
  }

  async findByTaxCode(taxCode: string): Promise<Company | null> {
    return await Company.findOne({ where: { taxCode } });
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    industry?: string;
  }): Promise<{ rows: Company[]; count: number }> {
    const where: any = {};

    if (options?.search) {
      where.name = { [require('sequelize').Op.iLike]: `%${options.search}%` };
    }

    if (options?.industry) {
      where.industry = options.industry;
    }

    return await Company.findAndCountAll({
      where,
      limit: options?.limit || 20,
      offset: options?.offset || 0,
      order: [['createdAt', 'DESC']]
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    taxCode: string;
    industry: string;
    logoUrl: string;
    description: string;
  }>): Promise<void> {
    await Company.update(data, { where: { id } });
  }

  async delete(id: string): Promise<void> {
    await Company.destroy({ where: { id } });
  }
}

export default new CompanyRepository();
