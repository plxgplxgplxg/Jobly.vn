import Message from '../models/Message';

class MessageRepository {
    async countUnreadByUserId(userId: string): Promise<number> {
        return await Message.count({
            where: {
                receiverId: userId,
                isRead: false
            }
        });
    }
}

export default new MessageRepository();
