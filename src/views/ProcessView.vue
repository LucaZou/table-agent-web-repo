<template>
  <div class="process-container">
    <el-container class="layout-container">
      <!-- 顶部导航 -->
      <el-header height="60px">
        <div class="header-content">
          <div class="logo">
            <router-link to="/">AI表格处理工具</router-link>
          </div>
          <div class="actions">
            <el-button type="primary" @click="exportFile" :disabled="!hasProcessResult">
              导出文件
            </el-button>
            <el-button @click="backToHome">返回首页</el-button>
          </div>
        </div>
      </el-header>
      
      <!-- 主体内容 -->
      <el-container class="main-container">
        <!-- 左侧表格预览 -->
        <el-aside width="40%" class="aside-panel">
          <div class="panel-header">
            <h3>文件预览</h3>
            <p v-if="fileName">{{ fileName }}</p>
          </div>
          
          <div class="preview-content">
            <div v-if="filePreview" class="table-preview">
              <el-table :data="filePreview.data" border style="width: 100%" max-height="300">
                <el-table-column 
                  v-for="column in filePreview.columns" 
                  :key="column" 
                  :prop="column" 
                  :label="column" 
                  min-width="120">
                </el-table-column>
              </el-table>
              <div class="table-info">
                总行数: {{ filePreview.rows_count }} | 文件类型: {{ filePreview.file_type }}
              </div>
            </div>
            
            <!-- 结果预览 -->
            <div v-if="processResult" class="result-preview">
              <h4>处理结果预览</h4>
              <el-table 
                :data="processResult.preview" 
                border 
                style="width: 100%" 
                max-height="300">
                <el-table-column 
                  v-for="column in processResult.columns" 
                  :key="column" 
                  :prop="column" 
                  :label="column" 
                  min-width="120">
                </el-table-column>
              </el-table>
              <div class="table-info">
                总行数: {{ processResult.rows_count }}
              </div>
            </div>
            
            <div v-if="imageUrl" class="image-preview">
              <h4>图表预览</h4>
              <img :src="imageUrl" alt="数据可视化" class="preview-image" />
            </div>
          </div>
        </el-aside>
        
        <!-- 右侧聊天面板 -->
        <el-main class="chat-panel">
          <div class="chat-container">
            <div class="chat-header">
              <h3>AI助手</h3>
            </div>
            
            <div class="chat-messages" ref="chatMessagesRef">
              <!-- 系统提示消息 -->
              <div class="message system-message">
                <p>您好！我是AI表格处理助手。请告诉我您想要如何处理这份表格数据，比如筛选、排序、分组、计算或可视化等操作。</p>
              </div>
              
              <!-- 聊天历史 -->
              <div 
                v-for="(message, index) in chatHistory" 
                :key="index" 
                :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']">
                <div class="message-content">
                  <div v-if="message.role === 'assistant'" v-html="formatMessage(message.content)"></div>
                  <div v-else>{{ message.content }}</div>
                </div>
              </div>
            </div>
            
            <div class="chat-input">
              <el-input
                v-model="userMessage"
                type="textarea"
                :rows="3"
                placeholder="请输入您的表格处理需求..."
                :disabled="loading"
                @keydown.enter.ctrl="sendMessage"
              ></el-input>
              <div class="input-actions">
                <span class="hint">按 Ctrl+Enter 发送</span>
                <el-button 
                  type="primary" 
                  @click="sendMessage" 
                  :disabled="!userMessage.trim() || loading">
                  {{ loading ? '处理中...' : '发送' }}
                </el-button>
              </div>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fileApi, chatApi } from '@/api'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

export default defineComponent({
  name: 'ProcessView',
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  
  setup(props) {
    const store = useStore()
    const router = useRouter()
    
    // 引用聊天消息容器
    const chatMessagesRef = ref(null)
    
    // 用户消息
    const userMessage = ref('')
    
    // 加载状态
    const loading = computed(() => store.getters.isLoading)
    
    // 文件名
    const fileName = computed(() => {
      const file = store.getters.getCurrentFile
      return file ? file.original_filename : ''
    })
    
    // 文件预览
    const filePreview = computed(() => store.getters.getFilePreview)
    
    // 聊天历史
    const chatHistory = computed(() => store.getters.getChatHistory)
    
    // 处理结果
    const processResult = computed(() => store.getters.getProcessResult)
    
    // 图表URL
    const imageUrl = computed(() => store.getters.getImageUrl)
    
    // 是否有处理结果
    const hasProcessResult = computed(() => !!processResult.value)
    
    // 格式化消息，支持Markdown和代码高亮
    const formatMessage = (content) => {
      // 配置marked选项
      marked.setOptions({
        highlight: function(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-'
      });
      
      return marked(content);
    }
    
    // 滚动到最新消息
    const scrollToBottom = async () => {
      await nextTick()
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    }
    
    // 加载文件预览
    const loadFilePreview = async () => {
      // 如果Vuex中已有预览数据，则不重新加载
      if (filePreview.value) return
      
      store.dispatch('setLoading', true)
      
      try {
        const response = await fileApi.getFilePreview(props.fileId)
        store.dispatch('setFilePreview', response)
      } catch (error) {
        console.error('加载文件预览失败:', error)
        ElMessage.error(`加载文件预览失败: ${error.message || '未知错误'}`)
      } finally {
        store.dispatch('setLoading', false)
      }
    }
    
    // 发送消息
    const sendMessage = async () => {
      if (!userMessage.value.trim() || loading.value) return
      
      const message = userMessage.value.trim()
      
      // 添加用户消息到历史
      store.dispatch('addChatMessage', {
        role: 'user',
        content: message
      })
      
      // 清空输入框并滚动到底部
      userMessage.value = ''
      await scrollToBottom()
      
      // 设置加载状态
      store.dispatch('setLoading', true)
      
      try {
        // 调用API发送消息
        const response = await chatApi.sendMessage(
          props.fileId,
          message,
          chatHistory.value
        )
        
        // 添加AI响应到历史
        store.dispatch('addChatMessage', {
          role: 'assistant',
          content: response.response
        })
        
        // 如果有处理结果
        if (response.result) {
          store.dispatch('setProcessResult', response.result)
        }
        
        // 如果有图表
        if (response.image_url) {
          store.dispatch('setImageUrl', response.image_url)
        }
        
        // 滚动到底部
        await scrollToBottom()
      } catch (error) {
        console.error('发送消息失败:', error)
        ElMessage.error(`发送消息失败: ${error.message || '未知错误'}`)
      } finally {
        store.dispatch('setLoading', false)
      }
    }
    
    // 导出文件
    const exportFile = () => {
      fileApi.exportFile(props.fileId, fileName.value)
    }
    
    // 返回首页
    const backToHome = async () => {
      if (chatHistory.value.length > 0) {
        try {
          await ElMessageBox.confirm(
            '返回首页将丢失当前的处理结果，确定要返回吗？',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
        } catch (e) {
          return
        }
      }
      
      // 清除状态并跳转
      store.dispatch('clearChatHistory')
      router.push('/')
    }
    
    // 组件挂载时加载文件预览
    onMounted(() => {
      loadFilePreview()
    })
    
    // 监听消息变化，自动滚动到底部
    watch(chatHistory, () => {
      scrollToBottom()
    })
    
    return {
      chatMessagesRef,
      userMessage,
      loading,
      fileName,
      filePreview,
      chatHistory,
      processResult,
      imageUrl,
      hasProcessResult,
      formatMessage,
      sendMessage,
      exportFile,
      backToHome
    }
  }
})
</script>

<style scoped>
.process-container {
  height: 100vh;
}

.layout-container {
  height: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  font-size: 1.5em;
  font-weight: bold;
}

.logo a {
  color: var(--primary-color);
  text-decoration: none;
}

.main-container {
  height: calc(100% - 60px);
}

.aside-panel, .chat-panel {
  height: 100%;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.aside-panel {
  border-right: 1px solid var(--border-color);
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
}

.panel-header h3 {
  margin: 0 0 5px 0;
}

.panel-header p {
  margin: 0;
  color: var(--info-color);
}

.preview-content {
  padding: 15px;
  overflow: auto;
  flex-grow: 1;
}

.table-preview, .result-preview, .image-preview {
  margin-bottom: 20px;
}

.table-info {
  margin-top: 10px;
  color: var(--info-color);
  font-size: 14px;
}

.preview-image {
  max-width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
}

.chat-header h3 {
  margin: 0;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
}

.message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 6px;
  max-width: 80%;
}

.system-message {
  background-color: #f2f6fc;
  margin-left: auto;
  margin-right: auto;
  max-width: 90%;
  text-align: center;
}

.user-message {
  background-color: #ecf5ff;
  margin-left: auto;
}

.ai-message {
  background-color: #f5f7fa;
  margin-right: auto;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid var(--border-color);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.hint {
  color: var(--info-color);
  font-size: 13px;
}

/* 覆盖第三方样式 */
:deep(.el-header) {
  padding: 0 20px;
  background-color: #fff;
}

:deep(.el-aside) {
  background-color: #fff;
}

:deep(.el-main) {
  padding: 0;
  background-color: #fff;
}

:deep(.markdown-content) {
  line-height: 1.6;
}

:deep(.markdown-content pre) {
  margin: 10px 0;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  overflow-x: auto;
}

:deep(.markdown-content code) {
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
}
</style> 