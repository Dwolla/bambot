import dayjs from 'dayjs'

export type Day = dayjs.Dayjs

export interface Emp {
  id: string
  name: string
  photoUrl: string
  birthday: Day
  hireDate: Day
}

export type EmpMap = {
  [id: string]: Emp
}

export type DirectoryRes = Readonly<{
  employees: {
    id: string
    displayName: string
    preferredName?: string
    lastName: string
    photoUrl: string
  }[]
}>

export type EmpByIdRes = Readonly<{
  birthday: string
  hireDate: string
}>

export type WhosOutRes = Readonly<{
  calendar: {
    item: {
      $: { type: string }
      start: string[]
      end: string[]
      employee?: { _: string; $: { id: string } }[]
      holiday?: { _: string; $: { id: string } }[]
    }[]
  }
}>

export type TimeOff = Readonly<{
  id: string
  name: string
  start: Day
  end: Day
}>

export type Holiday = Readonly<{
  name: string
  start: Day
}>

export type WhosOutMap = Readonly<{
  timeOff: TimeOff[]
  holidays: Holiday[]
}>

export type SlackMessage = Readonly<{
  text: string
  attachments: {
    fallback: string
    author_name: string
    author_icon?: string
    color?: string
  }[]
}>

export type Slackable = Readonly<{
  text: string
}>
