<template>
  <div class="w-full h-full px-6 pt-5">
    <McTitle :title="$t('Term&Course')" :hasBtnAdd="false" :btn-txt="$t('button.addUser')">
    </McTitle>

    <McCardHeader>
      <div class="w-full">
        <div class="w-full py-4 flex justify-between items-center">
          <div class="w-full text-black text-center grid grid-cols-3 gap-4">
            <div class="w-full">
              <p>Terms</p>

              <div class="mt-3 text-left">
                <div
                  class="p-2 border cursor-pointer rounded-full px-4 mb-2"
                  :class="[
                    selectedTerm?.id == item.id ? 'border-main bg-main/20' : 'border-gray/40'
                  ]"
                  v-for="(item, index) in termList"
                  :key="index"
                  @click="
                    () => {
                      selectedTerm = item
                      selectedCourse = null
                    }
                  "
                >
                  <div class="flex justify-between items-center">
                    <p>{{ item.name }}</p>
                    <p
                      class="capitalize text-xs"
                      :class="[
                        item.status === 'completed'
                          ? 'text-gray-500'
                          : item.status === 'active'
                            ? 'text-green-500'
                            : 'text-blue-500'
                      ]"
                    >
                      {{ item.status }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-full">
              <p>Courses</p>
              <div class="mt-3 text-left">
                <div
                  class="p-2 border cursor-pointer rounded-full px-4 mb-2"
                  :class="[
                    selectedCourse?.id == item.id ? 'border-main bg-main/20' : 'border-gray/40'
                  ]"
                  v-for="(item, index) in selectedCourseList"
                  :key="index"
                  @click="
                    () => {
                      selectedCourse = item
                    }
                  "
                >
                  <p class="text-sm">{{ item.title }}</p>
                  <p class="text-xs">CS: {{ item?.instructor?.name }}</p>
                </div>
              </div>
              <a-button
                @click="
                  () => {
                    showAddCourseModal = true
                    if (selectedTerm) {
                      formCourse.termId = selectedTerm?.id || ''
                    }
                  }
                "
              >
                Add Course
              </a-button>
            </div>
            <div class="w-full">
              <p>Session</p>
              <div class="mt-3 text-left">
                <div
                  class="p-2 border cursor-pointer rounded-full px-4 mb-2"
                  :class="[
                    selectedTerm?.id == item.id ? 'border-main bg-main/20' : 'border-gray/40'
                  ]"
                  v-for="(item, index) in selectedSessionList"
                  :key="index"
                >
                  <p class="text-xs">{{ item.title }}</p>
                </div>

                <p
                  class="text-[10px] text-gray/50 text-center"
                  v-if="selectedCourse != null && selectedSessionList.length === 0"
                >
                  No sessions available for this course.
                </p>
              </div>
              <a-button
                class="!mt-4"
                @click="
                  () => {
                    showAddSessionModal = true
                    if (selectedCourse) {
                      formSession.courseId = selectedCourse?.id || ''
                    }
                  }
                "
              >
                Add Session
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </McCardHeader>

    <a-modal
      v-model:visible="showAddCourseModal"
      :closable="false"
      class="mc-modal"
      :footer="false"
      body-class="!p-0"
    >
      <a-form
        ref="formRef"
        :model="formCourse"
        layout="vertical"
        class=""
        @submit-success="onSubmit"
      >
        <div
          class="w-full h-16 px-6 flex justify-between items-center rounded-t-2xl border-b border-[#D9D9D9]"
        >
          <p class="text-[#111827] font-semibold text-base">{{ $t('Add Course') }}</p>
          <a-button type="text" class="!p-0 !h-fit" @click="showAddCourseModal = false">
            <IconCross></IconCross>
          </a-button>
        </div>
        <div class="w-full px-6 mt-6">
          <a-form-item
            field="title"
            :rules="[{ required: true, message: 'Title is required' }]"
            :label="$t('Title')"
          >
            <InputField v-model="formCourse.title" :max-length="30" class="!pl-3"></InputField>
          </a-form-item>

          <a-form-item
            field="termId"
            :rules="[{ required: true, message: 'Term is required' }]"
            :label="$t('Term')"
          >
            <a-select
              v-model="formCourse.termId"
              class="mc-select !w-full !bg-transparent !rounded-md !border-[1.5px] !border-[#d8dce0]"
            >
              <a-option :value="item.id" v-for="(item, index) in termList" :key="index"
                >{{ item.name }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item
            field="instructorId"
            :rules="[{ required: true, message: 'Instructor is required' }]"
            :label="$t('Instructor')"
          >
            <a-select
              v-model="formCourse.instructorId"
              class="mc-select !w-full !bg-transparent !rounded-md !border-[1.5px] !border-[#d8dce0]"
            >
              <a-option
                :value="item.id"
                v-for="(item, index) in userTempStore.userList?.filter(
                  (i) => i.role === EnumUserRole.INSTRUCTOR
                )"
                :key="index"
                >{{ item.name }}
              </a-option>
            </a-select>
          </a-form-item>
        </div>
        <div class="w-full flex justify-end items-center my-6 px-6 gap-x-5">
          <a-button
            type="outline"
            class="!border-[#D1D5DB] !text-[#374151] !px-6 !rounded-md"
            @click="showUpdateUser = false"
          >
            {{ $t('button.cancel') }}
          </a-button>

          <a-button type="primary" class="!rounded-md !px-6" @click="onSave">
            {{ $t('button.save') }}
          </a-button>
        </div>
      </a-form>
    </a-modal>

    <!-- show session -->
    <a-modal
      v-model:visible="showAddSessionModal"
      :closable="false"
      class="mc-modal"
      :footer="false"
      body-class="!p-0"
    >
      <a-form
        ref="formSessionRef"
        :model="formSession"
        layout="vertical"
        class=""
        @submit-success="onSubmitSession"
      >
        <div
          class="w-full h-16 px-6 flex justify-between items-center rounded-t-2xl border-b border-[#D9D9D9]"
        >
          <p class="text-[#111827] font-semibold text-base">{{ $t('Add Session') }}</p>
          <a-button type="text" class="!p-0 !h-fit" @click="showAddSessionModal = false">
            <IconCross></IconCross>
          </a-button>
        </div>
        <div class="w-full px-6 mt-6">
          <a-form-item
            field="title"
            :rules="[{ required: true, message: 'Title is required' }]"
            :label="$t('Title')"
          >
            <InputField v-model="formSession.title" :max-length="30" class="!pl-3"></InputField>
          </a-form-item>

          <a-form-item
            field="courseId"
            :rules="[{ required: true, message: 'Course is required' }]"
            :label="$t('Course')"
          >
            <a-select
              v-model="formSession.courseId"
              class="mc-select !w-full !bg-transparent !rounded-md !border-[1.5px] !border-[#d8dce0]"
            >
              <a-option :value="item.id" v-for="(item, index) in courseList" :key="index"
                >{{ item.title }}
              </a-option>
            </a-select>
          </a-form-item>
          <!-- <a-form-item
            field="instructorId"
            :rules="[{ required: true, message: 'Instructor is required' }]"
            :label="$t('Instructor')"
          >
            <a-select
              v-model="formCourse.instructorId"
              class="mc-select !w-full !bg-transparent !rounded-md !border-[1.5px] !border-[#d8dce0]"
            >
              <a-option
                :value="item.id"
                v-for="(item, index) in userTempStore.userList?.filter(
                  (i) => i.role === EnumUserRole.INSTRUCTOR
                )"
                :key="index"
                >{{ item.name }}
              </a-option>
            </a-select>
          </a-form-item> -->
        </div>
        <div class="w-full flex justify-end items-center my-6 px-6 gap-x-5">
          <a-button
            type="outline"
            class="!border-[#D1D5DB] !text-[#374151] !px-6 !rounded-md"
            @click="showUpdateUser = false"
          >
            {{ $t('button.cancel') }}
          </a-button>

          <a-button type="primary" class="!rounded-md !px-6" @click="onSaveSession">
            {{ $t('button.save') }}
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>

  <McDeleteModal
    :title="$t('common.deleteThisInfo')"
    :sub-title="$t('common.areYouSureYouWantToDeleteThisInfo')"
    v-model:show="showDeleteModal"
    :confirm-btn-texts="$t('button.delete')"
    @on-cancel="showDeleteModal = false"
    @on-confirm="onConfirmDelete"
  ></McDeleteModal>
</template>

<script setup lang="ts">
import { EnumCourseStatus, EnumSessionStatus, ICourse, ITerm, useLmsStore } from '~/stores/templms'
import { storeToRefs } from 'pinia'
import { v4 } from 'uuid'
import { EnumUserRole, useUserTempStore } from '~/stores/tempuser'

const { t } = useI18n()
const userTempStore = useUserTempStore()
const lmsStore = useLmsStore()

const { termList, sessionList, courseList } = storeToRefs(lmsStore)

const formRef = ref(null) as any
const formSessionRef = ref(null) as any

const selectedTerm = ref<ITerm | null>(null)
const selectedCourse = ref<ICourse | null>(null)

const showAddCourseModal = ref(false)
const showAddSessionModal = ref(false)

const selectedCourseList = computed(() => {
  if (!selectedTerm.value) return []
  const list = courseList.value.filter((course) => course.termId === selectedTerm.value?.id)
  return list.map((course) => {
    const instructor = userTempStore.userList
      .filter((user) => user.role === EnumUserRole.INSTRUCTOR)
      .find((user) => user.id === course.instructorId)
    return {
      ...course,
      instructor: instructor
    }
  })
})

const selectedSessionList = computed(() => {
  if (!selectedCourse.value) return []
  return sessionList.value.filter((session) => session.courseId === selectedCourse.value?.id)
})

const loading = ref(false)
const showDeleteModal = ref(false)
const showUpdateUser = ref(false)

const formSession = reactive({
  courseId: '',
  title: '',
  status: EnumSessionStatus.IN_PROGRESS,
  scheduledAt: '',
  durationMinutes: 0
})

const formCourse = reactive({
  termId: '',
  title: '',
  description: '',
  instructorId: '',
  status: ''
})

const onSave = () => {
  formRef.value?.handleSubmit()
}

const onSubmit = async () => {
  courseList.value.push({
    id: v4(),
    termId: formCourse.termId,
    title: formCourse.title,
    description: formCourse.description,
    instructorId: formCourse.instructorId,
    status: EnumCourseStatus.DRAFT
  })
  showAddCourseModal.value = false
  formRef.value?.resetFields()
}

const onSaveSession = () => {
  formSessionRef.value?.handleSubmit()
}

const onSubmitSession = async () => {
  sessionList.value.push({
    id: v4(),
    courseId: formSession.courseId,
    title: formSession.title,
    status: EnumSessionStatus.IN_PROGRESS,
    scheduledAt: '',
    durationMinutes: 0
  })
  showAddSessionModal.value = false
  formSessionRef.value?.resetFields() // reset session form when course is added
}

const onEditInfo = async () => {
  // await userStore.onEditUser(
  //   formUpdateUser.name,
  //   phone,
  //   countryCode.value,
  //   formUpdateUser.role,
  //   formUpdateUser.status,
  //   selectedUser.value?._id
  // )
  showUpdateUser.value = false
  fetchData()
}

const submitUpdatePassword = async () => {
  // await userStore.onChangePasswordUser(
  //   formUpdatePassword.currentPass,
  //   formUpdatePassword.cfmPass,
  //   selectedUser.value?._id
  // )
  // showUpdatePassword.value = false
}

const onConfirmDelete = async () => {
  // await userStore.deleteUserId(selectedUser.value?._id)
  // showDeleteModal.value = false
}

const fetchData = async () => {
  loading.value = true
  // list.value = await userTempStore.getUserList()
  loading.value = false
}

onMounted(async () => {
  // fetchData()
})
</script>

<style>
.mc-select.arco-select-view-single.arco-select-view-focus {
  border-color: #ff784e !important;
}
</style>
