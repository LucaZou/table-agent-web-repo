<template>
  <div class="home-container">
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
                仅支持 .csv, .xlsx, .xls 格式的表格文件
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
        ElMessage.error(`上传文件失败: ${error.message || '未知错误'}`)
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
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-container {
  text-align: center;
  margin-bottom: 30px;
}

.header-container h1 {
  font-size: 2.5em;
  color: #409EFF;
  margin-bottom: 10px;
}

.header-container p {
  font-size: 1.2em;
  color: #606266;
}

.upload-card {
  margin-bottom: 30px;
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
  margin: 20px 0;
}

.upload-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.success-container {
  margin-top: 30px;
}
</style> 