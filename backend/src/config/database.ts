import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseConfig {
  private static instance: DatabaseConfig;
  private sequelize: Sequelize;

  private constructor() {
    this.sequelize = new Sequelize(process.env.DATABASE_URL!, {
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  public getSequelize(): Sequelize {
    return this.sequelize;
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.sequelize.authenticate();
      console.log('Database connection established successfully');
      return true;
    } catch (error) {
      console.error('Unable to connect to database:', error);
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.sequelize.close();
  }
}

// Export sequelize instance để dùng trong models
export const sequelize = DatabaseConfig.getInstance().getSequelize();

export default DatabaseConfig;