import cron from 'node-cron';
import JobService from '../services/JobService';

export function setupCronJobs() {
  // Chạy mỗi ngày lúc 00:00 để expire các job đã hết hạn
  cron.schedule('0 0 * * *', async () => {
    console.log('Running job expiration cron...');
    try {
      await JobService.expireOldJobs();
    } catch (error) {
      console.error('Error in job expiration cron:', error);
    }
  });

  console.log('Cronjobs đã được thiết lập');
}
