import { Op } from 'sequelize';
import User from '../models/User';

import Company from '../models/Company';

class UserRepository {
    async findByEmail(email: string) {
        return User.findOne({ where: { email } });
    }

    async findByPhone(phone: string) {
        return User.findOne({ where: { phone } });
    }

    async findById(id: string) {
        return User.findByPk(id, {
            include: [{ model: Company, as: 'companies' }]
        });
    }

    async create(data: any) {
        return User.create(data);
    }

    async update(id: string, data: any) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User not found');
        return user.update(data);
    }

    async searchCandidates(query: string, page = 1, limit = 9) {
        const offset = (page - 1) * limit
        const { count, rows } = await User.findAndCountAll({
            where: {
                role: 'candidate',
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { email: { [Op.iLike]: `%${query}%` } },
                    { desiredPosition: { [Op.iLike]: `%${query}%` } },
                    { industry: { [Op.iLike]: `%${query}%` } }
                ]
            },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        })
        return { rows, count }
    }
}

export default new UserRepository();
