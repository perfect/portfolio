# 图片存储说明

## 本地存储

本项目现在使用**本地文件系统**来存储上传的图片。

### 存储目录结构

```
uploads/
├── covers/          # 封面图片
├── paintings/       # 作品图片
└── profile/         # 头像图片
```

### 优势

✅ **简单直接** - 不需要配置 AWS S3  
✅ **零成本** - 不需要额外的云存储费用  
✅ **快速开发** - 适合小型项目和原型  
✅ **完全控制** - 所有数据在本地服务器上  

### 注意事项

⚠️ **备份重要** - 定期备份 `uploads/` 文件夹  
⚠️ **磁盘空间** - 确保服务器有足够的磁盘空间  
⚠️ **生产环境** - 大型应用建议使用 CDN 或云存储  

### 部署建议

如果以后需要迁移到云存储，只需：
1. 安装相应的 SDK（如 AWS S3）
2. 修改 `routes/upload.js` 文件
3. 上传现有图片到云存储
4. 更新数据库中的 URL

### 环境变量

不再需要以下 AWS 配置：

```env
# 以下变量已不再需要
# AWS_REGION
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY
# S3_BUCKET_NAME
```

只需保留：

```env
DATABASE_URL="..."
PORT=3000
JWT_SECRET="..."
ADMIN_PASSWORD="admin123"
```

