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
              <p class="mb-4 text-black">Select a Session</p>
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
                  {{ getCountAttendance(item?.id) || 0 }}/{{ getCountStu(item?.courseId) || 0 }}
                  record
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
                <p class="text-success px-3 py-1 rounded-full bg-success/30">present</p>
                <p class="text-danger px-3 py-1 rounded-full bg-danger/30">absent</p>
                <p class="text-warning px-3 py-1 rounded-full bg-warning/30">late</p>
                <p class="text-gray px-3 py-1 rounded-full bg-gray/30">excused</p>
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
                <!-- <a-button @click="saveAttendance">Save Attendance</a-button> -->
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

const { t } = useI18n()

const userTempStore = useUserTempStore()
const lmsStore = useLmsStore()

const { termList, sessionList, courseList, enrollmentList, attendanceList } = storeToRefs(lmsStore)

const loading = ref(false)

const selectedSession = ref<ISession | null>(null)

const courseActiveOptions = computed(() => {
  return courseList.value.filter((course) => {
    const term = termList.value.find((term) => term.id === course.termId)
    return term?.status === EnumTermStatus.ACTIVE
  })
})

const getCourseDetails = (courseId: string) => {
  const course = courseList.value.find((course) => course.id === courseId)
  const term = termList.value.find((term) => term.id === course?.termId)
  console.log(course)
  return {
    course: course || null,
    term: term || null
  }
}

const sessionActiveOptions = computed(() => {
  return sessionList.value.filter((session) => {
    const course = courseActiveOptions.value.find((course) => course.id === session.courseId)
    const term = termList.value.find((term) => term.id === course?.termId)
    return term?.status === EnumTermStatus.ACTIVE
  })
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

const tempAttendance = ref<IAttendance[]>([])

const getAttendanceDetails = (studentId: string) => {
  const attendance = attendanceList.value.find(
    (attendance) =>
      attendance.studentId === studentId && attendance.sessionId === selectedSession.value?.id
  )
  return attendance || null
}

const loadingList = ref(false)
const onSelectSession = async (session: ISession) => {
  selectedSession.value = session
  loadingList.value = true
  await sleep(1000)
  loadingList.value = false
  studentEnrollList.value = enrollmentList.value.filter(
    (enrollment) =>
      enrollment.courseId === selectedSession.value?.courseId &&
      enrollment.status == EnumEnrollmentStatus.ENROLLED
  )
}

const updateAttendance = (item: IEnrollment, status: EnumAttendanceStatus) => {
  const index = attendanceList.value.findIndex(
    (attendance) =>
      attendance.studentId === item.studentId && attendance.sessionId === selectedSession.value?.id
  )

  if (index !== -1) {
    attendanceList.value[index].status = status
  } else {
    attendanceList.value.push({
      id: v4(),
      studentId: item.studentId,
      sessionId: selectedSession.value?.id || '',
      status: status,
      enrollmentId: item.id,
      recordedAt: '',
      recordedBy: ''
    })
  }

  console.log(attendanceList.value)
}

const saveAttendance = () => {}

onMounted(async () => {})
</script>

<style>
.mc-select.arco-select-view-single.arco-select-view-focus {
  border-color: #ff784e !important;
}
</style>
