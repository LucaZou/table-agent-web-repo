import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/styles/main.css'

// 防抖工具函数
function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 重写 ResizeObserver，使用防抖版本
const OriginalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class DebouncedResizeObserver extends OriginalResizeObserver {
  constructor(callback) {
    super(debounce(callback, 100)); // 100ms 防抖
  }
};

// 现有错误处理器
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('ResizeObserver')) {
    event.stopPropagation();
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) {
    event.stopPropagation();
    event.preventDefault();
  }
});

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(store)
   .use(router)
   .use(ElementPlus, {
     locale: zhCn,
     size: 'default'
   })
   .mount('#app')
   