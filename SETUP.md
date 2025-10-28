# 快速设置指南

## 1. 安装依赖

```bash
npm install
```

## 2. 设置 PostgreSQL 数据库

确保你已经安装并运行 PostgreSQL，然后创建数据库：

```bash
createdb portfolio
```

或在 PostgreSQL 命令行中：

```sql
CREATE DATABASE portfolio;
```

## 3. 配置环境变量

创建 `.env` 文件并填入以下内容：

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/portfolio?schema=public"

# Server
PORT=3000
NODE_ENV=development

# JWT Secret (请改为一个安全的随机字符串)
JWT_SECRET=your-secret-key-change-this-in-production-123456789

# AWS S3 (需要先创建 S3 bucket 和 IAM 用户)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET_NAME=your-bucket-name

# Admin Password
ADMIN_PASSWORD=admin123
```

## 4. 设置 AWS S3

### 4.1 创建 S3 Bucket

1. 登录 AWS 控制台
2. 进入 S3 服务
3. 点击"创建存储桶"
4. 填写存储桶名称（例如：portfolio-images）
5. 取消选中"阻止所有公共访问"（如果希望图片公开访问）
6. 点击"创建存储桶"

### 4.2 创建 IAM 用户

1. 进入 IAM 服务
2. 点击"用户" -> "添加用户"
3. 用户名：`portfolio-uploader`
4. 选中"编程访问"
5. 下一步，勾选"直接附加现有策略" -> 选择 "AmazonS3FullAccess"
6. 创建用户并保存 **Access Key ID** 和 **Secret Access Key**

### 4.3 配置 Bucket CORS

1. 进入你的 S3 bucket
2. 点击"权限"标签
3. 在"跨源资源共享 (CORS)"部分，添加以下配置：

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## 5. 初始化数据库

```bash
# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate
```

## 6. 启动服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

## 7. 访问应用

### 查看前端网站
访问：http://localhost:3000

### 登录管理后台
访问：http://localhost:3000/admin/

登录凭据：
- 用户名：`admin`
- 密码：`admin123`（或你在 `.env` 中设置的密码）

## 8. 开始使用

1. 登录管理后台
2. 在"封面管理"中上传封面图片
3. 在"作品管理"中添加作品
4. 在"个人信息"中更新头像、描述和标签
5. 刷新前端网站查看效果

## 常见问题

### 数据库连接错误
- 检查 PostgreSQL 是否在运行
- 确认 DATABASE_URL 中的用户名、密码和数据库名正确
- 尝试使用 `psql -U postgres -d portfolio` 测试连接

### S3 上传失败
- 检查 AWS 凭据是否正确
- 确认 S3 bucket 名称正确
- 验证 IAM 用户有正确的权限
- 检查 CORS 配置

### 无法登录
- 确认 `.env` 文件存在且 ADMIN_PASSWORD 设置正确
- 检查服务器日志查看错误信息

