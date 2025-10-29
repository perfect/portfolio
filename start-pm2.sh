#!/bin/bash

# PM2 Portfolio Server 启动脚本
# 使用方法: ./start-pm2.sh [start|stop|restart|status|logs]

case "$1" in
    start)
        echo "🚀 启动 Portfolio 服务器 (PM2)..."
        pm2 start ecosystem.config.js --env production
        pm2 save
        echo "✅ 服务器已启动"
        ;;
    stop)
        echo "🛑 停止 Portfolio 服务器..."
        pm2 stop portfolio-server
        echo "✅ 服务器已停止"
        ;;
    restart)
        echo "🔄 重启 Portfolio 服务器..."
        pm2 restart portfolio-server
        echo "✅ 服务器已重启"
        ;;
    status)
        echo "📊 Portfolio 服务器状态:"
        pm2 status portfolio-server
        ;;
    logs)
        echo "📝 Portfolio 服务器日志:"
        pm2 logs portfolio-server --lines 50
        ;;
    *)
        echo "使用方法: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动服务器"
        echo "  stop    - 停止服务器"
        echo "  restart - 重启服务器"
        echo "  status  - 查看状态"
        echo "  logs    - 查看日志"
        exit 1
        ;;
esac
