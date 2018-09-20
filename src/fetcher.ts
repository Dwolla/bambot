import { envVar } from '@therockstorm/utils'
import {
  DirectoryRes,
  Emp,
  EmpByIdRes,
  EmpMap,
  WhosOutRes,
  WhosOutMap
} from '.'
import * as cwait from 'cwait'
import * as dayjs from 'dayjs'
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
        name: e.displayName,
        photoUrl: e.photoUrl
      }))
      .map(
        new cwait.TaskQueue(Promise, CONCURRENCY).wrap(async e => {
          const m = await getJson<EmpByIdRes>(
            `${BASE_URL}/employees/${e.id}?fields=birthday,hireDate`
          )
          return { ...e, birthday: m.birthday, hireDate: m.hireDate }
        })
      )
  )).reduce(
    (res, o) => {
      res[o.id] = o
      return res
    },
    {} as EmpMap
  )

export const holidaysAndTimeOff = async (
  today: dayjs.Dayjs
): Promise<WhosOutMap> => {
  const empty = { holidays: [], timeOff: [] } as WhosOutMap
  const is = (await getXml<WhosOutRes>(
    `${BASE_URL}/time_off/whos_out/?end=${today.format(YMD_FORMAT)}`
  )).calendar.item
  return is
    ? is.reduce((res, i) => {
        if (i.$.type === 'holiday' && today.isSame(dayjs(i.start[0])))
          res.holidays.push({ name: i.holidays[0]._ })
        if (i.$.type === 'timeOff')
          res.timeOff.push({
            id: i.employee[0].$.id,
            name: i.employee[0]._,
            end: i.end[0]
          })
        return res
      }, empty)
    : empty
}
