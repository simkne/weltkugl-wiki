module.exports = {
  apps: [
    {
      name: 'docus-wiki',
      script: '.output/server/index.mjs',
      cwd: '/httpdocs/docus',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 3001,
      },
    },
  ],
}
