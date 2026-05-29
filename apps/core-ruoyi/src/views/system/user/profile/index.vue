<script setup lang="ts">
import type { UserVO } from '@/api/modules/system/user/types'
import { getOnline } from '@/api/modules/monitor/online'
import { getAuthList } from '@/api/modules/system/social/auth'
import { getUserProfile } from '@/api/modules/system/user'
import ResetPwd from './resetPwd.vue'
import UserAvatar from './userAvatar.vue'
import UserInfo from './userInfo.vue'

defineOptions({
  name: 'Profile',
})

const activeTab = ref('userinfo')
interface State {
  user: Partial<UserVO>
  roleGroup: string
  postGroup: string
  auths: unknown[]
  devices: unknown[]
}
const state = ref<State>({
  user: {},
  roleGroup: '',
  postGroup: '',
  auths: [],
  devices: [],
})

const userForm = ref({})

async function getUser() {
  const res = await getUserProfile()
  state.value.user = res.data.user
  userForm.value = { ...res.data.user }
  state.value.roleGroup = res.data.roleGroup
  state.value.postGroup = res.data.postGroup
}

async function getAuths() {
  const res = await getAuthList()
  state.value.auths = res.data
}
async function getOnlines() {
  const res = await getOnline()
  state.value.devices = res.rows
}

onMounted(() => {
  getUser()
  getAuths()
  getOnlines()
})
</script>

<template>
  <FaPageMain>
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <UserAvatar />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />用户名称
                <div class="pull-right">
                  {{ state.user.userName }}
                </div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />手机号码
                <div class="pull-right">
                  {{ state.user.phonenumber }}
                </div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />用户邮箱
                <div class="pull-right">
                  {{ state.user.email }}
                </div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />所属部门
                <div v-if="state.user.deptName" class="pull-right">
                  {{ state.user.deptName }} / {{ state.postGroup }}
                </div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />所属角色
                <div class="pull-right">
                  {{ state.roleGroup }}
                </div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />创建日期
                <div class="pull-right">
                  {{ state.user.createTime }}
                </div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template #header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <UserInfo :user="userForm" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <ResetPwd />
            </el-tab-pane>
            <!-- <el-tab-pane label="第三方应用" name="thirdParty">
              <thirdParty :auths="state.auths" />
            </el-tab-pane>
            <el-tab-pane label="在线设备" name="onlineDevice">
              <onlineDevice :devices="state.devices" />
            </el-tab-pane> -->
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </FaPageMain>
</template>
