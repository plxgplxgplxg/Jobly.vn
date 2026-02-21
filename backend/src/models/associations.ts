import User from './User';
import Company from './Company';
import Job from './Job';
import UploadedCV from './UploadedCV';
import CVTemplate from './CVTemplate';
import UserCV from './UserCV';
import Application from './Application';
import ApplicationStatusHistory from './ApplicationStatusHistory';
import Conversation from './Conversation';
import Message from './Message';
import AdminLog from './AdminLog';
import Notification from './Notification';
import SavedJob from './SavedJob';
import SavedCandidate from './SavedCandidate';

// User - Company
User.hasMany(Company, { foreignKey: 'userId', as: 'companies' });
Company.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Company - Job
Company.hasMany(Job, { foreignKey: 'companyId', as: 'jobs' });
Job.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// User - UploadedCV
User.hasMany(UploadedCV, { foreignKey: 'userId', as: 'uploadedCVs' });
UploadedCV.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// CVTemplate - UserCV
CVTemplate.hasMany(UserCV, { foreignKey: 'templateId', as: 'userCVs' });
UserCV.belongsTo(CVTemplate, { foreignKey: 'templateId', as: 'template' });

// User - UserCV
User.hasMany(UserCV, { foreignKey: 'userId', as: 'userCVs' });
UserCV.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Application (Candidate)
User.hasMany(Application, { foreignKey: 'candidateId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

// Job - Application
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Application - ApplicationStatusHistory
Application.hasMany(ApplicationStatusHistory, { foreignKey: 'applicationId', as: 'statusHistory' });
ApplicationStatusHistory.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

// User - Conversation
User.hasMany(Conversation, { foreignKey: 'user1Id', as: 'conversationsAsUser1' });
User.hasMany(Conversation, { foreignKey: 'user2Id', as: 'conversationsAsUser2' });
Conversation.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' });
Conversation.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' });

// Conversation - Message
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// User - Message
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// User - AdminLog
User.hasMany(AdminLog, { foreignKey: 'adminId', as: 'adminLogs' });
AdminLog.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

// Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// SavedJob
User.hasMany(SavedJob, { foreignKey: 'userId', as: 'savedJobs' });
SavedJob.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Job.hasMany(SavedJob, { foreignKey: 'jobId', as: 'saves' });
SavedJob.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// SavedCandidate
User.hasMany(SavedCandidate, { foreignKey: 'employerId', as: 'savedCandidates' });
SavedCandidate.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });
User.hasMany(SavedCandidate, { foreignKey: 'candidateId', as: 'savedBy' });
SavedCandidate.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

export { User, Company, Job, UploadedCV, CVTemplate, UserCV, Application, ApplicationStatusHistory, Conversation, Message, AdminLog, Notification, SavedJob, SavedCandidate };
