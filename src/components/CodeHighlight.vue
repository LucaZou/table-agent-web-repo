<template>
  <div class="code-highlight">
    <pre><code :class="language" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

export default defineComponent({
  name: 'CodeHighlight',
  props: {
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      default: 'python'
    }
  },
  
  setup(props) {
    const highlightedCode = computed(() => {
      try {
        return hljs.highlight(props.code, { language: props.language }).value
      } catch (e) {
        console.error('代码高亮失败:', e)
        return props.code
      }
    })
    
    return {
      highlightedCode
    }
  }
})
</script>

<style scoped>
.code-highlight {
  margin: 10px 0;
}

pre {
  margin: 0;
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.4;
}
</style> 