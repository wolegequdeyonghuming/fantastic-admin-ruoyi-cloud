import axios from 'axios'
// import qs from 'qs'
import { decryptBase64, decryptWithAes, encryptBase64, encryptWithAes, generateAesKey } from '@/utils/crypto'
import { decrypt, encrypt } from '@/utils/jsencrypt'

// 请求重试配置
const MAX_RETRY_COUNT = 3 // 最大重试次数
const RETRY_DELAY = 1000 // 重试延迟时间（毫秒）
const ENCRYPT_HEADER = 'encrypt-key'

// 扩展 AxiosRequestConfig 类型
declare module 'axios' {
  export interface AxiosRequestConfig {
    retry?: boolean
    retryCount?: number
    fake?: boolean
    isToken?: boolean
  }
}

const api = axios.create({
  baseURL: (import.meta.env.DEV && import.meta.env.VITE_ENABLE_PROXY) ? '/proxy/' : import.meta.env.VITE_APP_API_BASEURL,
  timeout: 1000 * 60,
  responseType: 'json',
})

api.interceptors.request.use(
  (request) => {
    // 如果设置了 fake 属性，强制使用 fake 的 baseURL
    if (request.fake) {
      request.baseURL = '/fake/'
    }
    // 全局拦截请求发送前提交的参数
    const appAccountStore = useAppAccountStore()
    // 设置请求头
    if (request.headers) {
      request.headers['Accept-Language'] = 'zh-CN'
      request.headers.clientid = import.meta.env.VITE_APP_CLIENT_ID
      request.headers['Content-Type'] = request.headers['Content-Type'] || 'application/json;charset=UTF-8'
      if (appAccountStore.isLogin && !request.headers.isToken) {
        request.headers.Authorization = `Bearer ${appAccountStore.token}`
        request.headers.Token = appAccountStore.token
      }
    }
    // 是否将 POST 请求参数进行字符串化处理
    if (request.method === 'post') {
      // request.data = qs.stringify(request.data, {
      //   arrayFormat: 'brackets',
      // })
    }
    if (import.meta.env.VITE_APP_ENCRYPT) {
      // 当开启参数加密
      if (request.headers.isEncrypt && (request.method === 'post' || request.method === 'put')) {
        // 生成一个 AES 密钥
        const aesKey = generateAesKey()
        request.headers[ENCRYPT_HEADER] = encrypt(encryptBase64(aesKey))
        request.data = typeof request.data === 'object' ? encryptWithAes(JSON.stringify(request.data), aesKey) : encryptWithAes(request.data, aesKey)
      }
    }

    return request
  },
)

// 处理错误信息的函数
function handleError(error: any) {
  if (error.status === 401) {
    useAppAccountStore().requestLogout()
  }
  else {
    useFaToast().error('Error', {
      description: error.message,
    })
  }
  return Promise.reject(error)
}

api.interceptors.response.use(
  (response) => {
    // 解密
    if (import.meta.env.VITE_APP_ENCRYPT) {
      const keyStr = response.headers[ENCRYPT_HEADER]
      if (keyStr) {
        const data = response.data
        const base64Str = decrypt(keyStr)
        const aesKey = decryptBase64(base64Str.toString())
        const decryptData = decryptWithAes(data, aesKey)
        response.data = JSON.parse(decryptData)
      }
    }
    /**
     * 全局拦截请求发送后返回的数据，如果数据有报错则在这做全局的错误提示
     * 约定的数据格式：{ status: 1 | 0, error: string, data: object }
     * status 只有两种状态，1 表示请求成功，0 表示接口需要登录或者登录状态失效，需要重新登录
     * error 只有在请求出错时才会有值，表示错误信息
     * data 只有在请求成功时才会有值，表示请求返回的数据
     */
    if (typeof response.data === 'object') {
      // 判断响应格式：支持 status (框架原生) 或 code (若依)
      const data = response.data
      const isSuccess = data.status === 1 || data.code === 200
      if (isSuccess) {
        if (data.error) {
          useFaToast().warning('Warning', {
            description: data.error,
          })
          return Promise.reject(data)
        }
      }
      else {
        useAppAccountStore().requestLogout()
      }
      return Promise.resolve(data)
    }
    else {
      return Promise.reject(response.data)
    }
  },
  async (error) => {
    // 获取请求配置
    const config = error.config
    // 如果配置不存在或未启用重试，则直接处理错误
    if (!config || !config.retry) {
      return handleError(error)
    }
    // 设置重试次数
    config.retryCount = config.retryCount || 0
    // 判断是否超过重试次数
    if (config.retryCount >= MAX_RETRY_COUNT) {
      return handleError(error)
    }
    // 重试次数自增
    config.retryCount += 1
    // 延迟重试
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
    // 重新发起请求
    return api(config)
  },
)

export default api
