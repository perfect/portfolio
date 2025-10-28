# 图片路径问题修复说明

## 问题

上传的图片都被保存到 `uploads/general/` 目录下，但数据库记录的 URL 是 `uploads/covers/` 或 `uploads/profile/` 等。

## 原因

在上传逻辑中，`req.body.folder` 可能没有正确传递到服务器端，导致 multer 总是使用默认的 `general` 文件夹。

## 修复

已修改 `routes/upload.js`，现在会根据实际保存的文件路径来确定 folder 名称：

```javascript
// 根据实际文件路径获取文件夹名
const filePath = req.file.path;
const relativePath = path.relative(uploadsDir, filePath);
const folder = path.dirname(relativePath);
```

这样无论文件实际保存在哪个目录，返回的 URL 都会是正确的。

## 临时解决方案

如果还有旧图片显示不出来的问题，可以手动复制到正确的目录：

```bash
# 封面图片
mkdir -p uploads/covers
cp uploads/general/old-file.jpg uploads/covers/

# 头像图片  
mkdir -p uploads/profile
cp uploads/general/old-file.webp uploads/profile/
```

## 测试

上传新图片后，应该会正确保存到对应的目录：
- 封面 → `uploads/covers/`
- 作品 → `uploads/paintings/`
- 头像 → `uploads/profile/`

