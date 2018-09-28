export type Emp = Readonly<{
  id: string
  name: string
  photoUrl: string
  birthday: string
  hireDate: string
}>

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
      employee: { _: string; $: { id: string } }[]
      start: string[]
      end: string[]
      [key: string]: any
    }[]
  }
}>

export type TimeOff = Readonly<{
  id: string
  name: string
  end: string
}>

export type Holiday = Readonly<{
  name: string
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
