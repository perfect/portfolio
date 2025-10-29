module.exports = {
  apps: [{
    name: 'portfolio-server',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // 自动重启配置
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // 日志配置
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 监控配置
    monitoring: true,
    
    // 进程管理
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // 健康检查
    health_check_grace_period: 3000,
    
    // 错误处理
    exp_backoff_restart_delay: 100
  }]
};
