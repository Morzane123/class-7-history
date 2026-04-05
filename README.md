# 璧山中学高2027届7班班史系统

## 项目简介
这是一个班级历史记录系统，类似于Wiki的形式记录班级的点点滴滴。

## 技术栈
- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite
- **认证**: JWT

## 功能特性
- 用户注册/登录（邮箱验证）
- 三级权限管理（普通用户、管理员、超级管理员）
- 板块管理（内政、外交、民生）
- 事件记录（时间线展示）
- 头像上传

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## 部署
项目部署在 Ubuntu 服务器上，使用 PM2 进程管理和 Nginx 反向代理。

## 开发团队
北域工作室
