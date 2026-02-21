import SavedCandidate from '../models/SavedCandidate';
import NotificationService from './NotificationService';
import User from '../models/User';
import Company from '../models/Company';

class SavedCandidateService {
    async toggle(employerId: string, candidateId: string): Promise<{ saved: boolean }> {
        const existing = await SavedCandidate.findOne({ where: { employerId, candidateId } });

        if (existing) {
            await existing.destroy();
            return { saved: false };
        }

        await SavedCandidate.create({
            employerId,
            candidateId,
        });

        // Notify Candidate
        try {
            // Get Employer Name (via Company or User)
            // Usually Company stores Employer ID.
            const company = await Company.findOne({ where: { userId: employerId } });
            const employerName = company ? company.name : 'Một nhà tuyển dụng';

            await NotificationService.create({
                userId: candidateId,
                title: 'Hồ sơ được lưu',
                message: `${employerName} đã lưu hồ sơ của bạn.`,
                type: 'save',
                link: `/candidate/profile`, // Or just list of notifications
                relatedId: employerId, // Employer ID or notification ID
            });
        } catch (error) {
            console.error('Failed to create notification for save candidate', error);
        }

        return { saved: true };
    }
    async count(employerId: string): Promise<number> {
        return await SavedCandidate.count({ where: { employerId } });
    }

    async list(employerId: string, page = 1, limit = 9) {
        const offset = (page - 1) * limit
        const { count, rows } = await SavedCandidate.findAndCountAll({
            where: { employerId },
            include: [{ model: User, as: 'candidate' }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        })
        return {
            items: rows,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    }

    async checkStatus(employerId: string, candidateId: string): Promise<{ saved: boolean }> {
        const existing = await SavedCandidate.findOne({ where: { employerId, candidateId } });
        return { saved: !!existing };
    }
}

export default new SavedCandidateService();
