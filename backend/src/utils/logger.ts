import winston from 'winston';
import path from 'path';

// Tạo logger với Winston
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Log errors vào file riêng
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Log tất cả vào combined.log
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Thêm console transport cho development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Filter để không log thông tin nhạy cảm
const sensitiveFields = ['password', 'otp', 'token', 'password_hash', 'jwt'];

logger.on('data', (info: any) => {
  sensitiveFields.forEach(field => {
    if (info[field]) {
      delete info[field];
    }
  });
});

export default logger;
