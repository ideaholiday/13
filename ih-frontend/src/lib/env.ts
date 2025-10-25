/**
 * Environment Configuration Helper
 * Provides type-safe access to environment variables with defaults
 */

export interface EnvironmentConfig {
  // App Configuration
  nodeEnv: 'development' | 'production' | 'test'
  isProduction: boolean
  isDevelopment: boolean
  
  // API Configuration  
  apiBaseUrl: string
  apiKey?: string
  useMockData: boolean
  
  // External Services
  tbo: {
    apiKey?: string
    apiUrl: string
    username?: string
    password?: string
  }
  
  // Database
  databaseUrl?: string
  
  // Authentication
  jwtSecret?: string
  
  // Email
  smtp: {
    host?: string
    port?: number
    user?: string
    pass?: string
  }
  
  // Payment
  razorpay: {
    keyId?: string
    keySecret?: string
  }
  
  // Storage
  storage: {
    driver: 'local' | 's3'
    s3?: {
      bucket?: string
      accessKeyId?: string
      secretAccessKey?: string
      region?: string
    }
  }
  
  // Cache
  redisUrl?: string
  
  // Analytics
  analytics: {
    googleAnalyticsId?: string
    facebookPixelId?: string
  }
  
  // Social Auth
  social: {
    facebookAppId?: string
    googleClientId?: string
  }
  
  // Maps & External APIs
  maps: {
    apiKey?: string
  }
  
  // Proxy
  proxyUrl?: string
  
  // Sanity CMS
  sanity: {
    projectId: string
    dataset: string
    apiVersion: string
    readToken?: string
    revalidateSecret?: string
  }
}

// Helper function to get environment variable with type safety
function getEnvVar(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}

function getEnvVarRequired(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}

function getEnvVarBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}

function getEnvVarNumber(key: string, defaultValue?: number): number | undefined {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

// Create configuration object
export const env: EnvironmentConfig = {
  // App Configuration
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // API Configuration
  apiBaseUrl: getEnvVar('NEXT_PUBLIC_API_BASE', 'http://127.0.0.1:8000')!,
  apiKey: getEnvVar('NEXT_PUBLIC_API_KEY'),
  useMockData: getEnvVarBoolean('NEXT_PUBLIC_USE_MOCK_DATA', false),
  
  // External Services
  tbo: {
    apiKey: getEnvVar('TBO_API_KEY'),
    apiUrl: getEnvVar('TBO_API_URL', 'https://api.tbotechnology.in')!,
    username: getEnvVar('TBO_USERNAME'),
    password: getEnvVar('TBO_PASSWORD'),
  },
  
  // Database
  databaseUrl: getEnvVar('DATABASE_URL'),
  
  // Authentication
  jwtSecret: getEnvVar('JWT_SECRET'),
  
  // Email
  smtp: {
    host: getEnvVar('SMTP_HOST'),
    port: getEnvVarNumber('SMTP_PORT'),
    user: getEnvVar('SMTP_USER'),
    pass: getEnvVar('SMTP_PASS'),
  },
  
  // Payment
  razorpay: {
    keyId: getEnvVar('RAZORPAY_KEY_ID'),
    keySecret: getEnvVar('RAZORPAY_KEY_SECRET'),
  },
  
  // Storage
  storage: {
    driver: (getEnvVar('STORAGE_DRIVER', 'local') as 'local' | 's3'),
    s3: {
      bucket: getEnvVar('AWS_S3_BUCKET'),
      accessKeyId: getEnvVar('AWS_ACCESS_KEY_ID'),
      secretAccessKey: getEnvVar('AWS_SECRET_ACCESS_KEY'),
      region: getEnvVar('AWS_REGION', 'us-east-1'),
    }
  },
  
  // Cache
  redisUrl: getEnvVar('REDIS_URL'),
  
  // Analytics
  analytics: {
    googleAnalyticsId: getEnvVar('GOOGLE_ANALYTICS_ID'),
    facebookPixelId: getEnvVar('FACEBOOK_PIXEL_ID'),
  },
  
  // Social Auth
  social: {
    facebookAppId: getEnvVar('FACEBOOK_APP_ID'),
    googleClientId: getEnvVar('GOOGLE_CLIENT_ID'),
  },
  
  // Maps & External APIs
  maps: {
    apiKey: getEnvVar('NEXT_PUBLIC_MAPS_API_KEY'),
  },
  
  // Proxy
  proxyUrl: getEnvVar('PROXY_URL'),
  
  // Sanity CMS
  sanity: {
    projectId: getEnvVar('NEXT_PUBLIC_SANITY_PROJECT_ID', 'demo-project-id')!,
    dataset: getEnvVar('NEXT_PUBLIC_SANITY_DATASET', 'production')!,
    apiVersion: getEnvVar('NEXT_PUBLIC_SANITY_API_VERSION', '2023-01-01')!,
    readToken: getEnvVar('SANITY_API_READ_TOKEN'),
    revalidateSecret: getEnvVar('SANITY_REVALIDATE_SECRET'),
  }
}

// Validation function to check required environment variables
export function validateEnvironment(): void {
  const errors: string[] = []
  
  if (env.isProduction) {
    // In production, validate required variables
    if (!env.apiKey) {
      errors.push('NEXT_PUBLIC_API_KEY is required in production')
    }
    
    if (!env.jwtSecret) {
      errors.push('JWT_SECRET is required in production')
    }
    
    // Add more production-specific validations as needed
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
  }
}

// Feature flags based on environment
export const features = {
  enableMockData: env.useMockData,
  enableAnalytics: !!env.analytics.googleAnalyticsId,
  enableSocialLogin: !!(env.social.facebookAppId && env.social.googleClientId),
  enablePayments: !!(env.razorpay.keyId && env.razorpay.keySecret),
  enableEmailNotifications: !!(env.smtp.host && env.smtp.user),
  enableCloudStorage: env.storage.driver === 's3' && !!env.storage.s3?.bucket,
  enableCache: !!env.redisUrl,
  enableMaps: !!env.maps.apiKey,
  enableProxy: !!env.proxyUrl && env.isDevelopment,
}

// Log environment info (development only)
if (env.isDevelopment) {
  console.log('[ENV] Configuration loaded:', {
    nodeEnv: env.nodeEnv,
    apiBaseUrl: env.apiBaseUrl,
    useMockData: env.useMockData,
    features: Object.entries(features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
  })
}
