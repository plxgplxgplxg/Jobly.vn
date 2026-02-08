import { logger } from '../utils/logger';

interface AlertData {
  type: string;
  message: string;
  context: any;
}

class AlertService {
  // Gửi alert cho Admin khi có lỗi nghiêm trọng
  async sendAlert(alert: AlertData): Promise<void> {
    try {
      // Log alert
      logger.warn('ALERT:', {
        type: alert.type,
        message: alert.message,
        context: alert.context,
        timestamp: new Date().toISOString()
      });

      // TODO: Tích hợp với email service (nodemailer)
      // TODO: Tích hợp với Slack webhook
      // TODO: Tích hợp với SMS service
      
      // Placeholder cho future implementation
      if (process.env.ALERT_EMAIL) {
        // await this.sendEmailAlert(alert);
      }
      
      if (process.env.SLACK_WEBHOOK_URL) {
        // await this.sendSlackAlert(alert);
      }
    } catch (error) {
      // Không throw error để tránh infinite loop
      logger.error('Failed to send alert:', error);
    }
  }

  // Gửi alert qua email (placeholder)
  private async sendEmailAlert(alert: AlertData): Promise<void> {
    // Implementation với nodemailer
    logger.info('Email alert would be sent:', alert);
  }

  // Gửi alert qua Slack (placeholder)
  private async sendSlackAlert(alert: AlertData): Promise<void> {
    // Implementation với Slack webhook
    logger.info('Slack alert would be sent:', alert);
  }
}

export const alertService = new AlertService();
export default alertService;
