import { Request, Response, NextFunction } from 'express';
import { ValidationError, AuthenticationError, AuthorizationError, NotFoundError, RateLimitError } from '../utils/errors';
import { logger } from '../utils/logger';
import { alertService } from '../services/AlertService';

// Centralized error handler middleware
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Validation Error
  if (err instanceof ValidationError) {
    logger.warn('Validation error:', {
      message: err.message,
      field: err.field,
      url: req.url,
      method: req.method
    });
    
    return res.status(400).json({
      error: err.message,
      field: err.field,
      code: 'VALIDATION_ERROR'
    });
  }

  // Authentication Error
  if (err instanceof AuthenticationError) {
    logger.warn('Authentication error:', {
      message: err.message,
      code: err.code,
      url: req.url,
      method: req.method
    });
    
    return res.status(401).json({
      error: err.message,
      code: err.code
    });
  }

  // Authorization Error
  if (err instanceof AuthorizationError) {
    logger.warn('Authorization error:', {
      message: err.message,
      code: err.code,
      url: req.url,
      method: req.method,
      userId: (req as any).user?.id
    });
    
    return res.status(403).json({
      error: err.message,
      code: err.code
    });
  }

  // Not Found Error
  if (err instanceof NotFoundError) {
    logger.info('Not found error:', {
      message: err.message,
      url: req.url,
      method: req.method
    });
    
    return res.status(404).json({
      error: err.message,
      code: 'NOT_FOUND'
    });
  }

  // Rate Limit Error
  if (err instanceof RateLimitError) {
    logger.warn('Rate limit error:', {
      message: err.message,
      retryAfter: err.retryAfter,
      url: req.url,
      method: req.method,
      ip: req.ip
    });
    
    return res.status(429).json({
      error: err.message,
      retryAfter: err.retryAfter,
      code: 'RATE_LIMIT'
    });
  }

  // Unhandled errors - log chi tiết và gửi alert
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: (req as any).user?.id,
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Gửi alert cho Admin về lỗi nghiêm trọng
  alertService.sendAlert({
    type: 'CRITICAL_ERROR',
    message: err.message,
    context: { 
      url: req.url, 
      method: req.method,
      stack: err.stack,
      userId: (req as any).user?.id
    }
  }).catch(alertErr => {
    logger.error('Failed to send alert:', alertErr);
  });

  // Trả về generic error message cho client
  return res.status(500).json({
    error: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
    code: 'INTERNAL_ERROR'
  });
}

// 404 handler cho routes không tồn tại
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = new NotFoundError(`Route ${req.method} ${req.url} không tồn tại`);
  next(error);
}
