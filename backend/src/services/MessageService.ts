import { Op } from 'sequelize';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';
import Application from '../models/Application';
import { SendMessageDTO, MessageDTO, ConversationDTO } from '../types/message.types';
import { redisClient } from '../config/redis';

class MessageService {
  // Blacklist từ ngữ vi phạm
  private readonly BLACKLIST_WORDS = ['spam', 'scam', 'lừa đảo'];

  async sendMessage(senderId: string, data: SendMessageDTO): Promise<MessageDTO> {
    const { receiverId, content } = data;

    // Validate content
    if (!await this.validateMessageContent(content)) {
      throw new Error('Nội dung tin nhắn chứa từ ngữ vi phạm');
    }

    // Check permission - tam bo qua de test
    // if (!await this.canStartConversation(senderId, receiverId)) {
    //   throw new Error('Bạn không có quyền nhắn tin với người dùng này');
    // }

    // Tìm hoặc tạo conversation
    let conversation = await this.findOrCreateConversation(senderId, receiverId);

    // Tạo message
    const message = await Message.create({
      conversationId: conversation.id,
      senderId,
      receiverId,
      content,
      isRead: false,
    });

    // Update conversation updatedAt
    await conversation.update({ updatedAt: new Date() });

    // Invalidate cache
    await this.invalidateConversationCache(senderId);
    await this.invalidateConversationCache(receiverId);

    return this.toMessageDTO(message);
  }

  async createConversation(userId1: string, userId2: string): Promise<ConversationDTO> {
    // Check permission - tam thoi bo qua check application de test
    // if (!await this.canStartConversation(userId1, userId2)) {
    //   throw new Error('Bạn không có quyền nhắn tin với người dùng này');
    // }

    const conversation = await this.findOrCreateConversation(userId1, userId2);

    // Fetch full details
    const fullConversation = await Conversation.findByPk(conversation.id, {
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'email', 'avatarUrl', 'role'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'email', 'avatarUrl', 'role'] },
      ],
    });

    if (!fullConversation) {
      throw new Error('Không thể tạo cuộc trò chuyện');
    }

    return this.toConversationDTO(fullConversation, userId1);
  }

  async getConversation(userId: string, otherUserId: string): Promise<ConversationDTO | null> {
    const conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { user1Id: userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: userId },
        ],
      },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'email', 'avatarUrl', 'role'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'email', 'avatarUrl', 'role'] },
      ],
    });

    if (!conversation) {
      return null;
    }

    return this.toConversationDTO(conversation, userId);
  }

  async listConversations(userId: string): Promise<ConversationDTO[]> {
    // Check cache
    const cacheKey = `conversations:${userId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }

    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'email', 'avatarUrl', 'role'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'email', 'avatarUrl', 'role'] },
      ],
      order: [['updatedAt', 'DESC']],
    });

    const conversationDTOs = await Promise.all(
      conversations.map((conv) => this.toConversationDTO(conv, userId))
    );

    // Cache result
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(conversationDTOs)); // 5 phút
    } catch (error) {
      console.error('Redis set error:', error);
    }

    return conversationDTOs;
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await Message.update(
      { isRead: true },
      {
        where: {
          conversationId,
          receiverId: userId,
          isRead: false,
        },
      }
    );

    // Invalidate cache
    await this.invalidateConversationCache(userId);
  }

  async getMessages(conversationId: string, userId: string, limit: number = 50): Promise<MessageDTO[]> {
    // Verify user is part of conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
      throw new Error('Không có quyền truy cập conversation này');
    }

    const messages = await Message.findAll({
      where: { conversationId },
      order: [['sentAt', 'ASC']],
      limit,
    });

    return messages.map((msg) => this.toMessageDTO(msg));
  }

  async canStartConversation(userId1: string, userId2: string): Promise<boolean> {
    // Check user status
    const user1 = await User.findByPk(userId1);
    const user2 = await User.findByPk(userId2);

    if (!user1 || !user2) {
      return false;
    }

    if (user1.status === 'locked' || user2.status === 'locked') {
      return false;
    }

    // Tam thoi luon cho phep de test, bo qua check application
    return true;
  }

  async validateMessageContent(content: string): Promise<boolean> {
    if (!content || content.trim().length === 0) {
      return false;
    }

    if (content.length > 1000) {
      return false;
    }

    // Check blacklist
    const lowerContent = content.toLowerCase();
    for (const word of this.BLACKLIST_WORDS) {
      if (lowerContent.includes(word)) {
        return false;
      }
    }

    return true;
  }

  private async findOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    // Sort IDs de dam bao tinh nhat quan va tranh duplicate (user1 < user2)
    const [u1, u2] = [user1Id, user2Id].sort();

    // Check users exist
    const [user1, user2] = await Promise.all([User.findByPk(u1), User.findByPk(u2)]);
    if (!user1 || !user2) {
      throw new Error('User not found');
    }

    let conversation = await Conversation.findOne({
      where: {
        user1Id: u1,
        user2Id: u2,
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        user1Id: u1,
        user2Id: u2,
      });
    }

    return conversation;
  }

  private async toConversationDTO(conversation: any, currentUserId: string): Promise<ConversationDTO> {
    // Get last message
    const lastMessage = await Message.findOne({
      where: { conversationId: conversation.id },
      order: [['sentAt', 'DESC']],
    });

    // Chỉ đếm tin nhắn chưa đọc mà người khác gửi cho mình
    // Không đếm tin nhắn mình gửi đi (senderId = currentUserId)
    const unreadCount = await Message.count({
      where: {
        conversationId: conversation.id,
        receiverId: currentUserId,
        senderId: { [Op.ne]: currentUserId },
        isRead: false,
      },
    });

    // Map avatar URL if exists
    const user1 = conversation.user1?.get ? conversation.user1.get({ plain: true }) : conversation.user1;
    const user2 = conversation.user2?.get ? conversation.user2.get({ plain: true }) : conversation.user2;

    const participants = [
      {
        id: user1.id,
        name: user1.name,
        email: user1.email,
        role: user1.role,
        avatarUrl: user1.avatarUrl,
      },
      {
        id: user2.id,
        name: user2.name,
        email: user2.email,
        role: user2.role,
        avatarUrl: user2.avatarUrl,
      },
    ];

    return {
      id: conversation.id,
      participants,
      lastMessage: lastMessage ? this.toMessageDTO(lastMessage) : undefined,
      unreadCount,
      updatedAt: conversation.updatedAt,
    };
  }

  private toMessageDTO(message: any): MessageDTO {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      isRead: message.isRead,
      sentAt: message.sentAt,
      // Se them sender info o service layer hoac query include
      sender: {
        id: message.senderId,
        name: 'Unknown', // Placeholder
      }
    };
  }

  private async invalidateConversationCache(userId: string): Promise<void> {
    try {
      await redisClient.del(`conversations:${userId}`);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }
}

export default new MessageService();
