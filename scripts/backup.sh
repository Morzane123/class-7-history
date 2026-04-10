#!/bin/bash

# 璧山中学高2027届7班班史系统数据备份脚本
# 备份目录: /var/www/class-7-history/uploads 和 /var/www/class-7-history/data
# 备份目标: /var/beifen2/
# 时间: 每天 03:00

set -e

# 配置
PROJECT_DIR="/var/www/class-7-history"
BACKUP_DIR="/var/beifen2"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="class7_backup_${DATE}"
LOG_FILE="/var/log/class7-backup.log"

# 保留天数
KEEP_DAYS=30

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# 创建备份目录
mkdir -p "$BACKUP_DIR"

log "========== 开始备份 =========="
log "项目目录: $PROJECT_DIR"
log "目标目录: $BACKUP_DIR"

# 检查项目目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    log "错误: 项目目录不存在: $PROJECT_DIR"
    exit 1
fi

# 创建临时目录
TEMP_DIR="/tmp/class7_backup_${DATE}"
mkdir -p "$TEMP_DIR"

# 复制需要备份的文件
log "复制数据文件..."
if [ -d "$PROJECT_DIR/uploads" ]; then
    cp -r "$PROJECT_DIR/uploads" "$TEMP_DIR/"
    log "已复制: uploads/"
fi

if [ -d "$PROJECT_DIR/data" ]; then
    cp -r "$PROJECT_DIR/data" "$TEMP_DIR/"
    log "已复制: data/"
fi

# 创建备份
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
log "创建备份: ${BACKUP_PATH}.tar.gz"

# 使用tar压缩备份
if tar -czf "${BACKUP_PATH}.tar.gz" -C "$TEMP_DIR" . 2>> "$LOG_FILE"; then
    BACKUP_SIZE=$(du -h "${BACKUP_PATH}.tar.gz" | cut -f1)
    log "备份成功! 大小: ${BACKUP_SIZE}"
else
    log "错误: 备份失败!"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# 清理临时目录
rm -rf "$TEMP_DIR"

# 计算MD5校验
MD5=$(md5sum "${BACKUP_PATH}.tar.gz" | cut -d' ' -f1)
echo "$MD5  ${BACKUP_NAME}.tar.gz" > "${BACKUP_PATH}.md5"
log "MD5校验: $MD5"

# 清理旧备份
log "清理 ${KEEP_DAYS} 天前的旧备份..."
find "$BACKUP_DIR" -name "class7_backup_*.tar.gz" -type f -mtime +$KEEP_DAYS -delete 2>> "$LOG_FILE" || true
find "$BACKUP_DIR" -name "class7_backup_*.md5" -type f -mtime +$KEEP_DAYS -delete 2>> "$LOG_FILE" || true

# 统计当前备份数量
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "class7_backup_*.tar.gz" -type f | wc -l)
log "当前备份数量: ${BACKUP_COUNT}"

# 磁盘空间检查
DISK_USAGE=$(df -h "$BACKUP_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    log "警告: 磁盘使用率 ${DISK_USAGE}%，请及时清理!"
fi

log "========== 备份完成 =========="

exit 0
