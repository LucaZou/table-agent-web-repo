<template>
  <div class="home-container">
    <div class="github-corner">
      <a href="https://github.com/LucaZou/table-agent" target="_blank" rel="noopener noreferrer">
        <el-icon :size="30">
          <svg t="1639025732571" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2280" width="200" height="200"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.8-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z" p-id="2281" fill="#181818"></path></svg>
        </el-icon>
      </a>
    </div>
    <el-row justify="center">
      <el-col :span="18">
        <div class="header-container">
          <h1>AI表格处理工具</h1>
          <p>上传表格文件并使用AI智能处理和分析数据</p>
        </div>
        
        <el-card class="upload-card">
          <template #header>
            <div class="card-header">
              <h3>上传表格文件</h3>
              <p>支持 .csv, .xlsx, .xls 格式的表格文件</p>
            </div>
          </template>
          
          <el-upload
            class="upload-container"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            :limit="1"
            accept=".csv,.xlsx,.xls">
            <el-icon class="el-icon--upload">
              <Upload />
            </el-icon>
            <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">
                仅支持 .csv, .xlsx, .xls 格式的表格文件，最大支持100MB
              </div>
            </template>
          </el-upload>
          
          <div class="upload-actions" v-if="fileList.length > 0">
            <el-button type="primary" @click="uploadFile" :loading="uploading">
              上传文件
            </el-button>
            <el-button @click="resetFileList">
              重新选择
            </el-button>
          </div>
          
          <div class="upload-note" v-if="fileList.length > 0 && fileList[0].raw && fileList[0].raw.size > 10 * 1024 * 1024">
            <el-alert
              title="大文件提示"
              type="warning"
              :closable="false">
              <div>
                您正在上传较大的文件({{ (fileList[0].raw.size / (1024 * 1024)).toFixed(2) }}MB)，上传可能需要较长时间，请耐心等待。
              </div>
            </el-alert>
          </div>
        </el-card>
        
        <!-- 上传成功后显示的提示 -->
        <div class="success-container" v-if="uploadSuccess">
          <el-result
            icon="success"
            title="文件上传成功!"
            sub-title="您现在可以开始使用AI处理表格数据了">
            <template #extra>
              <el-button type="primary" @click="goToProcess">开始处理</el-button>
            </template>
          </el-result>
        </div>
      </el-col>
    </el-row>
    <div class="footer">
      <p>Copyright © 2025 AI表格处理工具. V1.0 </p>
      <p>备案号: 闽ICP备2025094858号-1</p>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { fileApi } from '@/api'

export default defineComponent({
  name: 'HomeView',
  components: {
    Upload
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    
    // 文件列表
    const fileList = ref([])
    
    // 上传状态
    const uploading = ref(false)
    
    // 上传成功状态
    const uploadSuccess = computed(() => !!store.getters.getCurrentFile)
    
    // 处理文件选择
    const handleFileChange = (file, files) => {
      fileList.value = files
    }
    
    // 上传文件
    const uploadFile = async () => {
      if (fileList.value.length === 0) {
        ElMessage.warning('请先选择文件')
        return
      }
      
      const file = fileList.value[0].raw
      
      // 验证文件类型
      const validTypes = ['.csv', '.xlsx', '.xls']
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      
      if (!validTypes.includes(fileExt)) {
        ElMessage.error('文件类型不支持，请上传.csv、.xlsx或.xls格式的文件')
        return
      }
      
      // 检查文件大小，最大允许100MB
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        ElMessage.error(`文件过大，最大允许100MB，当前文件大小${(file.size / (1024 * 1024)).toFixed(2)}MB`)
        return
      }
      
      // 创建FormData
      const formData = new FormData()
      formData.append('file', file)
      
      // 设置上传状态
      uploading.value = true
      
      try {
        // 调用上传API
        const response = await fileApi.uploadFile(formData)
        
        // 设置文件信息到Vuex
        store.dispatch('setCurrentFile', response)
        
        // 获取文件预览
        const previewResponse = await fileApi.getFilePreview(response.file_id)
        store.dispatch('setFilePreview', previewResponse)
        
        // 提示上传成功
        ElMessage.success('文件上传成功')
      } catch (error) {
        console.error('上传文件失败:', error)
        if (error.response && error.response.status === 413) {
          ElMessage.error('上传文件过大，请减小文件大小后重试')
        } else {
          ElMessage.error(`上传文件失败: ${error.message || '未知错误'}`)
        }
      } finally {
        uploading.value = false
      }
    }
    
    // 重置文件列表
    const resetFileList = () => {
      fileList.value = []
      store.dispatch('setCurrentFile', null)
      store.dispatch('setFilePreview', null)
    }
    
    // 跳转到处理页面
    const goToProcess = () => {
      const currentFile = store.getters.getCurrentFile
      if (currentFile) {
        router.push({ name: 'process', params: { fileId: currentFile.file_id } })
      }
    }
    
    return {
      fileList,
      uploading,
      uploadSuccess,
      handleFileChange,
      uploadFile,
      resetFileList,
      goToProcess
    }
  }
})
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 40px);
  position: relative;
}

.github-corner {
  position: absolute;
  top: 0;
  right: 0;
  padding: 20px;
  z-index: 999;
}

.github-corner a {
  color: #606266;
  transition: color 0.3s;
}

.github-corner a:hover {
  color: #409EFF;
}

.footer {
  text-align: center;
  padding: 20px 0;
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}

.footer p {
  margin: 5px 0;
}

.header-container {
  text-align: center;
  margin-bottom: 20px;
}

.header-container h1 {
  font-size: 2em;
  color: #409EFF;
  margin-bottom: 5px;
}

.header-container p {
  font-size: 1.1em;
  color: #606266;
}

.upload-card {
  margin-bottom: 20px;
}

.card-header {
  text-align: center;
}

.card-header h3 {
  margin-bottom: 5px;
}

.card-header p {
  color: #909399;
  font-size: 14px;
}

.upload-container {
  margin: 10px 0;
}

.upload-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.success-container {
  margin-top: 20px;
  position: sticky;
  bottom: 20px;
}
</style>