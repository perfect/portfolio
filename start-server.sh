#!/bin/bash

# 停止旧服务器
pkill -9 -f "node server.js" 2>/dev/null

# 启动服务器，使用 80 端口（需要 sudo 权限）
echo "正在启动服务器..."
echo "提示：80 端口需要管理员权限，请输入您的密码"
sudo PORT=80 node server.js

