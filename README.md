# Portfolio 管理系统

一个完整的美术设计生 Portfolio 管理系统，包含前端展示网站和后台管理界面。

## 功能特性

### 后台管理功能
1. **封面管理** - 上传两个封面图片（大图和竖图）
2. **作品管理** - 上传 Portfolio 作品，包含以下属性：
   - Year（年份）
   - Medium（媒介）
   - Size（尺寸，英寸）
   - 可上传多张图片
   - 支持编辑和删除
3. **个人信息管理** - 上传头像、编辑描述和标签

### 技术栈

**后端：**
- Node.js + Express
- PostgreSQL + Prisma ORM
- AWS S3 图片存储
- JWT 认证

**前端：**
- 纯 HTML + React (CDN)
- 管理后台界面

## 安装和设置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio?schema=public"

# Server
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-secret-key-change-this-in-production

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET_NAME=your-bucket-name

# Admin Credentials
ADMIN_PASSWORD=admin123
```

### 3. 设置 PostgreSQL 数据库

```bash
# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate
```

### 4. 配置 AWS S3

1. 在 AWS 控制台创建 S3 bucket
2. 设置 bucket 为公开读取（或配置 CORS）
3. 创建 IAM 用户并获取 Access Key 和 Secret Key
4. 将凭据填入 `.env` 文件

### 5. 启动服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

## 使用指南

### 访问管理后台

1. 打开浏览器访问：`http://localhost:3000/admin/`
2. 使用以下凭据登录：
   - 用户名：`admin`
   - 密码：`admin123`（或您在 `.env` 中设置的密码）

### 管理内容

#### 上传封面
1. 在"封面管理"标签页
2. 选择大图或竖图
3. 点击"上传封面"按钮

#### 添加作品
1. 进入"作品管理"标签页
2. 点击"添加新作品"按钮
3. 填写以下信息：
   - 标题（必填）
   - 描述
   - 类别（艺术/UI&UX/产品）
   - 年份、媒介、尺寸
   - 上传一张或多张图片
4. 点击"保存"

#### 编辑个人信息
1. 进入"个人信息"标签页
2. 上传头像（可选）
3. 编辑个人描述
4. 每行一个标签
5. 点击"保存个人信息"

## 项目结构

```
.
├── server.js              # Express 服务器
├── routes/                # API 路由
│   ├── auth.js            # 认证路由
│   ├── upload.js           # 文件上传路由
│   ├── projects.js         # 作品管理路由
│   ├── covers.js           # 封面管理路由
│   └── profile.js          # 个人信息路由
├── prisma/
│   └── schema.prisma       # 数据库模型
├── admin/                  # 管理后台
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── index.html              # 前端展示网站
└── styles.css              # 前端样式
```

## API 端点

### 公开 API
- `GET /api/data` - 获取所有数据（封面、作品、个人信息）

### 需要认证的 API
- `POST /api/auth/login` - 登录
- `POST /api/upload` - 上传图片到 S3
- `GET /api/covers` - 获取所有封面
- `POST /api/covers` - 创建/更新封面
- `GET /api/projects` - 获取所有作品
- `POST /api/projects` - 创建作品
- `PUT /api/projects/:id` - 更新作品
- `DELETE /api/projects/:id` - 删除作品
- `GET /api/profile` - 获取个人信息
- `PUT /api/profile` - 更新个人信息

## 数据库模型

- **Cover** - 封面图片
- **Project** - 作品
- **Profile** - 个人信息
- **Admin** - 管理员账号

## 生产环境部署

1. 确保 `.env` 中的敏感信息正确设置
2. 使用更强的 JWT_SECRET
3. 配置 HTTPS
4. 设置适当的 CORS 策略
5. 定期备份数据库

## 许可证

MIT License

