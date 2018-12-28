import { envVar, log } from '@therockstorm/utils'
import { Day, Emp, EmpMap, TimeOff, Holiday, Slackable, SlackMessage } from '.'
import { postJson } from './http'
import { rndColor } from './color'
import { ordinal } from './ordinal'

const D_FORMAT = 'dddd'
const WEBHOOK_URL = envVar('SLACK_WEBHOOK_URL')
const enum DayOfWeek {
  Sun = 0,
  Mon = 1,
  Tue = 2,
  Wed = 3,
  Thu = 4,
  Fri = 5,
  Sat = 6
}

const isSat = (d: Day) => d.day() === DayOfWeek.Sat
const isSun = (d: Day) => d.day() === DayOfWeek.Sun

export const celebrations = async (es: EmpMap, today: Day): Promise<void> => {
  const dayStr = (n: number): string =>
    `${n === 0 ? '' : ` on ${today.add(n, 'day').format(D_FORMAT)}`}`

  const anniversary = (other: Day): { isAn: boolean; inDays: number } => {
    const same = (n: number): boolean => {
      const d = today.add(n, 'day')
      return d.isSame(other.set('year', d.year()))
    }
    const res = (a: boolean, d: number) => ({ isAn: a, inDays: d })
    let i = 0
    if (same(i)) return res(true, i)
    if (today.day() === DayOfWeek.Fri) {
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
      if (today.isSame(e.hireDate)) add(`Welcome, ${e.name}!`)
      else {
        const an = anniversary(e.hireDate)
        if (an.isAn)
          add(
            `Happy ${ordinal(
              today.diff(e.hireDate, 'year')
            )} anniversary${dayStr(an.inDays)}, ${e.name}!`
          )
      }
      return res
    },
    [] as (Emp & Slackable)[]
  )
  if (cs.length <= 0) return

  log('Publishing celebrations')
  const rc = rndColor()
  await postJson<SlackMessage>(WEBHOOK_URL, {
    text: ':tada: Celebrations :tada:',
    attachments: cs.map((c, i) => ({
      fallback: c.text,
      author_name: c.text,
      author_icon: es[c.id].photoUrl,
      color: rc(i)
    }))
  })
}

export const holidays = async (
  holidays: Holiday[],
  today: Day
): Promise<void> => {
  if (!holidays || holidays.length <= 0) return

  const h = holidays.filter(h => today.isSame(h.start))
  if (!h.length) return

  log('Publishing holidays')
  const rc = rndColor()
  await postJson<SlackMessage>(WEBHOOK_URL, {
    text: 'Company-Observed Holiday',
    attachments: [{ fallback: h[0].name, author_name: h[0].name, color: rc(0) }]
  })
}

export const timeOff = async (
  es: EmpMap,
  timeOff: TimeOff[],
  holidays: Holiday[],
  today: Day
): Promise<void> => {
  if (!timeOff || timeOff.length <= 0) return

  const [present, future] = partition(timeOff, today)
  if (!present.length) return

  const returnDate = (to: TimeOff): Day => {
    const ret = (d: Day): Day => {
      const end = d.add(1, 'day')
      const rd = end.add(isSat(end) ? 2 : isSun(end) ? 1 : 0, 'day')
      const h = holidays.filter(h => rd.isSame(h.start))[0]
      const fTo = future
        .filter(
          f => f.id === to.id && !f.start.isAfter(rd) && !f.end.isBefore(rd)
        )
        .sort((a, b) => a.end.diff(b.end, 'day'))[0]

      return fTo ? ret(fTo.end) : h ? ret(h.start) : rd
    }

    return ret(to.end)
  }

  log('Publishing timeOff')
  const rc = rndColor()
  await postJson<SlackMessage>(WEBHOOK_URL, {
    text: ":palm_tree: Who's Out :palm_tree:",
    attachments: present.map((to, i) => {
      const e = es[to.id]
      const ret = returnDate(to)
      const diff = ret.diff(today, 'day')
      const text = `${e.name} returns ${ret.format(
        diff >= 7 || diff < 0 ? 'ddd, MMM D' : D_FORMAT
      )}`
      return {
        fallback: text,
        author_name: text,
        author_icon: e.photoUrl,
        color: rc(i)
      }
    })
  })
}

type Partitions = [TimeOff[], TimeOff[]]

const partition = (timeOff: TimeOff[], today: Day): Partitions =>
  timeOff.reduce(
    ([a, b], to): Partitions =>
      to.start.isAfter(today) ? [a, [...b, to]] : [[...a, to], b],
    [[], []] as Partitions
  )
