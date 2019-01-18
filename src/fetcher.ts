import { envVar } from '@therockstorm/utils'
import { Day, Emp, WhosOut } from '.'
import { TaskQueue } from 'cwait'
import dayjs from 'dayjs'
import { getJson, getXml } from './http'

const CONCURRENCY = 15
const YMD_FORMAT = 'YYYY-MM-DD'
const BASE_URL = `https://${envVar(
  'BAMBOOHR_KEY'
)}:x@api.bamboohr.com/api/gateway.php/${envVar('BAMBOOHR_SUBDOMAIN')}/v1`

export const employees = async (): Promise<Emp[]> =>
  await Promise.all<Emp>(
    (await getJson<DirectoryRes>(`${BASE_URL}/employees/directory`)).employees
      .map(e => ({
        id: e.id,
        name: e.preferredName
          ? `${e.preferredName} ${e.lastName}`
          : e.displayName,
        photoUrl: e.photoUrl
      }))
      .map(
        new TaskQueue(Promise, CONCURRENCY).wrap<Emp, EmpRes>(async e => {
          const m = await getJson<EmpByIdRes>(
            `${BASE_URL}/employees/${e.id}?fields=birthday,hireDate`
          )
          return {
            ...e,
            birthday: dayjs(m.birthday),
            hireDate: dayjs(m.hireDate)
          }
        })
      )
  )

export const holidaysAndTimeOff = async (today: Day): Promise<WhosOut> => {
  const empty = { holidays: [], timeOff: {} } as WhosOut
  const is = (await getXml<WhosOutRes>(
    `${BASE_URL}/time_off/whos_out/?end=${today
      .add(1, 'month')
      .format(YMD_FORMAT)}`
  )).calendar.item
  return is
    ? is.reduce((res, i) => {
        if (i.$.type === 'holiday' && i.holiday)
          res.holidays.push({ name: i.holiday[0]._, date: dayjs(i.start[0]) })
        else if (i.$.type === 'timeOff' && i.employee) {
          const id = i.employee[0].$.id
          const obj = {
            id,
            startDate: dayjs(i.start[0]),
            endDate: dayjs(i.end[0])
          }
          res.timeOff[id]
            ? res.timeOff[id].push(obj)
            : (res.timeOff[id] = [obj])
        }
        return res
      }, empty)
    : empty
}

type DirectoryRes = Readonly<{
  employees: {
    id: string
    displayName: string
    preferredName?: string
    lastName: string
    photoUrl: string
  }[]
}>

type EmpRes = Readonly<{
  id: string
  name: string
  photoUrl: string
}>

type EmpByIdRes = Readonly<{
  birthday: string
  hireDate: string
}>

type WhosOutRes = Readonly<{
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
