<template>
  <div class="w-full h-full px-6 pt-5">
    <McTitle
      :title="$t('Enrollment')"
      :hasBtnAdd="true"
      :btn-txt="$t('Enroll Student')"
      @on-click="showEnrollModal = true"
    >
    </McTitle>
    <McCard
      v-if="list.length === 0 && !loading"
      :hasBtnAdd="false"
      title="No Enrollment"
      subTitle="You don't have any enrollment yet"
    >
      <template #icon>
        <IconCustomerEmpty></IconCustomerEmpty>
      </template>
    </McCard>
    <McCardHeader v-else>
      <div class="w-full">
        <div class="w-full py-4 flex justify-between items-center">
          <p class="text-lg font-medium text-[#111827]">
            <!-- {{ $t('user.allUser') }}({{ userStore.userMeta?.itemCount }}) -->
          </p>

          <div class="w-[40%]">
            <!-- <FilterInputField @handle-select=""></FilterInputField> -->
          </div>
        </div>
        <div v-if="!loading" class="w-full py-2">
          <a-table
            v-if="!loading"
            class="mc-table"
            :bordered="false"
            :columns="columns()"
            :data="list"
          >
            <template #student="{ record }">
              <p class="ml-2 line-clamp-2">{{ record?.student?.name }}</p>
            </template>

            <template #id="{ record, rowIndex }"> {{ rowIndex + 1 }} </template>

            <template #slotName="{ record }">
              {{ dayjs(record?.createdAt).format('DD/MM/YYYY') }}
            </template>

            <template #course="{ record }">
              <p class="text-xs">
                {{ record.term?.name }} .
                {{ record.course?.title }}
              </p>
            </template>
            <template #status="{ record }">
              <div
                class="w-fit px-4 py-0.5 rounded-full bg-opacity-20"
                :class="[
                  record.status === EnumEnrollmentStatus.COMPLETED
                    ? 'bg-success'
                    : record.status === EnumEnrollmentStatus.ENROLLED
                      ? 'bg-blue-500'
                      : 'bg-[#E23618]'
                ]"
              >
                <p
                  class="text-xs"
                  :class="[
                    record.status === EnumEnrollmentStatus.COMPLETED
                      ? 'text-success'
                      : record.status === EnumEnrollmentStatus.ENROLLED
                        ? 'text-blue-500'
                        : 'text-[#E23618]'
                  ]"
                >
                  {{
                    record.status === EnumEnrollmentStatus.COMPLETED
                      ? $t('Completed')
                      : record.status === EnumEnrollmentStatus.ENROLLED
                        ? $t('Enrolled')
                        : $t('Dropped')
                  }}
                </p>
              </div>
            </template>

            <template #action="{ record }">
              <a-dropdown @select="(v: any) => handleSelect(v, record)" position="br">
                <a-button type="text" class="!px-0" @click="">
                  <IconMore></IconMore>
                </a-button>
                <template #content>
                  <!-- <a-doption value="1">
                    <div class="w-[230px] flex justify-start items-center">
                      <p class="ml-2 font-medium text-[#00000070]">
                        {{ $t('button.updatePassword') }}
                      </p>
                    </div>
                  </a-doption> -->
                  <a-doption value="2">
                    <div class="flex justify-start items-center">
                      <p class="ml-2 font-medium text-[#00000070]">{{ $t('button.edit') }}</p>
                    </div>
                  </a-doption>

                  <a-doption value="3">
                    <div class="flex justify-start items-center">
                      <p class="ml-2 font-medium text-danger">{{ $t('button.delete') }}</p>
                    </div>
                  </a-doption>
                </template>
              </a-dropdown>
            </template>

            <template #pagination-left>
              <!-- <div class="w-full text-black text-left">
                {{
                  $t('table.showResult', {
                    total: userStore.userMeta?.totalItems,
                    from: 1,
                    to: userStore.userMeta?.itemCount
                  })
                }}
              </div> -->
            </template>
          </a-table>

          <div v-else class="h-96 flex justify-center items-center">
            <a-spin :size="32" />
          </div>
        </div>
        <McLoading v-else></McLoading>
      </div>
    </McCardHeader>
  </div>

  <McDeleteModal
    :title="$t('common.deleteThisInfo')"
    :sub-title="$t('common.areYouSureYouWantToDeleteThisInfo')"
    v-model:show="showDeleteModal"
    :confirm-btn-texts="$t('button.delete')"
    @on-cancel="showDeleteModal = false"
    @on-confirm="onConfirmDelete"
  ></McDeleteModal>

  <a-modal
    v-model:visible="showEnrollModal"
    :closable="false"
    class="mc-modal"
    :footer="false"
    body-class="!p-0"
  >
    <a-form ref="formRef" :model="formEnrollUser" layout="vertical" class="">
      <div
        class="w-full h-16 px-6 flex justify-between items-center rounded-t-2xl border-b border-[#D9D9D9]"
      >
        <p class="text-[#111827] font-semibold text-base">{{ $t('Enroll Student') }}</p>
        <a-button type="text" class="!p-0 !h-fit" @click="showEnrollModal = false">
          <IconCross></IconCross>
        </a-button>
      </div>
      <div class="w-full px-6 mt-6">
        <a-form-item field="courseId" :label="$t('Course')">
          <a-select
            v-model="formEnrollUser.courseId"
            class="mc-select !w-full !bg-transparent !rounded-md !border-[1.5px] !border-[#d8dce0]"
          >
            <a-option :value="item.value" v-for="(item, index) in courseOptions" :key="index"
              >{{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="Student" :label="$t('Student')">
          <a-select
            v-model="formEnrollUser.studentId"
            allow-search
            class="mc-select !w-full !bg-transparent !rounded-md !border-[1.5px] !border-[#d8dce0]"
          >
            <a-option :value="item._id" v-for="(item, index) in studentList" :key="index"
              >{{ item.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" :label="$t('Status')">
          <a-select
            v-model="formEnrollUser.status"
            class="mc-select !w-full !bg-transparent !rounded-md !border-[1.5px] !border-[#d8dce0]"
          >
            <a-option :value="EnumEnrollmentStatus.ENROLLED"> {{ 'Enrolled' }} </a-option>
            <a-option :value="EnumEnrollmentStatus.COMPLETED"> {{ 'Completed' }} </a-option>
            <a-option :value="EnumEnrollmentStatus.DROPPED"> {{ 'Dropped' }} </a-option>
          </a-select>
        </a-form-item>
      </div>
      <div class="w-full flex justify-end items-center my-6 px-6 gap-x-5">
        <a-button
          type="outline"
          class="!border-[#D1D5DB] !text-[#374151] !px-6 !rounded-md"
          @click="showEnrollModal = false"
        >
          {{ $t('button.cancel') }}
        </a-button>

        <a-button type="primary" class="!rounded-md !px-6" @click="onAddEnrollment">
          {{ $t('button.save') }}
        </a-button>
      </div>
    </a-form>
  </a-modal>

  <a-modal
    v-model:visible="showUpdateEnrollModal"
    :closable="false"
    class="mc-modal"
    :footer="false"
    body-class="!p-0"
  >
    <a-form :model="formUpdateEnrollUser" layout="vertical" class="">
      <div
        class="w-full h-16 px-6 flex justify-between items-center rounded-t-2xl border-b border-[#D9D9D9]"
      >
        <p class="text-[#111827] font-semibold text-base">{{ $t('Update Enrollment') }}</p>
        <a-button type="text" class="!p-0 !h-fit" @click="showEnrollModal = false">
          <IconCross></IconCross>
        </a-button>
      </div>
      <div class="w-full px-6 mt-6">
        <p class="mb-4">
          Student:
          <span class="font-bold">
            {{ selectedUser?.student?.name }}
          </span>
        </p>
        <a-form-item field="status" :label="$t('Status')">
          <a-select
            v-model="formUpdateEnrollUser.status"
            class="mc-select !w-full !bg-transparent !rounded-md !border-[1.5px] !border-[#d8dce0]"
          >
            <a-option :value="EnumEnrollmentStatus.ENROLLED"> {{ 'Enrolled' }} </a-option>
            <a-option :value="EnumEnrollmentStatus.COMPLETED"> {{ 'Completed' }} </a-option>
            <a-option :value="EnumEnrollmentStatus.DROPPED"> {{ 'Dropped' }} </a-option>
          </a-select>
        </a-form-item>
      </div>
      <div class="w-full flex justify-end items-center my-6 px-6 gap-x-5">
        <a-button
          type="outline"
          class="!border-[#D1D5DB] !text-[#374151] !px-6 !rounded-md"
          @click="showEnrollModal = false"
        >
          {{ $t('button.cancel') }}
        </a-button>

        <a-button type="primary" class="!rounded-md !px-6" @click="onUpdateEnrollment">
          {{ $t('button.save') }}
        </a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { v4 } from 'uuid'
import {
  EnumCourseStatus,
  EnumEnrollmentStatus,
  EnumTermStatus,
  IEnrollment,
  useLmsStore
} from '~/stores/templms'
import { EnumUserRole, IUserTempData, useUserTempStore } from '~/stores/tempuser'

const { t } = useI18n()
const userTempStore = useUserTempStore()
const lmsStore = useLmsStore()

const { termList, sessionList, courseList, enrollmentList } = storeToRefs(lmsStore)

const courseOptions = computed(() => {
  return courseList.value
    .filter((course) => {
      const term = termList.value.find((term) => term.id === course.termId)
      return term?.status === EnumTermStatus.ACTIVE
    })
    .map((course) => ({
      label: course.title,
      value: course.id
    }))
})

const studentList = computed(() => {
  return userTempStore.userList
    .filter((user) => user.role === EnumUserRole.STUDENT)
    .map((user) => ({
      name: user.name,
      _id: user.id
    }))
})

const list = computed(() => {
  return enrollmentList.value
})

const formRef = ref(null) as any

const loading = ref(false)
const showDeleteModal = ref(false)
const showEnrollModal = ref(false)
const showUpdateEnrollModal = ref(false)

const selectedUser = ref<IEnrollment | null>(null)

const formEnrollUser = reactive({
  courseId: '',
  studentId: '',
  student: null as IUserTempData | null,
  status: EnumEnrollmentStatus.ENROLLED,
  enrolledAt: ''
})

const formUpdateEnrollUser = reactive({
  courseId: '',
  studentId: '',
  student: null as IUserTempData | null,
  status: EnumEnrollmentStatus.ENROLLED
})

const formUpdatePassword = reactive({
  currentPass: '',
  cfmPass: ''
})

const columns = () => [
  {
    title: t('table.no'),
    slotName: 'id',
    width: 140
  },
  {
    title: t('Student'),
    slotName: 'student',
    width: 140
  },
  {
    title: t('Course'),
    slotName: 'course',
    width: 240
  },
  // {
  //   title: t('field.phoneNumber'),
  //   slotName: 'phoneNumber'
  // },
  {
    title: t('Status'),
    slotName: 'status'
  },
  // {
  //   title: t('table.lastLoginAt'),
  //   slotName: 'lastLogin'
  // },
  // {
  //   title: t('table.status'),
  //   slotName: 'status',
  //   width: 120
  // },
  {
    title: t('table.action'),
    slotName: 'action'
  }
]

const onAddEnrollment = async () => {
  const course = courseList.value.find((course) => course.id === formEnrollUser.courseId) || null

  const index = enrollmentList.value.findIndex(
    (enrollment) =>
      enrollment.courseId === formEnrollUser.courseId &&
      enrollment.studentId === formEnrollUser.studentId
  )
  if (index == -1) {
    enrollmentList.value.push({
      id: v4(),
      courseId: formEnrollUser.courseId,
      studentId: formEnrollUser.studentId,
      student:
        userTempStore.userList.find((student) => student.id === formEnrollUser.studentId) || null,
      status: formEnrollUser.status,
      enrolledAt: new Date().toISOString(),
      course: course,
      term: termList.value.find((term) => term.id === course?.termId) || null
    })
    formRef.value?.resetFields()
    formEnrollUser.courseId = ''
    formEnrollUser.studentId = ''
    showEnrollModal.value = false
  } else {
    Message.warning('This student is already enrolled in this course')
  }
}

const onUpdateEnrollment = async () => {
  const index = enrollmentList.value.findIndex(
    (enrollment) => enrollment.id === selectedUser.value?.id
  )
  if (index !== -1 && selectedUser.value) {
    enrollmentList.value[index].status = formUpdateEnrollUser.status
  }
  showUpdateEnrollModal.value = false
}

const handleSelect = (v: any, item: IEnrollment) => {
  selectedUser.value = item
  if (v == '1') {
  } else if (v == '2') {
    showUpdateEnrollModal.value = true
  } else {
    showDeleteModal.value = true
  }
}

const onConfirmDelete = async () => {
  // await userStore.deleteUserId(selectedUser.value?._id)
  enrollmentList.value = enrollmentList.value.filter(
    (enrollment) => enrollment.studentId !== selectedUser.value?.studentId
  )
  showDeleteModal.value = false
}

const fetchData = async () => {
  loading.value = true
  // list.value =
  loading.value = false
}

onMounted(async () => {
  fetchData()
})
</script>

<style>
.mc-select.arco-select-view-single.arco-select-view-focus {
  border-color: #ff784e !important;
}
</style>
