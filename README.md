# 璧山中学高2027届7班班史系统

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square\&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square\&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square\&logo=tailwind-css)
![SQLite](https://img.shields.io/badge/SQLite-3-003B49?style=flat-square\&logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

![Status](https://img.shields.io/badge/Status-Online-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/Version-v1.6.2-orange?style=flat-square)

## 项目简介

这是一个班级历史记录系统，类似于Wiki的形式记录班级的点点滴滴。系统采用现代化的Apple风格设计，支持富文本编辑、图片视频上传、多级评论等功能。

**在线地址**: [class-7-history.xuanjian.top](https://class-7-history.xuanjian.top)

## 技术栈

| 类别   | 技术                      |
| ---- | ----------------------- |
| 前端框架 | Next.js 14 (App Router) |
| 编程语言 | TypeScript              |
| 样式方案 | Tailwind CSS            |
| 数据库  | SQLite (better-sqlite3) |
| 认证方案 | JWT + bcryptjs          |
| 邮件服务 | nodemailer (腾讯企业邮箱)     |
| 图片处理 | sharp                   |
| 视频处理 | fluent-ffmpeg           |
| 进程管理 | PM2                     |
| 反向代理 | Nginx                   |

## 功能特性

### 用户系统

- 邮箱注册/登录（邮箱验证码验证）
- 身份验证系统（七班用户/外班用户）
- 用户审核机制（管理员审核通过后才能登录）
- 四级权限管理（访客、普通用户、管理员、超级管理员）
- 个人信息修改、头像上传
- 密码重置功能

### 内容管理

- 板块管理（内政、外交、民生等）
- 事件记录（时间线展示）
- 富文本编辑器（支持多种格式）
- 多级评论系统
- 搜索功能

### 媒体处理

- 图片上传（自动压缩转WebP格式）
- 视频上传（自动压缩至50MB左右）
- 视频流式传输（Range请求支持边下边播）
- 视频压缩进度实时反馈
- 小视频并行上传（<50MB）
- 头像上传（自动压缩至200x200px）

### 界面设计

- Apple风格毛玻璃界面
- 移动端响应式设计
- 轮播背景图
- 网站公告弹窗
- 登录验证机制（保护内容隐私）

## 项目结构

```
class-7-history/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # 管理后台
│   │   ├── api/                # API路由
│   │   │   ├── admin/          # 管理API
│   │   │   ├── auth/           # 认证API
│   │   │   ├── events/         # 事件API
│   │   │   ├── files/          # 文件服务API
│   │   │   ├── questions/      # 问题API
│   │   │   ├── sections/       # 板块API
│   │   │   └── user/           # 用户API
│   │   ├── auth/               # 认证页面
│   │   ├── events/             # 事件页面
│   │   ├── profile/            # 个人中心
│   │   ├── search/             # 搜索页面
│   │   ├── terms/              # 使用条例页面
│   │   ├── timeline/           # 时间线
│   │   └── page.tsx            # 首页
│   ├── components/             # 公共组件
│   │   ├── Announcement.tsx    # 公告弹窗
│   │   ├── Avatar.tsx          # 头像组件
│   │   ├── ClientLayout.tsx    # 客户端布局
│   │   ├── HomeBackground.tsx  # 背景轮播
│   │   ├── LayoutClient.tsx    # 布局客户端组件
│   │   ├── Navigation.tsx      # 导航栏
│   │   └── Sidebar.tsx         # 侧边栏
│   └── lib/                    # 工具库
│       ├── auth.ts             # 认证工具
│       ├── db.ts               # 数据库操作
│       ├── email.ts            # 邮件发送
│       ├── imageCompress.ts    # 图片压缩
│       ├── questions.ts        # 问题库
│       └── videoCompress.ts    # 视频压缩
├── public/                     # 静态资源
├── uploads/                    # 上传文件目录
│   ├── avatars/                # 头像
│   ├── events/                 # 事件图片
│   ├── videos/                 # 事件视频
│   └── temp/                   # 临时文件
├── data/                       # SQLite数据库
├── scripts/                    # 脚本
│   ├── backup.sh               # 备份脚本
│   ├── class7-backup.service   # 备份服务
│   └── class7-backup.timer     # 备份定时器
├── .env                        # 环境变量
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 数据库模型

### 用户表 (users)

| 字段              | 类型      | 说明         |
| --------------- | ------- | ---------- |
| id              | TEXT    | 主键 (UUID)  |
| email           | TEXT    | 邮箱 (唯一)    |
| password        | TEXT    | 密码哈希       |
| nickname        | TEXT    | 昵称         |
| avatar          | TEXT    | 头像路径       |
| role            | INTEGER | 权限等级 (0-3) |
| is\_class7      | INTEGER | 是否七班用户     |
| class\_name     | TEXT    | 班级名称       |
| approved        | INTEGER | 审核状态       |
| email\_verified | INTEGER | 邮箱验证状态     |
| created\_at     | TEXT    | 创建时间       |

### 事件表 (events)

| 字段          | 类型   | 说明        |
| ----------- | ---- | --------- |
| id          | TEXT | 主键 (UUID) |
| section\_id | TEXT | 所属板块      |
| title       | TEXT | 事件名称      |
| content     | TEXT | 事件内容(富文本) |
| event\_date | TEXT | 事件发生时间    |
| author\_id  | TEXT | 作者ID      |
| created\_at | TEXT | 记录时间      |

### 评论表 (comments)

| 字段          | 类型   | 说明        |
| ----------- | ---- | --------- |
| id          | TEXT | 主键 (UUID) |
| event\_id   | TEXT | 所属事件      |
| parent\_id  | TEXT | 父评论ID     |
| content     | TEXT | 评论内容      |
| author\_id  | TEXT | 作者ID      |
| created\_at | TEXT | 创建时间      |

### 视频表 (event\_videos)

| 字段          | 类型      | 说明        |
| ----------- | ------- | --------- |
| id          | TEXT    | 主键 (UUID) |
| event\_id   | TEXT    | 所属事件      |
| video\_path | TEXT    | 视频路径      |
| sort\_order | INTEGER | 排序        |
| created\_at | TEXT    | 创建时间      |

## API接口

### 认证接口

| 方法   | 路径                       | 说明     |
| ---- | ------------------------ | ------ |
| POST | /api/auth/register       | 用户注册   |
| POST | /api/auth/login          | 用户登录   |
| POST | /api/auth/logout         | 用户登出   |
| POST | /api/auth/verify         | 验证邮箱   |
| POST | /api/auth/reset-password | 重置密码   |
| GET  | /api/auth/me             | 获取当前用户 |

### 事件接口

| 方法     | 路径                 | 说明     |
| ------ | ------------------ | ------ |
| GET    | /api/events        | 获取事件列表 |
| GET    | /api/events/\[id]  | 获取事件详情 |
| POST   | /api/events/create | 创建事件   |
| PUT    | /api/events/\[id]  | 更新事件   |
| DELETE | /api/events/\[id]  | 删除事件   |
| POST   | /api/events/images | 上传图片   |
| POST   | /api/events/videos | 上传视频   |

### 管理接口

| 方法     | 路径                               | 说明      |
| ------ | -------------------------------- | ------- |
| GET    | /api/admin/users                 | 获取用户列表  |
| PUT    | /api/admin/users/\[id]/role      | 修改用户权限  |
| DELETE | /api/admin/users/\[id]           | 删除用户    |
| GET    | /api/admin/pending               | 获取待审核用户 |
| POST   | /api/admin/pending/\[id]/approve | 通过审核    |
| POST   | /api/admin/pending/\[id]/reject  | 拒绝审核    |
| POST   | /api/admin/sections              | 创建板块    |
| PUT    | /api/admin/sections/\[id]        | 更新板块    |
| DELETE | /api/admin/sections/\[id]        | 删除板块    |
| GET    | /api/admin/init                  | 初始化管理员  |

## 版本历史

| 版本     | 提交      | 说明                       | 日期         |
| ------ | ------- | ------------------------ | ---------- |
| v1.0.0 | 49b6c37 | Initial commit           | 2026-04-05 |
| v1.0.1 | 83f77c6 | 初始化项目 - 璧山中学高2027届7班班史系统 | 2026-04-05 |
| v1.0.2 | 75d14eb | 更新报告书和添加nginx配置          | 2026-04-05 |
| v1.0.3 | 509c3d5 | 修复多个问题                   | 2026-04-05 |
| v1.1.0 | 52b8845 | 添加富文本编辑器、评论系统和移动端兼容      | 2026-04-05 |
| v1.1.1 | dc8975f | 添加事件编辑页面并优化前端效果          | 2026-04-05 |
| v1.2.0 | 7371803 | 优化首页和侧边栏效果               | 2026-04-05 |
| v1.2.1 | 2b17289 | 添加管理员初始化API              | 2026-04-05 |
| v1.2.2 | 0deaac4 | 修复侧边栏收回后主区域不居中的问题        | 2026-04-05 |
| v1.3.0 | 0ed4217 | 添加默认头像功能，修复按钮样式问题        | 2026-04-05 |
| v1.4.0 | 9893d21 | 修复图片上传问题、删除用户问题，添加身份验证系统 | 2026-04-05 |
| v1.5.0 | ce81083 | 添加用户审核、登录验证、使用条例、网站公告    | 2026-04-05 |
| v1.5.1 | a9cbf85 | 添加审核结果邮件通知，修复红点位置        | 2026-04-05 |
| v1.6.0 | d95ac9b | 添加图片压缩、视频上传与压缩功能         | 2026-04-05 |
| v1.6.1 | 43a74f3 | 视频流式传输、编辑页面视频功能          | 2026-04-11 |
| v1.6.2 | -       | 视频压缩进度反馈、并行上传、硬件优化        | 2026-04-11 |

## 开发指南

### 环境要求

- Node.js 18+
- npm 或 pnpm
- ffmpeg (视频压缩功能需要)

### 本地开发

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

### 环境变量配置

创建 `.env` 文件：

```env
JWT_SECRET=your-jwt-secret
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
```

## 部署说明

项目部署在 Ubuntu 服务器上：

```bash
# 进入项目目录
cd /var/www/class-7-history

# 拉取最新代码
git pull

# 安装依赖
npm install

# 构建
npm run build

# 重启服务
pm2 restart class-7-history

# 运行数据库迁移（如有）
curl http://localhost:3003/api/admin/migrate
```

### 服务器信息

- **端口**: 3003
- **域名**: class-7-history.xuanjian.top
- **备份**: 每天03:00自动备份到/var/beifen2

## 开发团队

北域工作室

## 许可证

MIT License
