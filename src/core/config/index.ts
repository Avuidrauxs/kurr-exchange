import 'dotenv/config';

interface Config {
  server: {
    port: number;
    env: string;
  };
  redis: {
    url: string;
    host: string;
    port: string;
    ttl: number;
    enabled: boolean;
  };
  maxRetries: number;
  retryDelay: number;
  errorRate: number;
}

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379',
    ttl: 60 * 60 * 24, // 24 hours
    enabled: process.env.REDIS_ENABLED === 'true',
  },
  maxRetries: 3,
  retryDelay: 1000,
  errorRate: 0.1,
};
