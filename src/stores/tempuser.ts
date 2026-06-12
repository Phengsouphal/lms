import { defineStore } from 'pinia'
import { v4 } from 'uuid'

export enum EnumUserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export interface IUserTempData {
  id: string
  name: string
  email: string
  role: EnumUserRole
  avatarUrl?: string
}

export const useUserTempStore = defineStore('userTemp', () => {
  const userList = ref<IUserTempData[]>([
    {
      id: 'in001',
      name: 'Dr.Lim',
      email: '',
      role: EnumUserRole.INSTRUCTOR
    },
    {
      id: 'in002',
      name: 'Prof.Ron',
      email: '',
      role: EnumUserRole.INSTRUCTOR
    },
    {
      id: 'in003',
      name: 'Dr.Chen',
      email: '',
      role: EnumUserRole.INSTRUCTOR
    },
    {
      id: 'st001',
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      role: EnumUserRole.STUDENT
    },
    {
      id: 'st002',
      name: 'Brian Smith',
      email: 'brian.smith@example.com',
      role: EnumUserRole.STUDENT
    },
    {
      id: 'st003',
      name: 'Chloe Davis',
      email: 'chloe.davis@example.com',
      role: EnumUserRole.STUDENT
    },
    {
      id: 'st004',
      name: 'Daniel Wilson',
      email: 'daniel.wilson@example.com',
      role: EnumUserRole.STUDENT
    },
    {
      id: 'st005',
      name: 'Emma Brown',
      email: 'emma.brown@example.com',
      role: EnumUserRole.STUDENT
    },
    {
      id: 'st006',
      name: 'Frank Miller',
      email: 'frank.miller@example.com',
      role: EnumUserRole.STUDENT
    },
    {
      id: 'st007',
      name: 'Grace Taylor',
      email: 'grace.taylor@example.com',
      role: EnumUserRole.STUDENT
    },
    {
      id: 'st008',
      name: 'Henry Anderson',
      email: 'henry.anderson@example.com',
      role: EnumUserRole.STUDENT
    },
    {
      id: 'st009',
      name: 'Isabella Thomas',
      email: 'isabella.thomas@example.com',
      role: EnumUserRole.STUDENT
    },
    {
      id: 'st010',
      name: 'Jack Martinez',
      email: 'jack.martinez@example.com',
      role: EnumUserRole.STUDENT
    }
  ])

  async function getUserList() {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return userList.value
  }

  async function getUserById(id?: string) {
    setTimeout(() => {}, 300)
  }

  const onCreateUser = async (name: string, email: string, role: EnumUserRole) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    userList.value.push({
      id: v4(),
      name,
      email,
      role
    })
  }

  const onEditUser = async (
    name: string,
    email: string,

    role: string,
    id: string
  ) => {
    // console.log(res)
    // if (res.message == 'success') {
    //   Message.success('Edited user successfully')
    // } else {
    //   Message.error('Fail to edit user')
    // }
  }

  async function deleteUserId(id?: string) {
    // const res = await deleteData<any>('/v1/user/' + id, {})
    // if (res?.message == 'success') {
    //   Message.success('Delete user successfully!')
    // }
  }

  return {
    userList,

    // Function

    getUserById,
    getUserList,
    onCreateUser,
    onEditUser,

    deleteUserId
  }
})
