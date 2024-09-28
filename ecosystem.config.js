module.exports = {
  apps: [
    {
      name: 'speaker-server',
      script: 'app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 8051,
      },
    },
  ],
}
