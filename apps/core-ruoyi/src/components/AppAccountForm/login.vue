<script setup lang="ts">
import type { CaptchaItem, TenantItem, TenantList } from '#/ruoyi/user'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import appApi from '@/api/modules/app'
import { FormControl, FormField, FormItem, FormMessage } from '@/ui/shadcn/ui/form'

defineOptions({
  name: 'LoginForm',
})

const props = defineProps<{
  username?: string
}>()

const emits = defineEmits<{
  onLogin: [username?: string]
  onRegister: [username?: string]
  onResetPassword: [username?: string]
}>()

const appAccountStore = useAppAccountStore()

const title = import.meta.env.VITE_APP_TITLE
const loading = ref(false)

// 登录方式，default 账号密码登录，qrcode 扫码登录
const type = ref<'default' | 'qrcode'>('default')
const remembered = JSON.parse(localStorage.getItem('login_remembered') || '{}')

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    username: z.string().min(1, '请输入用户名'),
    password: z.string().min(1, '请输入密码'),
    remember: z.boolean(),
    code: z.string().optional(),
    uuid: z.string().optional(),
    tenantId: z.string().optional(),
  })),
  initialValues: {
    username: props.username ?? remembered.username ?? '',
    password: remembered.password ?? '',
    remember: remembered.remember !== null,
    tenantId: remembered.tenantId ?? '000000',
  },
})
const onSubmit = form.handleSubmit((values) => {
  loading.value = true
  appAccountStore.login(values).then(() => {
    if (values.remember) {
      localStorage.setItem('login_username', values.username)
    }
    else {
      localStorage.removeItem('login_username')
    }
    emits('onLogin', values.username)
  }).finally(() => {
    loading.value = false
  })
})

const captchaEnabled = ref(false)
const captchaUrl = ref('')
async function getCaptcha() {
  const res = await appApi.getCaptcha()
  const data: CaptchaItem = res.data
  captchaEnabled.value = data.captchaEnabled
  if (captchaEnabled.value) {
    captchaUrl.value = `data:image/gif;base64,${data.img}`
    form.values.uuid = data.uuid
    form.values.code = ''
  }
}

const tenantEnabled = ref(false)
const tenantList = ref<{ label: string, value: string, disabled?: boolean }[]>([])
async function getTenantList() {
  const res = await appApi.getTenantList(false)
  const data: TenantList = res.data
  tenantEnabled.value = data.tenantEnabled
  if (tenantEnabled.value) {
    tenantList.value = data.voList.map((item: TenantItem) => ({ label: item.companyName, value: item.tenantId }))
    if (tenantList.value && tenantList.value.length > 0) {
      form.values.tenantId = tenantList.value[0].value
    }
  }
}

onMounted(() => {
  getCaptcha()
  getTenantList()
})
</script>

<template>
  <div class="p-12 flex-col-stretch-center min-h-500px w-full">
    <div class="mb-6 space-y-2">
      <h3 class="text-4xl">
        欢迎使用 👋🏻
      </h3>
      <p class="text-sm text-muted-foreground lg:text-base">
        {{ title }}
      </p>
    </div>
    <div v-show="type === 'default'">
      <form @submit="onSubmit">
        <FormField v-if="tenantEnabled" v-slot="{ componentField, errors }" name="tenantId">
          <FormItem class="pb-6 relative space-y-0">
            <FormControl>
              <FaSelect type="text" placeholder="租户" class="w-full" :class="{ 'border-destructive': errors.length }" v-bind="componentField" :options="tenantList" />
            </FormControl>
            <Transition enter-active-class="transition-opacity" enter-from-class="opacity-0" leave-active-class="transition-opacity" leave-to-class="opacity-0">
              <FormMessage class="text-xs m-0 bottom-1 absolute" />
            </Transition>
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField, errors }" name="username">
          <FormItem class="pb-6 relative space-y-0">
            <FormControl>
              <FaInput type="text" placeholder="用户名" class="w-full" :class="{ 'border-destructive': errors.length }" v-bind="componentField">
                <template #start>
                  <FaIcon name="i-lucide:user" />
                </template>
              </FaInput>
            </FormControl>
            <Transition enter-active-class="transition-opacity" enter-from-class="opacity-0" leave-active-class="transition-opacity" leave-to-class="opacity-0">
              <FormMessage class="text-xs m-0 bottom-1 absolute" />
            </Transition>
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField, errors }" name="password">
          <FormItem class="pb-6 relative space-y-0">
            <FormControl>
              <FaInput type="password" placeholder="密码" class="w-full" :class="{ 'border-destructive': errors.length }" v-bind="componentField">
                <template #start>
                  <FaIcon name="i-lucide:lock" />
                </template>
              </FaInput>
            </FormControl>
            <Transition enter-active-class="transition-opacity" enter-from-class="opacity-0" leave-active-class="transition-opacity" leave-to-class="opacity-0">
              <FormMessage class="text-xs m-0 bottom-1 absolute" />
            </Transition>
          </FormItem>
        </FormField>
        <FormField v-if="captchaEnabled" v-slot="{ componentField, errors }" name="code">
          <FormItem class="pb-6 relative space-y-0">
            <FormControl>
              <FaInput type="text" placeholder="验证码" :class="{ 'border-destructive': errors.length }" v-bind="componentField">
                <template #start>
                  <FaIcon name="i-lucide:code" />
                </template>
              </FaInput>
              <div>
                <img :src="captchaUrl" alt="captcha" @click="getCaptcha">
              </div>
            </FormControl>
            <Transition enter-active-class="transition-opacity" enter-from-class="opacity-0" leave-active-class="transition-opacity" leave-to-class="opacity-0">
              <FormMessage class="text-xs m-0 bottom-1 absolute" />
            </Transition>
          </FormItem>
        </FormField>
        <div class="mb-4 flex-center-between">
          <div class="flex-center-start">
            <FormField v-slot="{ componentField }" type="checkbox" name="remember">
              <FormItem>
                <FormControl>
                  <FaCheckbox :model-value="componentField.modelValue" @update:model-value="componentField['onUpdate:modelValue']?.($event)">
                    记住我
                  </FaCheckbox>
                </FormControl>
              </FormItem>
            </FormField>
          </div>
          <FaButton variant="link" class="p-0 h-auto" type="button" @click="emits('onResetPassword', form.values.username)">
            忘记密码了?
          </FaButton>
        </div>
        <FaButton :loading="loading" size="lg" class="w-full" type="submit">
          登录
        </FaButton>
        <div class="text-sm mt-4 flex-center gap-2">
          <span class="text-secondary-foreground op-50">还没有帐号?</span>
          <FaButton variant="link" class="p-0 h-auto" type="button" @click="emits('onRegister', form.values.username)">
            注册新帐号
          </FaButton>
        </div>
      </form>
    </div>
    <div v-show="type === 'qrcode'">
      <div class="flex-col-center">
        <img src="https://s2.loli.net/2024/04/26/GsahtuIZ9XOg5jr.png" class="h-[250px] w-[250px]">
        <div class="text-sm text-secondary-foreground mt-2 op-50">
          请使用微信扫码登录
        </div>
      </div>
    </div>
  </div>
</template>
