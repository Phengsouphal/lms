export interface IUserTempData {
  id: string
  name: string
  email: string
  role: EnumUserRole
  avatarUrl?: string
}

export interface ITerm {
  id: string
  name: string
  startDate: string
  endDate: string
  status: EnumTermStatus
}

export interface ICourse {
  id: string
  termId: string
  title: string
  description?: string
  instructorId: string
  status: EnumCourseStatus
}

export interface ISession {
  id: string
  courseId: string
  title: string
  scheduledAt: string
  durationMinutes: number
  status: EnumSessionStatus
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

export enum EnumUserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export enum EnumTermStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

export enum EnumCourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum EnumSessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum EnumEnrollmentStatus {
  ENROLLED = 'enrolled',
  DROPPED = 'dropped',
  COMPLETED = 'completed'
}

export enum EnumAttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused'
}
