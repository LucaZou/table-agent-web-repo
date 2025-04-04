import { createStore } from 'vuex'

export default createStore({
  state: {
    // 当前上传的文件信息
    currentFile: null,
    // 文件预览数据
    filePreview: null,
    // 聊天历史
    chatHistory: [],
    // 处理结果
    processResult: null,
    // 图表URL
    imageUrl: null,
    // 正在加载状态
    loading: false
  },
  getters: {
    // 获取当前文件信息
    getCurrentFile: (state) => state.currentFile,
    // 获取文件预览数据
    getFilePreview: (state) => state.filePreview,
    // 获取聊天历史
    getChatHistory: (state) => state.chatHistory,
    // 获取处理结果
    getProcessResult: (state) => state.processResult,
    // 获取图表URL
    getImageUrl: (state) => state.imageUrl,
    // 获取加载状态
    isLoading: (state) => state.loading
  },
  mutations: {
    // 设置当前文件
    SET_CURRENT_FILE(state, file) {
      state.currentFile = file
    },
    // 设置文件预览数据
    SET_FILE_PREVIEW(state, preview) {
      state.filePreview = preview
    },
    // 添加聊天消息
    ADD_CHAT_MESSAGE(state, message) {
      state.chatHistory.push(message)
    },
    // 清除聊天历史
    CLEAR_CHAT_HISTORY(state) {
      state.chatHistory = []
    },
    // 设置处理结果
    SET_PROCESS_RESULT(state, result) {
      state.processResult = result
    },
    // 设置图表URL
    SET_IMAGE_URL(state, url) {
      state.imageUrl = url
    },
    // 设置加载状态
    SET_LOADING(state, status) {
      state.loading = status
    }
  },
  actions: {
    // 异步设置当前文件
    setCurrentFile({ commit }, file) {
      commit('SET_CURRENT_FILE', file)
    },
    // 异步设置文件预览
    setFilePreview({ commit }, preview) {
      commit('SET_FILE_PREVIEW', preview)
    },
    // 异步添加聊天消息
    addChatMessage({ commit }, message) {
      commit('ADD_CHAT_MESSAGE', message)
    },
    // 异步清除聊天历史
    clearChatHistory({ commit }) {
      commit('CLEAR_CHAT_HISTORY')
    },
    // 异步设置处理结果
    setProcessResult({ commit }, result) {
      commit('SET_PROCESS_RESULT', result)
    },
    // 异步设置图表URL
    setImageUrl({ commit }, url) {
      commit('SET_IMAGE_URL', url)
    },
    // 异步设置加载状态
    setLoading({ commit }, status) {
      commit('SET_LOADING', status)
    }
  },
  modules: {
    // 如果需要，可以添加模块
  }
}) 