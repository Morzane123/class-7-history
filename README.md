# 璧山中学高2027届7班班史系统

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![SQLite](https://img.shields.io/badge/SQLite-3-003B49?style=flat-square&logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

![Status](https://img.shields.io/badge/Status-Online-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/Version-v1.6.0-orange?style=flat-square)

## 项目简介

这是一个班级历史记录系统，类似于Wiki的形式记录班级的点点滴滴。

**在线地址**: [class-7-history.xuanjian.top](https://class-7-history.xuanjian.top)

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite
- **认证**: JWT
- **图片处理**: sharp
- **视频处理**: fluent-ffmpeg

## 功能特性

- 用户注册/登录（邮箱验证）
- 身份验证系统（七班用户/外班用户）
- 用户审核机制（管理员审核通过后才能登录）
- 四级权限管理（访客、普通用户、管理员、超级管理员）
- 板块管理（内政、外交、民生）
- 事件记录（时间线展示）
- 富文本编辑器
- 多级评论系统
- 头像上传（自动压缩）
- 图片上传（自动压缩转WebP）
- 视频上传（自动压缩至50MB）
- 移动端响应式设计
- Apple风格毛玻璃界面
- 登录验证机制（保护内容隐私）
- 网站公告弹窗

## 版本历史

| 版本 | 提交 | 说明 | 日期 |
|------|------|------|------|
| v1.0.0 | 49b6c37 | Initial commit | 2026-04-05 |
| v1.0.1 | 83f77c6 | 初始化项目 - 璧山中学高2027届7班班史系统 | 2026-04-05 |
| v1.0.2 | 75d14eb | 更新报告书和添加nginx配置 | 2026-04-05 |
| v1.0.3 | 509c3d5 | 修复多个问题 | 2026-04-05 |
| v1.1.0 | 52b8845 | 添加富文本编辑器、评论系统和移动端兼容 | 2026-04-05 |
| v1.1.1 | dc8975f | 添加事件编辑页面并优化前端效果 | 2026-04-05 |
| v1.2.0 | 7371803 | 优化首页和侧边栏效果 | 2026-04-05 |
| v1.2.1 | 2b17289 | 添加管理员初始化API | 2026-04-05 |
| v1.2.2 | 0deaac4 | 修复侧边栏收回后主区域不居中的问题 | 2026-04-05 |
| v1.3.0 | 0ed4217 | 添加默认头像功能，修复按钮样式问题 | 2026-04-05 |
| v1.4.0 | - | 修复图片上传问题、删除用户问题，添加身份验证系统 | 2026-04-05 |
| v1.5.0 | - | 添加用户审核、登录验证、使用条例、网站公告 | 2026-04-05 |
| v1.5.1 | - | 添加审核结果邮件通知，修复红点位置 | 2026-04-05 |
| v1.6.0 | - | 添加图片压缩、视频上传与压缩功能 | 2026-04-05 |

## 开发

```bash
npm install    # 安装依赖
npm run dev    # 开发模式
npm run build  # 构建
npm start      # 生产模式
```

## 部署

项目部署在 Ubuntu 服务器上，使用 PM2 进程管理和 Nginx 反向代理。

```bash
cd /var/www/class-7-history
git pull
npm run build
pm2 restart class-7-history
```

## 开发团队

北域工作室
