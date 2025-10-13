#!/bin/bash

# 清境智能考试系统部署脚本
# 按照推荐的目录结构自动部署项目

# 配置项
APP_NAME="exam"
DEPLOY_DIR="/var/www/$APP_NAME"
RELEASES_DIR="$DEPLOY_DIR/releases"
SHARED_DIR="$DEPLOY_DIR/shared"
CURRENT_LINK="$DEPLOY_DIR/current"
BACKUPS_DIR="$DEPLOY_DIR/backups"
LOG_DIR="$SHARED_DIR/logs"
CONFIG_DIR="$SHARED_DIR/config"

# 定义颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否以root权限运行
if [ "$(id -u)" != "0" ]; then
   echo -e "${RED}此脚本需要以root权限运行${NC}"
   echo -e "请使用: sudo ./deploy.sh"
   exit 1
fi

# 显示帮助信息
show_help() {
    echo "清境智能考试系统部署脚本"
    echo ""
    echo "用法: sudo ./deploy.sh [选项]"
    echo ""
    echo "选项:"
    echo "  --help             显示此帮助信息"
    echo "  --init             初始化部署环境（创建目录结构）"
    echo "  --deploy           部署新版本（默认选项）"
    echo "  --rollback         回滚到上一个版本"
    echo "  --clean            清理旧版本（保留最近3个版本）"
    echo ""
}

# 初始化部署环境
init_environment() {
    echo -e "${GREEN}正在初始化部署环境...${NC}"
    
    # 创建目录结构
    mkdir -p $RELEASES_DIR
    mkdir -p $LOG_DIR
    mkdir -p $CONFIG_DIR
    mkdir -p $BACKUPS_DIR
    
    # 设置权限
    echo -e "${YELLOW}设置目录权限...${NC}"
    chown -R www-data:www-data $DEPLOY_DIR
    chmod -R 755 $DEPLOY_DIR
    chmod -R 775 $LOG_DIR
    
    echo -e "${GREEN}部署环境初始化完成！${NC}"
    echo -e "目录结构已创建在: $DEPLOY_DIR"
}

# 部署新版本
deploy_new_version() {
    # 检查是否在项目根目录
    if [ ! -f "package.json" ]; then
        echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
        exit 1
    fi
    
    # 获取当前日期和时间，用于版本号
    VERSION=$(date +"%Y%m%d_%H%M%S")
    RELEASE_DIR="$RELEASES_DIR/$VERSION"
    
    echo -e "${GREEN}开始部署新版本: $VERSION${NC}"
    
    # 安装依赖
    # echo -e "${YELLOW}安装依赖...${NC}"
    # npm install --production
    # if [ $? -ne 0 ]; then
    #     echo -e "${RED}依赖安装失败，请检查错误信息${NC}"
    #     exit 1
    # fi
    
    # 构建项目
    echo -e "${YELLOW}构建项目...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}项目构建失败，请检查错误信息${NC}"
        exit 1
    fi
    
    # 创建新版本目录
    echo -e "${YELLOW}创建新版本目录...${NC}"
    mkdir -p $RELEASE_DIR
    
    # 复制构建文件
    echo -e "${YELLOW}复制构建文件到服务器...${NC}"
    cp -r dist/* $RELEASE_DIR
    
    # 更新符号链接
    # echo -e "${YELLOW}更新符号链接...${NC}"
    # if [ -L $CURRENT_LINK ]; then
    #     rm $CURRENT_LINK
    # fi
    # ln -s $RELEASE_DIR $CURRENT_LINK
    
    # 设置权限
    # echo -e "${YELLOW}设置文件权限...${NC}"
    # chown -R www-data:www-data $RELEASE_DIR
    # chmod -R 755 $RELEASE_DIR
    
    # 重启Nginx
    # echo -e "${YELLOW}重启Nginx服务...${NC}"
    # systemctl restart nginx
    # if [ $? -ne 0 ]; then
    #     echo -e "${RED}Nginx重启失败，请手动检查服务状态${NC}"
    # fi
    
    echo -e "${GREEN}新版本部署成功！${NC}"
    echo -e "当前版本: $VERSION"
    echo -e "访问地址: http://您的服务器IP或域名"
}

# 回滚到上一个版本
rollback_version() {
    echo -e "${GREEN}开始回滚到上一个版本...${NC}"
    
    # 获取所有版本并排序
    VERSIONS=($(ls -1 $RELEASES_DIR | sort))
    VERSION_COUNT=${#VERSIONS[@]}
    
    if [ $VERSION_COUNT -lt 2 ]; then
        echo -e "${RED}错误: 没有足够的版本可供回滚${NC}"
        echo -e "当前只有 $VERSION_COUNT 个版本"
        exit 1
    fi
    
    # 获取当前版本
    CURRENT_VERSION=$(readlink -f $CURRENT_LINK | xargs basename)
    
    # 查找上一个版本的索引
    CURRENT_INDEX=-1
    for i in "${!VERSIONS[@]}"; do
        if [ "${VERSIONS[$i]}" = "$CURRENT_VERSION" ]; then
            CURRENT_INDEX=$i
            break
        fi
    done
    
    # 计算上一个版本
    if [ $CURRENT_INDEX -gt 0 ]; then
        PREVIOUS_INDEX=$((CURRENT_INDEX - 1))
        PREVIOUS_VERSION=${VERSIONS[$PREVIOUS_INDEX]}
    else
        # 如果当前是第一个版本，则回滚到最后一个版本
        PREVIOUS_VERSION=${VERSIONS[$((VERSION_COUNT - 1))]}
    fi
    
    echo -e "${YELLOW}当前版本: $CURRENT_VERSION${NC}"
    echo -e "${YELLOW}回滚到版本: $PREVIOUS_VERSION${NC}"
    
    # 更新符号链接
    rm $CURRENT_LINK
    ln -s $RELEASES_DIR/$PREVIOUS_VERSION $CURRENT_LINK
    
    # 重启Nginx
    systemctl restart nginx
    if [ $? -ne 0 ]; then
        echo -e "${RED}Nginx重启失败，请手动检查服务状态${NC}"
    fi
    
    echo -e "${GREEN}回滚成功！${NC}"
    echo -e "当前版本: $PREVIOUS_VERSION"
}

# 清理旧版本
clean_old_versions() {
    echo -e "${GREEN}开始清理旧版本...${NC}"
    
    # 获取所有版本并排序
    VERSIONS=($(ls -1 $RELEASES_DIR | sort))
    VERSION_COUNT=${#VERSIONS[@]}
    KEEP_COUNT=3  # 保留的版本数量
    
    if [ $VERSION_COUNT -le $KEEP_COUNT ]; then
        echo -e "${YELLOW}版本数量不足 $KEEP_COUNT 个，无需清理${NC}"
        exit 0
    fi
    
    # 计算需要删除的版本数量
    DELETE_COUNT=$((VERSION_COUNT - KEEP_COUNT))
    
    echo -e "${YELLOW}当前有 $VERSION_COUNT 个版本，保留最新的 $KEEP_COUNT 个版本${NC}"
    
    # 删除旧版本
    for ((i=0; i<$DELETE_COUNT; i++)); do
        VERSION_TO_DELETE=${VERSIONS[$i]}
        echo -e "${YELLOW}删除版本: $VERSION_TO_DELETE${NC}"
        rm -rf $RELEASES_DIR/$VERSION_TO_DELETE
    done
    
    echo -e "${GREEN}旧版本清理完成！${NC}"
    echo -e "已删除 $DELETE_COUNT 个旧版本"
}

# 根据参数执行不同的操作
case "$1" in
    --help)
        show_help
        ;;
    --init)
        init_environment
        ;;
    --deploy)
        deploy_new_version
        ;;
    --rollback)
        rollback_version
        ;;
    --clean)
        clean_old_versions
        ;;
    *)
        # 默认执行部署操作
        deploy_new_version
        ;;
esac

# 恢复终端颜色
echo -e "${NC}"