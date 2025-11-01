module.exports = {
  apps: [
    {
      name: 'ih-frontend',
      cwd: '/var/www/iholiday/backend/ih-frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3010
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'ih-queue',
      cwd: '/var/www/iholiday/backend/ih-backend',
      script: 'artisan',
      args: 'queue:work --sleep=3 --tries=3',
      interpreter: 'php',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
};
