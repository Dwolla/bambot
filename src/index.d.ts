import dayjs from 'dayjs'

export type Day = dayjs.Dayjs

export interface Emp {
  id: string
  name: string
  photoUrl: string
  birthday: Day
  hireDate: Day
}

export type TimeOff = Readonly<{
  id: string
  startDate: Day
  endDate: Day
}>

export type Holiday = Readonly<{
  name: string
  date: Day
}>

export type WhosOut = Readonly<{
  timeOff: { [id: string]: TimeOff[] }
  holidays: Holiday[]
}>

export type Anniversary = Readonly<{ isAn: boolean; inDays: number }>

export type Employee = Readonly<{
  name: string
  photoUrl: string
  hireDate: Day
  birthday: Anniversary
  anniversary: Anniversary
  returnDate?: Day
}>

export type SlackableEmp = Employee & Readonly<{ text: string }>

export type SlackMsg = Readonly<{
  text?: string
  attachments?: {
    fallback: string
    author_name: string
    author_icon?: string
    color?: string
  }[]
}>
