FROM node:16-alpine as build

WORKDIR /app

# 设置npm淘宝镜像源
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制源代码并构建
COPY . .
RUN npm run build

# 生产环境阶段
FROM nginx:alpine

# 复制构建文件到Nginx服务目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 安装工具
RUN apk add --no-cache wget curl

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --no-check-certificate --spider https://localhost/ || exit 1

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"] 