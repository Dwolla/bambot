import dayjs from "dayjs"

export type Day = dayjs.Dayjs

export type Emp = Readonly<{
  birthday: Day
  hireDate: Day
  id: string
  name: string
  photoUrl: string
}>

export type TimeOff = Readonly<{
  endDate: Day
  id: string
  startDate: Day
}>

export type Holiday = Readonly<{
  date: Day
  name: string
}>

export type WhosOut = Readonly<{
  holidays: Holiday[]
  timeOff: { [id: string]: TimeOff[] }
}>

export type Anniversary = Readonly<{ isAn: boolean; inDays: number }>

export type Employee = Readonly<{
  anniversary: Anniversary
  birthday: Anniversary
  hireDate: Day
  name: string
  photoUrl: string
  returnDate?: Day
}>

export type SlackableEmp = Employee & Readonly<{ text: string }>

export type SlackMsg = Readonly<{
  attachments?: Array<{
    author_icon?: string
    author_name: string
    color?: string
    fallback: string
  }>
  channel?: string
  text?: string
}>
