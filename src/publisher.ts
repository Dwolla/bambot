import { envVar, log } from '@therockstorm/utils'
import * as dayjs from 'dayjs'
import { Emp, EmpMap, TimeOff, Holiday, Slackable, SlackMessage } from '.'
import { postJson } from './http'
import { color } from './color'
import { ordinal } from './ordinal'

const D_FORMAT = 'dddd'
const WEBHOOK_URL = envVar('SLACK_WEBHOOK_URL')
const enum Day {
  Mon = 1,
  Tue = 2,
  Wed = 3,
  Thu = 4,
  Fri = 5,
  Sat = 6,
  Sun = 7
}

export const celebrations = async (
  es: EmpMap,
  today: dayjs.Dayjs
): Promise<void> => {
  const dayStr = (n: number): string =>
    `${n === 0 ? '' : ` on ${today.add(n, 'day').format(D_FORMAT)}`}`

  const anniversary = (other: string): { isAn: boolean; inDays: number } => {
    const same = (n: number): boolean => {
      const d = today.add(n, 'day')
      return d.isSame(dayjs(other).set('year', d.year()))
    }
    const res = (a: boolean, d: number) => ({ isAn: a, inDays: d })
    let i = 0
    if (same(i)) return res(true, i)
    if (today.day() === Day.Fri) {
      if (same(++i)) return res(true, i)
      if (same(++i)) return res(true, i)
    }
    return res(false, 0)
  }

  const cs = Object.keys(es).reduce(
    (res, id) => {
      const e = es[id]
      const add = (t: string) => res.push({ ...e, text: t })
      const bd = anniversary(e.birthday)
      if (bd.isAn) add(`Happy birthday${dayStr(bd.inDays)}, ${e.name}!`)
      if (today.isSame(dayjs(e.hireDate))) add(`Welcome, ${e.name}!`)
      else {
        const an = anniversary(e.hireDate)
        if (an.isAn)
          add(
            `Happy ${ordinal(
              today.diff(dayjs(e.hireDate), 'year')
            )} anniversary${dayStr(an.inDays)}, ${e.name}!`
          )
      }
      return res
    },
    [] as (Emp & Slackable)[]
  )
  if (cs.length <= 0) return

  log('Publishing celebrations')
  await postJson<SlackMessage>(WEBHOOK_URL, {
    text: ':tada: Celebrations :tada:',
    attachments: cs.map((c, i) => ({
      fallback: c.text,
      author_name: c.text,
      author_icon: es[c.id].photoUrl,
      color: color(i)
    }))
  })
}

export const holidays = async (holidays: Holiday[]): Promise<void> => {
  if (!holidays || holidays.length <= 0) return

  log('Publishing holidays')
  await postJson<SlackMessage>(WEBHOOK_URL, {
    text: 'Company-Observed Holiday',
    attachments: holidays.map((h, i) => {
      return { fallback: h.name, author_name: h.name, color: color(i) }
    })
  })
}

export const timeOff = async (
  es: EmpMap,
  timeOff: TimeOff[],
  today: dayjs.Dayjs
): Promise<void> => {
  if (!timeOff || timeOff.length <= 0) return

  const returnDate = (ret: string): dayjs.Dayjs => {
    const r = dayjs(ret).add(1, 'day')
    const d = r.day()
    return d === Day.Sat || d === Day.Sun ? r.add(8 - d, 'day') : r
  }

  log('Publishing timeOff')
  await postJson<SlackMessage>(WEBHOOK_URL, {
    text: ":palm_tree: Who's Out :palm_tree:",
    attachments: timeOff.map((o, i) => {
      const e = es[o.id]
      const ret = returnDate(o.end)
      const diff = ret.diff(today, 'day')
      const text = `${e.name} returns ${ret.format(
        diff >= 7 || diff < 0 ? 'ddd, MMM D' : D_FORMAT
      )}`
      return {
        fallback: text,
        author_name: text,
        author_icon: e.photoUrl,
        color: color(i)
      }
    })
  })
}
