# Table Processor 前端项目

这是一个基于Vue.js 3构建的前端应用程序，用于表格数据处理和展示。

## 技术栈

- Vue.js 3
- Vuex 4 (状态管理)
- Vue Router 4 (路由管理)
- Element Plus (UI组件库)
- Axios (HTTP客户端)
- Marked (Markdown解析)
- Highlight.js (代码高亮)

## 安装指南

### 前置条件

- Node.js (推荐v14.0.0及以上)
- npm (包管理器)

### 安装依赖

```bash
# 进入项目目录
cd frontend

# 安装依赖
npm install
```

## 开发指南

### 开发环境启动

```bash
# 启动开发服务器
npm run serve
```

开发服务器默认运行在 http://localhost:8080，并已配置了API代理，将自动将请求转发到后端（默认配置为http://localhost:8000）。

### 项目结构

```
frontend/
├── public/            # 静态资源目录
├── src/               # 源代码目录
│   ├── api/           # API请求接口
│   ├── assets/        # 资源文件（图片、样式等）
│   ├── components/    # 公共组件
│   ├── router/        # 路由配置
│   ├── store/         # Vuex状态管理
│   ├── views/         # 页面视图组件
│   ├── App.vue        # 主应用组件
│   └── main.js        # 应用入口文件
├── .eslintrc.js       # ESLint配置
├── babel.config.js    # Babel配置
├── package.json       # 依赖管理
└── vue.config.js      # Vue配置文件
```

## 部署指南

### 构建生产环境代码

```bash
# 构建生产环境代码
npm run build
```

这会在 `dist/` 目录下生成优化过的静态文件，可用于部署到生产环境。

### 部署选项

#### 1. 静态文件服务器

将 `dist/` 目录下的文件部署到任何静态文件服务器（如Nginx、Apache等）即可。

Nginx配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理配置
    location /api/ {
        proxy_pass http://your-backend-server:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 2. Docker部署

可以使用以下Dockerfile在Docker容器中部署前端：

```dockerfile
FROM node:14 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

创建`nginx.conf`文件:

```
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

构建和运行Docker容器：

```bash
# 构建镜像
docker build -t table-processor-frontend .

# 运行容器
docker run -d -p 80:80 --name frontend table-processor-frontend
```

## 环境变量配置

可以通过创建`.env`文件来配置环境变量：

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

示例配置：

```
VUE_APP_API_URL=http://api.example.com
VUE_APP_TITLE=Table Processor
```

## 常见问题

### 跨域问题

如果遇到跨域问题，请确保：

1. 在开发环境中，已在`vue.config.js`配置了代理
2. 在生产环境中，后端已配置CORS或使用适当的代理转发请求

### 构建优化

如需进一步优化构建结果，可以：

1. 在`vue.config.js`中配置分包策略
2. 使用CDN加载第三方库
3. 配置懒加载路由 