# 清境智能考试系统部署指南

本指南将帮助您部署基于React + Vite开发的清境智能考试系统，特别注意本项目使用的是React Router的History模式。

## 系统要求

- Node.js 16+（用于构建项目）
- Nginx（用于服务器部署）
- 后端API服务（地址：http://192.168.18.137:8080/api）

## 部署流程

### 步骤一：构建项目

1. 克隆项目代码到本地或服务器：
   ```bash
   git clone <项目仓库地址>
   cd exam
   ```

2. 安装依赖包：
   ```bash
   npm install
   ```

3. 构建生产版本：
   ```bash
   npm run build
   ```

   构建成功后，会在项目根目录生成一个 `dist` 文件夹，包含所有编译后的静态文件。

### 步骤二：配置Nginx

1. 在项目根目录中已经为您创建了 `exam.conf` 文件，这是一个适合History模式的Nginx配置文件。

2. 根据您的服务器环境修改配置文件中的以下内容：
   - `server_name`：
     - 如果有域名：替换为您的域名（如 `exam.yourdomain.com`）
     - 如果没有域名：可以使用下划线 `_` 作为默认服务器，或使用服务器IP地址
   - `root`：替换为实际的部署路径，指向构建后的 `dist` 目录
   - 确保API代理配置与您的后端服务匹配

3. 无域名情况下的配置说明：
   - 使用 `server_name _;` 配置：Nginx会将此服务器块作为默认服务器，处理所有未匹配到其他server_name的请求
   - 使用IP地址配置：如 `server_name 192.168.x.x;`，可以直接通过IP地址访问应用
   - 通过IP地址访问时，URL格式为：`http://服务器IP地址:80`

4. 将配置文件复制到Nginx配置目录：
   ```bash
   sudo cp exam.conf /etc/nginx/conf.d/
   ```

5. 检查Nginx配置是否正确：
   ```bash
   sudo nginx -t
   ```

6. 重启Nginx服务以应用新配置：
   ```bash
   sudo systemctl restart nginx
   ```

### 步骤三：处理History路由模式

项目使用了React Router的History模式，这意味着：

- 用户可以通过直接访问URL路径来导航到不同页面
- 刷新页面时，需要确保服务器能正确处理请求

`exam.conf` 文件中已经包含了处理History模式的关键配置：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

这个配置确保了当请求的文件不存在时，服务器会返回 `index.html`，让React Router来处理路由，从而避免404错误。

### 步骤四：验证部署

部署完成后，打开浏览器访问您配置的域名，验证：

1. 系统能够正常加载
2. 页面可以正常导航
3. 刷新页面不会出现404错误
4. API请求能够正常发送和接收数据

## 高级配置

### 启用HTTPS

为了提升安全性，建议为您的网站启用HTTPS：

1. 获取SSL证书（可以使用Let's Encrypt等免费服务）
2. 修改Nginx配置文件，添加HTTPS支持：

```nginx
server {
    listen 443 ssl;
    server_name exam.yourdomain.com;
    
    ssl_certificate /path/to/your/certificate.pem;
    ssl_certificate_key /path/to/your/private.key;
    
    # 其他配置保持不变...
}

# 重定向HTTP到HTTPS
server {
    listen 80;
    server_name exam.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### 性能优化

1. **代码分割与动态导入**

   项目已经配置了基本的依赖包分割，但仍有部分chunk体积较大。为进一步优化，建议实现组件级别的代码分割：
   
   ```javascript
   // 使用动态导入优化大型组件加载
   import { lazy, Suspense } from 'react';
   import { Spin } from 'antd';
   
   // 动态导入大型组件
   const LargeComponent = lazy(() => import('./components/LargeComponent'));
   
   // 在路由中使用
   const App = () => {
     return (
       <Suspense fallback={<Spin size="large" />}>
         {/* 路由组件 */}
       </Suspense>
     );
   };
   ```
   
   建议对以下大型页面组件实施动态导入：
   - 考试管理页面
   - 题库管理页面
   - 数据分析页面

2. 压缩静态资源：
   ```nginx
gzip on;
gzip_types text/plain text/css application/javascript image/svg+xml;
gzip_proxied any;
gzip_comp_level 5;
gzip_vary on;
```

3. 配置更强的缓存策略：
   ```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|webp)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
    access_log off;
}
```

4. **按需加载第三方库**

   对于体积较大的第三方库，如antd，可以考虑使用按需导入来减少打包体积：
   
   ```javascript
   // 推荐：按需导入antd组件
   import Button from 'antd/es/button';
   import 'antd/es/button/style';
   
   // 或者使用babel-plugin-import插件自动按需导入
   import { Button } from 'antd';
   ```

## SSH上传打包文件指南

### 获取构建后的dist目录文件

在使用SSH上传文件之前，您需要先在本地构建项目生成dist目录。以下是获取dist目录的步骤：

1. **确保您在项目根目录**：
   ```bash
   cd /Users/liujian/Desktop/app/exam/
   ```

2. **安装项目依赖**（如果尚未安装）：
   ```bash
   npm install
   ```

3. **构建项目**：
   ```bash
   npm run build
   ```

4. **验证构建结果**：
   构建完成后，会在项目根目录生成一个`dist`文件夹，包含所有需要上传的静态文件。
   ```bash
   ls -la dist/
   ```

### 使用SSH上传文件

如果您需要手动将打包文件上传到服务器，可以使用SSH相关命令进行文件传输。以下是常用的操作方法：

### 使用SCP命令上传文件

SCP（Secure Copy Protocol）是一种安全的文件传输协议，可以在本地和远程服务器之间复制文件。

#### 基本语法
```bash
scp [选项] 源文件 目标路径
```

#### 常用选项
- `-r`: 递归复制目录
- `-P`: 指定SSH端口（默认为22）
- `-v`: 显示详细传输过程
- `-p`: 保留原始文件的修改时间和权限

#### 上传构建文件示例

1. **上传完整的dist目录**：
```bash
scp -r dist/* 用户名@服务器IP:/var/www/exam/current/dist/
```

2. **指定SSH端口**：
```bash
scp -r -P 2222 dist/* 用户名@服务器IP:/var/www/exam/current/dist/
```

3. **上传压缩包**（如果您先压缩了文件）：
```bash
# 先压缩
zip -r dist.zip dist/
# 再上传
scp dist.zip 用户名@服务器IP:/var/www/exam/temp/
# 然后在服务器上解压
# ssh 用户名@服务器IP "unzip /var/www/exam/temp/dist.zip -d /var/www/exam/current/"
```

### 使用Rsync命令同步文件

Rsync是一种更高效的文件同步工具，特别适合增量更新，只传输变化的文件。

#### 基本语法
```bash
rsync [选项] 源文件 目标路径
```

#### 常用选项
- `-a`: 归档模式，递归并保留几乎所有文件属性
- `-v`: 显示详细输出
- `-z`: 压缩传输数据
- `--delete`: 删除目标路径中源路径不存在的文件

#### 同步构建文件示例

1. **同步dist目录**：
```bash
rsync -avz dist/* 用户名@服务器IP:/var/www/exam/current/dist/
```

2. **同步并删除多余文件**：
```bash
rsync -avz --delete dist/* 用户名@服务器IP:/var/www/exam/current/dist/
```

### 配置SSH密钥登录

为了避免每次上传都输入密码，可以配置SSH密钥登录。以下是详细的步骤：

#### 1. 检查是否已有SSH密钥

首先检查是否已经存在SSH密钥对：
```bash
ls -la ~/.ssh/
```

如果看到`id_rsa.pub`或`id_ecdsa.pub`或`id_ed25519.pub`文件，表示您已经有SSH密钥了。

#### 2. 生成新的SSH密钥对

如果没有SSH密钥，或者想生成新的密钥，可以使用以下命令：

**使用RSA算法（最常用）**：
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

**使用更安全的Ed25519算法**（推荐，需要较新的SSH版本）：
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

执行命令后，会出现提示：
- 输入密钥保存位置：默认是`~/.ssh/id_rsa`或`~/.ssh/id_ed25519`，按回车使用默认位置
- 输入密码短语（可选但推荐）：用于加密私钥，增强安全性

#### 3. 查看和复制公钥内容

生成密钥后，可以使用以下命令查看公钥内容：
```bash
cat ~/.ssh/id_rsa.pub
# 或如果使用Ed25519算法
cat ~/.ssh/id_ed25519.pub
```

复制输出的全部内容，包括`ssh-rsa`或`ssh-ed25519`开头的部分。

#### 4. 将公钥添加到服务器

有几种方法可以将公钥添加到服务器：

**方法一：使用ssh-copy-id命令（最简便）**
```bash
# 对于RSA密钥
ssh-copy-id -i ~/.ssh/id_rsa.pub 用户名@服务器IP

# 对于Ed25519密钥
ssh-copy-id -i ~/.ssh/id_ed25519.pub 用户名@服务器IP

# 如果SSH端口不是默认的22
ssh-copy-id -i ~/.ssh/id_rsa.pub -p 端口号 用户名@服务器IP
```

**方法二：手动添加公钥**
如果`ssh-copy-id`命令不可用，可以手动添加：
```bash
# 将公钥内容复制到剪贴板，然后连接到服务器
ssh 用户名@服务器IP

# 在服务器上创建.ssh目录（如果不存在）
mkdir -p ~/.ssh && chmod 700 ~/.ssh

# 编辑authorized_keys文件，粘贴公钥内容
nano ~/.ssh/authorized_keys

# 设置正确的权限
chmod 600 ~/.ssh/authorized_keys

# 退出服务器
exit
```

#### 5. 测试SSH密钥连接

完成后，可以测试是否能够无需密码连接到服务器：
```bash
ssh 用户名@服务器IP
```

如果设置了密码短语，第一次连接时会要求输入密码短语。

#### 6. 配置SSH客户端（可选）

为了更方便地管理多个SSH连接，可以在本地创建或编辑`~/.ssh/config`文件：
```bash
nano ~/.ssh/config
```

添加以下内容（根据实际情况修改）：
```
Host exam-server
  HostName 服务器IP或域名
  User 用户名
  Port 22  # 如果不是默认端口
  IdentityFile ~/.ssh/id_rsa  # 私钥文件路径
```

保存后，可以使用更简单的命令连接：
```bash
ssh exam-server
```

#### 7. 现在可以直接使用SCP或Rsync而无需输入密码
```bash
scp -r dist/* 用户名@服务器IP:/var/www/exam/current/dist/
# 或者使用配置的主机名
scp -r dist/* exam-server:/var/www/exam/current/dist/
```

### 注意事项

1. 确保服务器上的目标目录已存在，必要时先创建：
   ```bash
   ssh 用户名@服务器IP "mkdir -p /var/www/exam/current/dist/"
   ```

2. 上传后检查文件权限是否正确：
   ```bash
   ssh 用户名@服务器IP "chown -R www-data:www-data /var/www/exam/current/dist/ && chmod -R 755 /var/www/exam/current/dist/"
   ```

3. 对于大型项目，Rsync通常比SCP更高效，尤其是增量更新时

4. 上传完成后，建议重启Nginx服务使更改生效：
   ```bash
   ssh 用户名@服务器IP "sudo systemctl restart nginx"
   ```

## 自动化部署脚本

项目根目录中包含一个`deploy.sh`脚本，可帮助您按照推荐的目录结构自动完成部署过程，包括环境初始化、版本部署、回滚和版本清理等功能。

### 脚本功能

- **环境初始化**：创建推荐的目录结构并设置正确的权限
- **版本部署**：自动安装依赖、构建项目并部署新版本
- **版本回滚**：快速回滚到上一个稳定版本
- **版本清理**：自动清理旧版本，保留最近的几个版本

### 使用方法

1. **为脚本添加执行权限**（已完成）：
   ```bash
   sudo chmod +x deploy.sh
   ```

2. **初始化部署环境**：
   ```bash
   sudo ./deploy.sh --init
   ```
   此命令会在`/var/www/exam/`目录下创建推荐的目录结构。

3. **部署新版本**（默认功能）：
   ```bash
   sudo ./deploy.sh --deploy
   # 或直接执行
   sudo ./deploy.sh
   ```
   此命令会自动安装依赖、构建项目，并将新版本部署到服务器上。

4. **回滚到上一个版本**：
   ```bash
   sudo ./deploy.sh --rollback
   ```
   当新版本出现问题时，可以使用此命令快速回滚到上一个稳定版本。

5. **清理旧版本**：
   ```bash
   sudo ./deploy.sh --clean
   ```
   此命令会清理旧版本，默认保留最近3个版本。

6. **查看帮助信息**：
   ```bash
   sudo ./deploy.sh --help
   ```

### 脚本优势

- **版本管理**：每个版本独立存放，便于追踪和回滚
- **自动化流程**：减少人工操作，降低出错风险
- **权限管理**：自动设置正确的文件权限
- **服务重启**：自动重启Nginx服务应用更改

## 服务器部署目录结构建议

为了便于管理部署文件，建议按照以下标准目录结构组织您的服务器文件：

### 推荐的部署路径

```
# 项目根目录
/var/www/exam/
├── current/       # 当前运行版本（符号链接指向最新版本）
├── releases/      # 历史版本目录
│   ├── 20231201_1/ # 按日期和版本号命名的历史版本
│   └── 20231210_2/
├── shared/        # 共享资源（配置文件、日志等）
│   ├── logs/      # 应用日志
│   └── config/    # 环境配置文件
└── backups/       # 备份文件
```

### 部署位置说明

1. **主部署目录**：
   - 推荐放在`/var/www/exam/current/`（通过符号链接指向具体版本）
   - 或直接使用`/var/www/exam/`作为部署目录
   - 避免放在`/root/`或`/home/`等用户目录下，确保服务独立性

2. **文件权限设置**：
   ```bash
   # 设置Nginx用户（通常是www-data或nginx）为文件所有者
   sudo chown -R www-data:www-data /var/www/exam/
   
   # 设置适当的文件权限
   sudo chmod -R 755 /var/www/exam/
   sudo chmod -R 775 /var/www/exam/shared/logs/
   ```

3. **版本管理**：
   - 使用符号链接方式管理不同版本，便于回滚
   - 定期清理旧版本，只保留最近几个版本
   - 实现自动化部署脚本，简化版本切换

## Nginx配置详解

### root指令的作用域说明

在Nginx配置中，`root`指令的作用域和继承机制如下：

1. **基本原理**：
   - 在`server`块中设置的`root`指令会成为该服务器块下所有未指定`root`的`location`块的默认根目录
   - 这意味着第15行设置的`root /home/lj/exam/dist;`会被后续所有未单独指定`root`的`location`块继承使用

2. **在本配置中的应用**：
   - `location /api`块：由于该块处理的是代理请求（使用`proxy_pass`），不需要访问本地文件系统，所以没有使用`root`指令
   - `location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|webp)$`块：处理静态资源，会继承使用`server`块中设置的`root`目录
   - `location /`块：处理主路由，同样会继承使用`server`块中设置的`root`目录，通过`try_files $uri $uri/ /index.html;`指令查找文件

3. **覆盖root设置**：
   - 如果需要在特定`location`块中使用不同的根目录，可以在该块内重新设置`root`指令
   - 例如：配置文件中注释掉的`location = /50x.html`块就设置了不同的root路径`/usr/share/nginx/html`

### Nginx安装指南

以下是在不同Linux发行版上安装Nginx的详细步骤：

### 在Ubuntu/Debian系统上安装Nginx

1. **更新软件包列表**：
   ```bash
   sudo apt update
   ```

2. **安装Nginx**：
   ```bash
   sudo apt install nginx -y
   ```

3. **验证安装**：
   ```bash
   nginx -v
   ```
   应该显示Nginx的版本信息。

4. **配置防火墙（如果启用）**：
   ```bash
   sudo ufw allow 'Nginx HTTP'
   sudo ufw allow 'Nginx HTTPS'  # 如果需要HTTPS
   sudo ufw reload
   ```

### 在CentOS/RHEL系统上安装Nginx

1. **安装EPEL仓库**（Nginx不在默认仓库中）：
   ```bash
   sudo yum install epel-release -y
   ```

2. **安装Nginx**：
   ```bash
   sudo yum install nginx -y
   ```

3. **验证安装**：
   ```bash
   nginx -v
   ```

4. **配置防火墙（如果启用）**：
   ```bash
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --permanent --add-service=https  # 如果需要HTTPS
   sudo firewall-cmd --reload
   ```

### 启动Nginx并设置开机自启

**对于Ubuntu/Debian/CentOS 7+/RHEL 7+**：

1. **启动Nginx服务**：
   ```bash
   sudo systemctl start nginx
   ```

2. **设置开机自启**：
   ```bash
   sudo systemctl enable nginx
   ```

3. **检查Nginx服务状态**：
   ```bash
   sudo systemctl status nginx
   ```

**对于较旧的CentOS 6/RHEL 6系统**：

1. **启动Nginx服务**：
   ```bash
   sudo service nginx start
   ```

2. **设置开机自启**：
   ```bash
   sudo chkconfig nginx on
   ```

### Nginx基本命令

```bash
# 启动Nginx
sudo systemctl start nginx

# 停止Nginx
sudo systemctl stop nginx

# 重启Nginx（适用于配置更改后）
sudo systemctl restart nginx

# 重新加载Nginx配置（不中断服务）
sudo systemctl reload nginx

# 查看Nginx状态
sudo systemctl status nginx

# 检查Nginx配置是否正确
sudo nginx -t
```

### 验证Nginx安装

安装完成后，可以通过浏览器访问服务器的IP地址，如果看到"Welcome to Nginx"页面，则表示Nginx安装成功。

```bash
# 查看服务器IP地址
curl ifconfig.me
# 或
ip addr show
```

然后在浏览器中输入：`http://服务器IP地址`

## 故障排查

如果遇到问题，请检查：

1. Nginx错误日志：`/var/log/nginx/exam_error.log`
2. 确保构建后的文件权限正确
3. 检查API代理配置是否正确
4. 确认后端服务是否正常运行

## 部署脚本（可选）

为了简化部署过程，您可以创建一个部署脚本 `deploy.sh`：

```bash
#!/bin/bash

# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 构建项目
npm run build

# 复制构建文件到部署目录（根据实际情况修改路径）
sudo cp -r dist/* /var/www/exam/

sudo chown -R www-data:www-data /var/www/exam/

echo "部署成功！"
```

使用方法：`chmod +x deploy.sh && ./deploy.sh`

---

祝您部署顺利！如有任何问题，请联系技术支持。