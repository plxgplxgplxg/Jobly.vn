import CompanyRepository from '../repositories/CompanyRepository';
import Company from '../models/Company';
import Job from '../models/Job';

class CompanyService {
    async getCompanies(options?: {
        page?: number;
        limit?: number;
        search?: string;
        industry?: string;
    }) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;

        const { rows, count } = await CompanyRepository.findAll({
            limit,
            offset,
            search: options?.search,
            industry: options?.industry
        });

        return {
            companies: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    async getCompanyById(id: string) {
        const company = await CompanyRepository.findById(id);
        if (!company) {
            throw new Error('Công ty không tồn tại');
        }
        return company;
    }

    async getCompanyJobs(companyId: string, options?: {
        page?: number;
        limit?: number;
    }) {
        const company = await this.getCompanyById(companyId);

        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const offset = (page - 1) * limit;

        const { rows, count } = await Job.findAndCountAll({
            where: { companyId, status: 'approved' },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return {
            company,
            jobs: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    async createCompany(data: {
        name: string;
        taxCode: string;
        industry: string;
        logoUrl?: string;
        description?: string;
        userId: string;
    }) {
        const existing = await CompanyRepository.findByTaxCode(data.taxCode);
        if (existing) {
            throw new Error('Mã số thuế đã tồn tại');
        }

        return await CompanyRepository.create(data);
    }

    async updateCompany(id: string, userId: string, data: Partial<{
        name: string;
        taxCode: string;
        industry: string;
        logoUrl: string;
        description: string;
    }>) {
        const company = await this.getCompanyById(id);

        if (company.userId !== userId) {
            throw new Error('Bạn không có quyền chỉnh sửa công ty này');
        }

        await CompanyRepository.update(id, data);
    }

    async deleteCompany(id: string, userId: string) {
        const company = await this.getCompanyById(id);

        if (company.userId !== userId) {
            throw new Error('Bạn không có quyền xóa công ty này');
        }

        await CompanyRepository.delete(id);
    }
}

export default new CompanyService();
