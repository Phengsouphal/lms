import { defineStore } from 'pinia'
import { IUserTempData } from './tempuser'
import { deleteData, get, post, put } from '~/services/https'

export enum EnumTermStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

export interface ITerm {
  id: string
  name: string
  startDate: string
  endDate: string
  status: EnumTermStatus
}

export enum EnumCourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface ICourse {
  id: string
  termId: string
  title: string
  description?: string
  instructorId: string
  status: EnumCourseStatus
}

export enum EnumSessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface ISession {
  id: string
  courseId: string
  title: string
  scheduledAt: string
  durationMinutes: number
  status: EnumSessionStatus
}

export enum EnumEnrollmentStatus {
  ENROLLED = 'enrolled',
  DROPPED = 'dropped',
  COMPLETED = 'completed'
}

export interface IEnrollment {
  id: string
  courseId: string
  studentId: string
  student: IUserTempData | null
  course: ICourse | null
  term: ITerm | null
  status: EnumEnrollmentStatus
  enrolledAt: string
}

export enum EnumAttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused'
}

export interface IAttendance {
  id: string
  sessionId: string
  enrollmentId: string
  studentId: string
  status: EnumAttendanceStatus
  note?: string
  recordedAt: string
  recordedBy: string
}

export const useLmsStore = defineStore('lms', () => {
  const termList = ref<ITerm[]>([
    {
      id: '1',
      name: 'Spring 2026',
      status: EnumTermStatus.ACTIVE,
      startDate: '',
      endDate: ''
    },
    {
      id: '2',
      name: 'Summer 2026',
      status: EnumTermStatus.UPCOMING,
      startDate: '',
      endDate: ''
    },
    {
      id: '3',
      name: 'Fall 2026',
      status: EnumTermStatus.COMPLETED,
      startDate: '',
      endDate: ''
    }
  ])
  const courseList = ref<ICourse[]>([
    {
      id: 'CS101',
      termId: '1',
      title: 'Introduction to Python',
      description: '',
      instructorId: 'in001',
      status: EnumCourseStatus.DRAFT
    },
    {
      id: 'CS102',
      termId: '1',
      title: 'Web Development',
      description: '',
      instructorId: 'in002',
      status: EnumCourseStatus.DRAFT
    },
    {
      id: 'CS201',
      termId: '2',
      title: 'Data Structures and Algorithms',
      description: 'Async, closures, patterns',
      instructorId: 'in001',
      status: EnumCourseStatus.DRAFT
    },
    {
      id: 'CS301',
      termId: '3',
      title: 'Full Stack Development',
      description: 'Frontend + backend integration',
      instructorId: 'in003',
      status: EnumCourseStatus.DRAFT
    }
  ])
  const sessionList = ref<ISession[]>([
    {
      id: 'S001',
      courseId: 'CS101',
      title: 'Week1 - Syntax and Basics',
      status: EnumSessionStatus.IN_PROGRESS,
      scheduledAt: '',
      durationMinutes: 0
    },
    {
      id: 'S002',
      courseId: 'CS101',
      title: 'Week2 - Function',
      status: EnumSessionStatus.IN_PROGRESS,
      scheduledAt: '',
      durationMinutes: 0
    },
    {
      id: 'S003',
      courseId: 'CS101',
      title: 'Week3 - OOP',
      status: EnumSessionStatus.IN_PROGRESS,
      scheduledAt: '',
      durationMinutes: 0
    },
    {
      id: 'S004',
      courseId: 'CS102',
      title: 'Week1 - HTML & CSS',
      status: EnumSessionStatus.IN_PROGRESS,
      scheduledAt: '',
      durationMinutes: 0
    },
    {
      id: 'S005',
      courseId: 'CS102',
      title: 'Week2 - JavaScript',
      status: EnumSessionStatus.IN_PROGRESS,
      scheduledAt: '',
      durationMinutes: 0
    },
    {
      id: 'S006',
      courseId: 'CS103',
      title: 'Week1 - Array and Linked List',
      status: EnumSessionStatus.IN_PROGRESS,
      scheduledAt: '',
      durationMinutes: 0
    }
  ])
  const enrollmentList = ref<IEnrollment[]>([])

  const attendanceList = ref<IAttendance[]>([])

  const getTerms = async () => {
    const res = await get<any[]>('/terms', {
      params: {}
    })
    if (res?.message == 'success') {
      // termList.value = res.data
    }
  }

  const getTermsCourses = async () => {
    const res = await get<any[]>('/terms?include=courses', {
      params: {}
    })
    if (res?.message == 'success') {
      // termList.value = res.data
    }
  }

  async function getCoursesByTermId(termId?: string) {
    const res = await get<any>(`/terms/${termId}/courses`, {})
    if (res?.message == 'success') {
      return res.data
    }
  }

  async function getSessionsByCourseId(courseId?: string) {
    const res = await get<any>(`/courses/${courseId}/sessions`, {})
    if (res?.message == 'success') {
      return res.data
    }
  }

  async function enrolledStudent(studentId: string, courseId: string) {
    const res = await post<any>(`/enrollments`, {
      studentId,
      courseId
    })
    if (res?.message == 'success') {
      return res.data
    }
  }

  async function updateEnrolledStudent(id: string, status: EnumEnrollmentStatus) {
    const res = await put<any>(`/enrollments/${id}`, {
      status
    })
    if (res?.message == 'success') {
      return res.data
    }
  }

  async function getSessionsRosters(sessionId: string) {
    const res = await get<any>(`/sessions/${sessionId}/roster`, {})
    if (res?.message == 'success') {
      return res.data
    }
  }

  return {
    termList,
    courseList,
    sessionList,
    enrollmentList,
    attendanceList,
    // Function

    getTerms,
    getTermsCourses,
    getCoursesByTermId,
    getSessionsByCourseId,
    enrolledStudent,
    updateEnrolledStudent,
    getSessionsRosters
  }
})
