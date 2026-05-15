---
title: Vue 3 Composition API 实践指南
description: 深入理解 Vue 3 Composition API，掌握 setup、ref、reactive 等核心概念
categories:
  - 前端学习笔记
tags:
  - Vue
  - TypeScript
  - Composition API
  - 前端
outline: [2,3]
date: 2025-06-20
---

# Vue 3 Composition API 实践指南

> Composition API 是 Vue 3 最重要的新特性，它让代码组织更灵活、逻辑复用更简单、TypeScript 支持更友好。

<!-- more -->

## 一、Options API vs Composition API

### 1.1 Options API 的局限

```vue
<!-- Options API：逻辑分散在不同选项中 -->
<script>
export default {
  data() {
    return {
      count: 0,
      user: null,
      loading: false
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    },
    async fetchUser() {
      this.loading = true
      this.user = await getUser()
      this.loading = false
    }
  },
  mounted() {
    this.fetchUser()
  }
}
</script>
```

**问题：** 同一个功能的代码分散在 `data`、`computed`、`methods`、`mounted` 等多个选项中。

### 1.2 Composition API 的优势

```vue
<!-- Composition API：逻辑按功能组织 -->
<script setup>
import { ref, computed, onMounted } from 'vue'

// 计数器功能
const count = ref(0)
const doubleCount = computed(() => count.value * 2)
const increment = () => count.value++

// 用户功能
const user = ref(null)
const loading = ref(false)
const fetchUser = async () => {
  loading.value = true
  user.value = await getUser()
  loading.value = false
}

onMounted(() => fetchUser())
</script>
```

## 二、setup 函数与 `<script setup>`

### 2.1 setup 函数

```vue
<script>
import { ref, computed } from 'vue'

export default {
  setup(props, context) {
    // props：组件接收的属性
    // context：包含 attrs、slots、emit
    
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    
    // 必须返回模板中使用的数据和方法
    return {
      count,
      doubleCount,
      increment: () => count.value++
    }
  }
}
</script>
```

### 2.2 `<script setup>` 语法糖

```vue
<script setup>
import { ref, computed } from 'vue'

// 声明的变量和函数自动暴露给模板
const count = ref(0)
const doubleCount = computed(() => count.value * 2)
const increment = () => count.value++

// defineProps 和 defineEmits 无需导入
const props = defineProps({
  title: String
})

const emit = defineEmits(['update'])
</script>
```

:::tip 推荐使用 `<script setup>`
- 代码更简洁
- 不需要手动 return
- 性能更好（编译时优化）
- TypeScript 支持更好
:::

## 三、ref 与 reactive

### 3.1 ref

```vue
<script setup>
import { ref } from 'vue'

// 基本类型
const count = ref(0)
console.log(count.value) // 0
count.value++

// 对象类型
const user = ref({ name: '沐风', age: 25 })
console.log(user.value.name) // '沐风'

// 在模板中自动解包，不需要 .value
</script>

<template>
  <p>{{ count }}</p> <!-- 自动解包 -->
  <p>{{ user.name }}</p>
</template>
```

### 3.2 reactive

```vue
<script setup>
import { reactive } from 'vue'

// reactive 只能用于对象类型
const state = reactive({
  count: 0,
  user: { name: '沐风', age: 25 }
})

// 直接访问，不需要 .value
console.log(state.count) // 0
state.count++

// 嵌套对象也是响应式的
state.user.name = '新名字'
</script>
```

### 3.3 如何选择

| 场景 | 推荐 | 原因 |
|------|------|------|
| 基本类型 | ref | reactive 不支持基本类型 |
| 对象整体替换 | ref | reactive 整体替换会丢失响应性 |
| 复杂对象 | reactive | 访问更简洁，不需要 .value |
| 需要解构 | reactive + toRefs | 解构后保持响应性 |

```vue
<script setup>
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  name: '沐风'
})

// ❌ 解构会丢失响应性
// const { count, name } = state

// ✅ 使用 toRefs 保持响应性
const { count, name } = toRefs(state)
</script>
```

## 四、computed 与 watch

### 4.1 computed

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

// 只读 computed
const fullName = computed(() => firstName.value + lastName.value)

// 可写 computed
const fullNameWritable = computed({
  get: () => firstName.value + lastName.value,
  set: (val) => {
    firstName.value = val[0]
    lastName.value = val.slice(1)
  }
})
</script>
```

### 4.2 watch

```vue
<script setup>
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const user = ref({ name: '沐风', age: 25 })

// watch 单个 ref
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
})

// watch 多个源
watch([count, user], ([newCount, newUser], [oldCount, oldUser]) => {
  console.log('count 或 user 变化了')
})

// watch 对象的某个属性
watch(
  () => user.value.name,
  (newName, oldName) => {
    console.log(`name: ${oldName} -> ${newName}`)
  }
)

// watchEffect：自动收集依赖
watchEffect(() => {
  console.log(`count is ${count.value}, name is ${user.value.name}`)
})

// deep 和 immediate
watch(user, (newVal) => {
  console.log('user 深度监听', newVal)
}, { deep: true, immediate: true })
</script>
```

## 五、自定义 Hooks（Composables）

### 5.1 useFetch

```typescript
// composables/useFetch.ts
import { ref, watchEffect } from 'vue'

export function useFetch<T>(url: string | (() => string)) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchData = async () => {
    loading.value = true
    error.value = null
    
    try {
      const actualUrl = typeof url === 'function' ? url() : url
      const response = await fetch(actualUrl)
      if (!response.ok) throw new Error('请求失败')
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  watchEffect(fetchData)

  return { data, loading, error, refetch: fetchData }
}
```

### 5.2 useLocalStorage

```typescript
// composables/useLocalStorage.ts
import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)
  const data = ref<T>(stored ? JSON.parse(stored) : defaultValue)

  watch(data, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })

  return data
}
```

### 5.3 useForm

```typescript
// composables/useForm.ts
import { reactive, computed } from 'vue'

export function useForm<T extends Record<string, any>>(initialValues: T) {
  const form = reactive({ ...initialValues })
  const errors = reactive<Partial<Record<keyof T, string>>>({})

  const isValid = computed(() => Object.keys(errors).length === 0)

  const reset = () => {
    Object.assign(form, initialValues)
    Object.keys(errors).forEach(key => delete errors[key as keyof T])
  }

  const validate = (rules: Record<string, (val: any) => string | true>) => {
    let valid = true
    for (const [key, rule] of Object.entries(rules)) {
      const result = rule(form[key])
      if (result === true) {
        delete errors[key as keyof T]
      } else {
        errors[key as keyof T] = result
        valid = false
      }
    }
    return valid
  }

  return { form, errors, isValid, reset, validate }
}
```

### 5.4 使用示例

```vue
<script setup>
import { useFetch } from '@/composables/useFetch'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useForm } from '@/composables/useForm'

// 使用 useFetch
const { data: users, loading } = useFetch('/api/users')

// 使用 useLocalStorage
const theme = useLocalStorage('theme', 'light')

// 使用 useForm
const { form, errors, validate } = useForm({
  username: '',
  password: ''
})
</script>
```

## 六、实际项目应用示例

### 6.1 用户列表页面

```vue
<script setup>
import { ref, computed } from 'vue'
import { useFetch } from '@/composables/useFetch'

// 搜索
const searchText = ref('')
const searchUrl = computed(() => `/api/users?search=${searchText.value}`)

// 获取数据
const { data: users, loading, error } = useFetch(searchUrl)

// 分页
const page = ref(1)
const pageSize = 10
const paginatedUsers = computed(() => {
  if (!users.value) return []
  const start = (page.value - 1) * pageSize
  return users.value.slice(start, start + pageSize)
})

const totalPages = computed(() => {
  if (!users.value) return 0
  return Math.ceil(users.value.length / pageSize)
})
</script>

<template>
  <div class="user-list">
    <input v-model="searchText" placeholder="搜索用户..." />
    
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error.message }}</div>
    <table v-else>
      <tr v-for="user in paginatedUsers" :key="user.id">
        <td>{{ user.name }}</td>
        <td>{{ user.email }}</td>
      </tr>
    </table>
    
    <div class="pagination">
      <button @click="page--" :disabled="page <= 1">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button @click="page++" :disabled="page >= totalPages">下一页</button>
    </div>
  </div>
</template>
```

## 七、总结

| 特性 | Options API | Composition API |
|------|-------------|-----------------|
| 代码组织 | 按选项类型 | 按功能逻辑 |
| 逻辑复用 | Mixins | Composables |
| TypeScript | 一般 | 优秀 |
| 学习曲线 | 较低 | 较高 |
| 灵活性 | 较低 | 较高 |

:::tip 最佳实践
1. 优先使用 `<script setup>` 语法糖
2. 基本类型用 ref，复杂对象用 reactive
3. 提取可复用逻辑为 Composables
4. 使用 TypeScript 增强类型安全
5. 避免在 reactive 中使用 ref（容易混淆）
:::
