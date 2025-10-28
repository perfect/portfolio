# 故障排除指南

## Prisma 数据库错误

### 错误：unable to read message kind

这个错误通常是由于数据库连接或 Prisma 版本问题导致的。

#### 解决方案 1：重新设置 Prisma

```bash
# 删除现有的 Prisma Client
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# 重新生成
npm run prisma:generate
```

#### 解决方案 2：重置数据库

如果你还没有重要的数据，可以重置数据库：

```bash
# 删除数据库
dropdb portfolio

# 重新创建数据库
createdb portfolio

# 重新运行迁移
npm run prisma:migrate

# 或者直接推送到数据库（不会创建迁移历史）
npx prisma db push
```

#### 解决方案 3：使用 db push 而不是 migrate

如果你想快速开始，可以跳过迁移历史：

```bash
npm run prisma:generate
npx prisma db push
```

这会直接将 schema 推送到数据库，不创建迁移文件。

#### 解决方案 4：检查 PostgreSQL 版本

确保你使用的 PostgreSQL 版本与 Prisma 兼容（建议 12+）：

```bash
psql --version
```

### 常见数据库连接错误

#### 连接字符串格式错误

确保 `.env` 中的 DATABASE_URL 格式正确：

```env
# 正确格式
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# 示例（请根据你的实际配置修改）
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/portfolio?schema=public"
```

#### PostgreSQL 没有运行

检查 PostgreSQL 是否正在运行：

```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# 如果未运行，启动它
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux
```

## S3 上传错误

### 错误：Access Denied

检查：
1. AWS_ACCESS_KEY_ID 和 AWS_SECRET_ACCESS_KEY 是否正确
2. IAM 用户是否有 S3 权限
3. S3 bucket 名称是否正确

### 错误：Bucket not found

确保：
1. 在 AWS 控制台中存在该 bucket
2. S3_BUCKET_NAME 在 `.env` 中配置正确
3. AWS_REGION 与 bucket 所在区域匹配

## 认证错误

### 无法登录

1. 检查 `.env` 文件中的 ADMIN_PASSWORD
2. 确认服务器正在运行
3. 查看浏览器控制台是否有错误
4. 查看服务器终端日志

### Token 失效

如果 token 过期，只需重新登录即可。Token 默认有效期为 24 小时。

## 前端数据不显示

如果前端网站显示 "Loading..." 但数据不出现：

1. 打开浏览器开发者工具（F12）
2. 查看控制台是否有错误
3. 检查 Network 标签，看 `/api/data` 请求是否成功
4. 确认后端服务器正在运行

## 端口被占用

如果端口 3000 已被占用：

修改 `.env` 文件中的 PORT：

```env
PORT=3001
```

或者查找并关闭占用端口的进程：

```bash
# 查找占用 3000 端口的进程
lsof -i :3000

# 关闭进程（替换 PID）
kill -9 <PID>
```

## 重新开始

如果遇到无法解决的问题，可以完全重置：

```bash
# 1. 停止服务器（Ctrl+C）

# 2. 清理
rm -rf node_modules
rm -rf .prisma
dropdb portfolio

# 3. 重新安装
npm install

# 4. 重新创建数据库
createdb portfolio

# 5. 生成和推送
npm run prisma:generate
npx prisma db push

# 6. 启动
npm run dev
```

## 需要帮助？

如果以上方法都无法解决问题，请提供：
1. 错误信息的完整输出
2. `.env` 文件内容（隐藏敏感信息）
3. 服务器启动时的日志
4. 浏览器控制台的错误信息

