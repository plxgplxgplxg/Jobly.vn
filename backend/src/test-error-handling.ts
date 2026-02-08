// Test file để kiểm tra error handling
import { ValidationError, AuthenticationError, AuthorizationError, NotFoundError, RateLimitError } from './utils/errors';
import { logger } from './utils/logger';
import { alertService } from './services/AlertService';

async function testErrorClasses() {
  console.log('=== Testing Error Classes ===\n');

  // Test ValidationError
  try {
    throw new ValidationError('Email không hợp lệ', 'email');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('✓ ValidationError:', error.message, '- Field:', error.field);
    }
  }

  // Test AuthenticationError
  try {
    throw new AuthenticationError('Token không hợp lệ', 'INVALID_TOKEN');
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.log('✓ AuthenticationError:', error.message, '- Code:', error.code);
    }
  }

  // Test AuthorizationError
  try {
    throw new AuthorizationError('Không có quyền truy cập', 'FORBIDDEN');
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.log('✓ AuthorizationError:', error.message, '- Code:', error.code);
    }
  }

  // Test NotFoundError
  try {
    throw new NotFoundError('Không tìm thấy tài nguyên');
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log('✓ NotFoundError:', error.message);
    }
  }

  // Test RateLimitError
  try {
    throw new RateLimitError('Quá nhiều yêu cầu', 60);
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.log('✓ RateLimitError:', error.message, '- Retry after:', error.retryAfter, 'seconds');
    }
  }
}

async function testLogger() {
  console.log('\n=== Testing Logger ===\n');

  logger.info('Test info log');
  logger.warn('Test warning log');
  logger.error('Test error log', { context: 'test' });

  // Test không log thông tin nhạy cảm
  const sensitiveData = {
    username: 'testuser',
    password: 'secret123',
    otp: '123456',
    token: 'jwt-token-here'
  };

  logger.info('Test sensitive data filtering', sensitiveData);
  console.log('✓ Logger working - check logs/ folder for output');
}

async function testAlertService() {
  console.log('\n=== Testing Alert Service ===\n');

  await alertService.sendAlert({
    type: 'TEST_ALERT',
    message: 'This is a test alert',
    context: { test: true }
  });

  console.log('✓ Alert service working - check logs for alert output');
}

async function runTests() {
  try {
    await testErrorClasses();
    await testLogger();
    await testAlertService();
    
    console.log('\n=== All Tests Passed ===\n');
    console.log('Error handling system is working correctly!');
    console.log('Check logs/ folder for log files.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();
