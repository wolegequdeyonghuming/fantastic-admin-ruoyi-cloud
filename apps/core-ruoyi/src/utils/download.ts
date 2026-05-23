import api from '@/api'

/**
 * 下载文件
 * @param url 下载地址
 * @param params 参数
 * @param filename 文件名
 */
export function download(url: string, params?: any, filename?: string) {
  api
    .get(url, {
      params,
      responseType: 'blob',
    })
    .then((res: any) => {
      const blob = new Blob([res.data])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    })
    .catch((error: any) => {
      console.error('下载失败', error)
    })
}
