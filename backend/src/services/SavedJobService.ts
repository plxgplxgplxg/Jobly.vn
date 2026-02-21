import SavedJob from '../models/SavedJob';
import NotificationService from './NotificationService';
import Job from '../models/Job';
import Company from '../models/Company';
import User from '../models/User';

class SavedJobService {
    async toggle(userId: string, jobId: string): Promise<{ saved: boolean }> {
        const existing = await SavedJob.findOne({ where: { userId, jobId } });

        if (existing) {
            await existing.destroy();
            return { saved: false };
        }

        await SavedJob.create({ userId, jobId });

        // Notify Employer
        try {
            const job = await Job.findByPk(jobId, {
                include: [{ model: Company, as: 'company' }]
            });

            if (job && job.company && job.company.userId) {
                // Get candidate name
                const candidate = await User.findByPk(userId);
                const candidateName = candidate ? candidate.name : 'Một ứng viên';

                await NotificationService.create({
                    userId: job.company.userId,
                    title: 'Công việc được lưu',
                    message: `${candidateName} đã lưu công việc "${job.title}" của bạn.`,
                    type: 'save',
                    link: `/employer/candidates/${userId}`, // Link to candidate profile? Or just notification list
                    relatedId: jobId
                });
            }
        } catch (error) {
            console.error('Failed to create notification for save job', error);
        }

        return { saved: true };
    }

    async checkStatus(userId: string, jobId: string): Promise<{ saved: boolean }> {
        const count = await SavedJob.count({ where: { userId, jobId } });
        return { saved: count > 0 };
    }

    async list(userId: string, page = 1, limit = 9) {
        const offset = (page - 1) * limit
        const { count, rows } = await SavedJob.findAndCountAll({
            where: { userId },
            include: [
                {
                    model: Job,
                    as: 'job',
                    include: [{ model: Company, as: 'company' }]
                }
            ],
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
    async count(userId: string): Promise<number> {
        return await SavedJob.count({ where: { userId } });
    }
}

export default new SavedJobService();
