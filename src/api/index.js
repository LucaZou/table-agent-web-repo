import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/',
  timeout: 300000  // 增加到5分钟
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 在请求发送前做一些处理
    return config
  },
  error => {
    // 处理请求错误
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 处理响应数据
    return response.data
  },
  error => {
    // 处理响应错误
    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

// 文件相关API
export const fileApi = {
  // 上传文件
  uploadFile(formData) {
    return api.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 获取文件预览
  getFilePreview(fileId, rows = 20) {
    return api.get(`/api/files/preview/${fileId}`, {
      params: { rows }
    })
  },
  
  // 导出文件
  exportFile(fileId, filename) {
    const url = `/api/files/export/${fileId}${filename ? `?filename=${encodeURIComponent(filename)}` : ''}`
    // 使用浏览器下载
    window.open(url, '_blank')
    return Promise.resolve({ success: true })
  },
  
  // 删除文件
  deleteFile(fileId) {
    return api.delete(`/api/files/${fileId}`)
  }
}

// 聊天相关API
export const chatApi = {
  // 发送聊天消息
  sendMessage(fileId, message, history = []) {
    return api.post(`/api/chat/${fileId}`, {
      message,
      history
    })
  }
}

export default {
  fileApi,
  chatApi
}