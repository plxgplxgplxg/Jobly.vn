import { Op } from 'sequelize';
import User from '../models/User';

class UserRepository {
    async findByEmail(email: string) {
        return User.findOne({ where: { email } });
    }

    async findByPhone(phone: string) {
        return User.findOne({ where: { phone } });
    }

    async findById(id: string) {
        return User.findByPk(id);
    }

    async create(data: any) {
        return User.create(data);
    }

    async update(id: string, data: any) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User not found');
        return user.update(data);
    }

    async searchCandidates(query: string) {
        return User.findAll({
            where: {
                role: 'candidate',
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { email: { [Op.iLike]: `%${query}%` } },
                    { desiredPosition: { [Op.iLike]: `%${query}%` } },
                    { industry: { [Op.iLike]: `%${query}%` } }
                ]
            }
        });
    }
}

export default new UserRepository();
