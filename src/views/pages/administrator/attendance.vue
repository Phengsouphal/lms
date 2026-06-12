<template>
  <div class="w-full h-full px-6 pt-5">
    <McTitle
      :title="$t('Attendance')"
      :hasBtnAdd="false"
      :btn-txt="$t('button.addUser')"
      @on-click="$router.push('/' + RouteName.ADD_USER)"
    >
    </McTitle>
    <McCard
      v-if="loading"
      :hasBtnAdd="false"
      title="No Customer"
      subTitle="You don't have any customer yet"
    >
      <template #icon>
        <IconCustomerEmpty></IconCustomerEmpty>
      </template>
    </McCard>
    <McCardHeader v-else>
      <div class="w-full">
        <div class="w-full py-4 flex justify-between items-center">
          <div class="w-full flex gap-x-4 justify-between items-start">
            <div class="w-[300px]">
              <a-select
                v-model="selectCourse"
                class="mc-select !w-full !bg-transparent !rounded-md !border-[1.5px] !border-[#d8dce0]"
              >
                <a-option :value="item.id" v-for="(item, index) in courseActiveOptions" :key="index"
                  >{{ item.title }}
                </a-option>
              </a-select>
              <p class="my-4 text-black">Select a Session</p>
              <div
                class="mb-3 cursor-pointer rounded-md border p-3 border-main text-black"
                :class="[selectedSession?.id == item.id ? 'bg-main/30' : '']"
                v-for="(item, index) in sessionActiveOptions"
                :key="index"
                @click="onSelectSession(item)"
              >
                <p class="text-xs text-left">
                  {{ item.title }}
                </p>
                <p class="text-xs text-left">
                  {{ getCourseDetails(item.courseId).course?.title }}
                </p>
                <p class="text-[10px] text-left">
                  {{ getCountAttendance(item?.id) || 0 }}/{{
                    getCountStu(item?.courseId) || 0
                  }}
                  record <span>{{}}</span>
                </p>
              </div>
            </div>
            <div class="w-full flex flex-col justify-start items-start">
              <p class="mb-2 text-black">Student Attendance</p>
              <p class="text-xs text-black mb-1" v-if="selectedSession">
                {{ getCourseDetails(selectedSession.courseId).course?.title }} .
                {{ selectedSession.title }}
              </p>
              <div class="mb-4 flex text-[10px] justify-start gap-x-2 items-center capitalize">
                <p class="text-success px-3 py-1 rounded-full bg-success/30">
                  {{ countPresent }} present
                </p>
                <p class="text-danger px-3 py-1 rounded-full bg-danger/30">
                  {{ countAbsent }} absent
                </p>
                <p class="text-warning px-3 py-1 rounded-full bg-warning/30">
                  {{ countLate }} late
                </p>
                <p class="text-gray px-3 py-1 rounded-full bg-gray/30">{{ countExcuse }} excused</p>
              </div>
              <div v-if="selectedSession" class="w-full">
                <div v-if="studentEnrollList.length == 0 && !loadingList">
                  <p class="text-xs text-black mb-4">No students enrolled in this session</p>
                </div>
                <div
                  class="mb-3 cursor-pointer rounded-md border p-3 border-main text-black w-full"
                  v-for="(item, index) in studentEnrollList"
                  :key="index"
                >
                  <div class="w-full flex justify-between items-center">
                    <p class="text-xs text-left">
                      {{ item.student?.name }}
                    </p>

                    <div class="flex justify-end items-center gap-x-2">
                      <a-tag
                        value="present"
                        @click="updateAttendance(item, EnumAttendanceStatus.PRESENT)"
                      >
                        <template
                          #icon
                          v-if="
                            getAttendanceDetails(item.studentId)?.status ==
                            EnumAttendanceStatus.PRESENT
                          "
                        >
                          <icon-check-circle-fill />
                        </template>
                        Present
                      </a-tag>
                      <a-tag
                        value="absent"
                        @click="updateAttendance(item, EnumAttendanceStatus.ABSENT)"
                      >
                        <template
                          #icon
                          v-if="
                            getAttendanceDetails(item.studentId)?.status ==
                            EnumAttendanceStatus.ABSENT
                          "
                        >
                          <icon-check-circle-fill />
                        </template>
                        Absent
                      </a-tag>
                      <a-tag
                        value="late"
                        @click="updateAttendance(item, EnumAttendanceStatus.LATE)"
                      >
                        <template
                          #icon
                          v-if="
                            getAttendanceDetails(item.studentId)?.status ==
                            EnumAttendanceStatus.LATE
                          "
                        >
                          <icon-check-circle-fill />
                        </template>
                        Late
                      </a-tag>
                      <a-tag
                        value="excused"
                        @click="updateAttendance(item, EnumAttendanceStatus.EXCUSED)"
                      >
                        <template
                          #icon
                          v-if="
                            getAttendanceDetails(item.studentId)?.status ==
                            EnumAttendanceStatus.EXCUSED
                          "
                        >
                          <icon-check-circle-fill />
                        </template>
                        Excused
                      </a-tag>
                    </div>
                  </div>
                </div>

                <a-skeleton v-if="loadingList" :animation="true">
                  <a-skeleton-line :rows="3" />
                </a-skeleton>
              </div>
              <div class="w-full flex justify-end items-center">
                <a-button @click="saveAttendance">Save Attendance</a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </McCardHeader>
  </div>
</template>

<script setup lang="ts">
import RouteName from '~/constants/router-name'
import { IUserTempData, useUserTempStore } from '~/stores/tempuser'
import {
  EnumAttendanceStatus,
  EnumEnrollmentStatus,
  EnumTermStatus,
  IAttendance,
  IEnrollment,
  ISession,
  useLmsStore
} from '~/stores/templms'
import { storeToRefs } from 'pinia'
import { v4 } from 'uuid'
import { sleep } from '~/utils/function'
import dayjs from 'dayjs'

const { t } = useI18n()

const userTempStore = useUserTempStore()
const lmsStore = useLmsStore()

const { termList, sessionList, courseList, enrollmentList, attendanceList } = storeToRefs(lmsStore)

const loading = ref(false)

const selectedSession = ref<ISession | null>(null)

const selectCourse = ref('all')

const courseActiveOptions = computed(() => {
  const list = courseList.value.filter((course) => {
    const term = termList.value.find((term) => term.id === course.termId)
    return term?.status === EnumTermStatus.ACTIVE
  })

  return [
    { id: 'all', title: 'All' },
    ...list.map((i) => {
      return {
        id: i.id,
        title: i.title
      }
    })
  ]
})

const getCourseDetails = (courseId: string) => {
  const course = courseList.value.find((course) => course.id === courseId)
  const term = termList.value.find((term) => term.id === course?.termId)
  return {
    course: course || null,
    term: term || null
  }
}

const sessionActiveOptions = computed(() => {
  const list = sessionList.value.filter((session) => {
    const course = courseList.value
      .filter((course) => {
        const term = termList.value.find((term) => term.id === course.termId)
        return term?.status === EnumTermStatus.ACTIVE
      })
      .find((course) => course.id === session.courseId)
    const term = termList.value.find((term) => term.id === course?.termId)
    return term?.status === EnumTermStatus.ACTIVE
  })

  if (selectCourse.value == 'all') {
    return list
  } else {
    return list.filter((i) => i.courseId == selectCourse.value)
  }
})

const studentEnrollList = ref<IEnrollment[]>([])

const getCountStu = (courseId: string) => {
  return enrollmentList.value.filter(
    (enrollment) =>
      enrollment.courseId === courseId && enrollment.status == EnumEnrollmentStatus.ENROLLED
  ).length
}

const getCountAttendance = (sessionId: string) => {
  return attendanceList.value.filter((enrollment) => enrollment.sessionId === sessionId).length
}

const countPresent = computed(() => {
  return (
    tempAttendance.value.filter(
      (enrollment) =>
        enrollment.sessionId === selectedSession.value?.id &&
        enrollment.status == EnumAttendanceStatus.PRESENT
    )?.length || 0
  )
})

const countLate = computed(() => {
  return (
    tempAttendance.value.filter(
      (enrollment) =>
        enrollment.sessionId === selectedSession.value?.id &&
        enrollment.status == EnumAttendanceStatus.LATE
    )?.length || 0
  )
})

const countExcuse = computed(() => {
  return (
    tempAttendance.value.filter(
      (enrollment) =>
        enrollment.sessionId === selectedSession.value?.id &&
        enrollment.status == EnumAttendanceStatus.EXCUSED
    )?.length || 0
  )
})

const countAbsent = computed(() => {
  return (
    tempAttendance.value.filter(
      (enrollment) =>
        enrollment.sessionId === selectedSession.value?.id &&
        enrollment.status == EnumAttendanceStatus.ABSENT
    )?.length || 0
  )
})

const getAttendanceDetails = (studentId: string) => {
  const attendance = tempAttendance.value.find(
    (attendance) =>
      attendance.studentId === studentId && attendance.sessionId === selectedSession.value?.id
  )
  return attendance || null
}

const loadingList = ref(false)
const onSelectSession = async (session: ISession) => {
  selectedSession.value = session
  studentEnrollList.value = []
  loadingList.value = true
  await sleep(500)
  loadingList.value = false
  studentEnrollList.value = enrollmentList.value.filter(
    (enrollment) =>
      enrollment.courseId === selectedSession.value?.courseId &&
      enrollment.status == EnumEnrollmentStatus.ENROLLED
  )

  tempAttendance.value = []
  tempAttendance.value = [...attendanceList.value].map((item) => ({ ...item }))
}

const tempAttendance = ref<IAttendance[]>([])

const updateAttendance = (item: IEnrollment, status: EnumAttendanceStatus) => {
  const index = tempAttendance.value.findIndex(
    (attendance) =>
      attendance.studentId === item.studentId && attendance.sessionId === selectedSession.value?.id
  )

  if (index !== -1) {
    tempAttendance.value[index].status = status
  } else {
    tempAttendance.value.push({
      id: v4(),
      studentId: item.studentId,
      sessionId: selectedSession.value?.id || '',
      status: status,
      enrollmentId: item.id,
      recordedAt: '',
      recordedBy: ''
    })
  }
}

const saveAttendance = () => {
  const list = tempAttendance.value.map((i) => {
    return {
      ...i,
      recordedAt: dayjs().toISOString()
    }
  })

  attendanceList.value = structuredClone([...list])
}

onMounted(async () => {})
</script>

<style>
.mc-select.arco-select-view-single.arco-select-view-focus {
  border-color: #ff784e !important;
}
</style>
