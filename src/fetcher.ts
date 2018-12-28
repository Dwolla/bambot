import { envVar } from '@therockstorm/utils'
import {
  Day,
  DirectoryRes,
  Emp,
  EmpByIdRes,
  EmpMap,
  WhosOutRes,
  WhosOutMap
} from '.'
import { TaskQueue } from 'cwait'
import dayjs from 'dayjs'
import { getJson, getXml } from './http'

const CONCURRENCY = 15
const YMD_FORMAT = 'YYYY-MM-DD'
const BASE_URL = `https://${envVar(
  'BAMBOOHR_KEY'
)}:x@api.bamboohr.com/api/gateway.php/${envVar('BAMBOOHR_SUBDOMAIN')}/v1`

export const employees = async (): Promise<EmpMap> =>
  (await Promise.all<Emp>(
    (await getJson<DirectoryRes>(`${BASE_URL}/employees/directory`)).employees
      .map(e => ({
        id: e.id,
        name: e.preferredName
          ? `${e.preferredName} ${e.lastName}`
          : e.displayName,
        photoUrl: e.photoUrl
      }))
      .map(
        new TaskQueue(Promise, CONCURRENCY).wrap<
          Emp,
          {
            id: string
            name: string
            photoUrl: string
          }
        >(async e => {
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
  )).reduce(
    (res, o) => {
      res[o.id] = o
      return res
    },
    {} as EmpMap
  )

export const holidaysAndTimeOff = async (today: Day): Promise<WhosOutMap> => {
  const empty = { holidays: [], timeOff: [] } as WhosOutMap
  const is = (await getXml<WhosOutRes>(
    `${BASE_URL}/time_off/whos_out/?end=${today
      .add(1, 'month')
      .format(YMD_FORMAT)}`
  )).calendar.item
  return is
    ? is.reduce((res, i) => {
        if (i.$.type === 'holiday' && i.holiday)
          res.holidays.push({ name: i.holiday[0]._, start: dayjs(i.start[0]) })
        else if (i.$.type === 'timeOff' && i.employee)
          res.timeOff.push({
            id: i.employee[0].$.id,
            name: i.employee[0]._,
            start: dayjs(i.start[0]),
            end: dayjs(i.end[0])
          })
        return res
      }, empty)
    : empty
}
