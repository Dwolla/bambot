import { rndColor } from './color'
import {
  Anniversary,
  Emp,
  Employee,
  Day,
  TimeOff,
  WhosOut,
  Holiday,
  SlackableEmp,
  SlackMsg
} from '.'

export const enum DayOfWeek {
  Sun = 0,
  Mon = 1,
  Tue = 2,
  Wed = 3,
  Thu = 4,
  Fri = 5,
  Sat = 6
}

const isDay = (d: Day, dow: DayOfWeek) => d.day() === dow
const isFri = (d: Day) => isDay(d, DayOfWeek.Fri)
const isSat = (d: Day) => isDay(d, DayOfWeek.Sat)
const isSun = (d: Day) => isDay(d, DayOfWeek.Sun)

export const toEmployees = (es: Emp[], wo: WhosOut, today: Day): Employee[] => {
  const anniversary = (other: Day): Anniversary => {
    const same = (n: number): boolean => {
      const d = today.add(n, 'day')
      return d.isSame(other.set('year', d.year()))
    }
    const res = (a: boolean, d: number) => ({ isAn: a, inDays: d })
    let i = 0
    if (same(i)) return res(true, i)
    if (isFri(today)) {
      if (same(++i)) return res(true, i)
      if (same(++i)) return res(true, i)
    }
    return res(false, 0)
  }

  return es.map(e => {
    const [present, future] = partition(wo.timeOff[e.id], today)
    const returnDate = (to: TimeOff): Day => {
      const empFutureTo = future.filter(f => f.id === to.id)
      const returnDateRec = (d: Day): Day => {
        const end = d.add(1, 'day')
        const ret = end.add(isSat(end) ? 2 : isSun(end) ? 1 : 0, 'day')

        const h = wo.holidays.filter(h => ret.isSame(h.date))[0]
        if (h) return returnDateRec(h.date)

        const fTo = empFutureTo
          .filter(f => !f.startDate.isAfter(ret) && !f.endDate.isBefore(ret))
          .sort((a, b) => a.endDate.diff(b.endDate, 'day'))[0]
        return fTo ? returnDateRec(fTo.endDate) : ret
      }

      return returnDateRec(to.endDate)
    }

    return {
      name: e.name,
      photoUrl: e.photoUrl,
      hireDate: e.hireDate,
      birthday: anniversary(e.birthday),
      anniversary: anniversary(e.hireDate),
      returnDate: present.length ? returnDate(present[0]) : undefined
    }
  })
}

export const toHolidaysMsg = (holidays: Holiday[]): SlackMsg => {
  const rc = rndColor()
  return holidays.length
    ? {
        text: 'Company-Observed Holiday',
        attachments: holidays.map(h => ({
          fallback: h.name,
          author_name: h.name,
          color: rc(0)
        }))
      }
    : {}
}

export const toSlackMsg = (text: string, es: SlackableEmp[]): SlackMsg => {
  const rc = rndColor()
  return es.length
    ? {
        text,
        attachments: es
          .sort((a, b) => (a.text < b.text ? -1 : 1))
          .map((e, i) => ({
            fallback: e.text,
            author_name: e.text,
            author_icon: e.photoUrl,
            color: rc(i)
          }))
      }
    : {}
}

const partition = (timeOff: TimeOff[], today: Day): Partitions => {
  const empty = [[], []] as Partitions
  return timeOff
    ? timeOff.reduce(
        ([a, b], to): Partitions =>
          to.startDate.isAfter(today) ? [a, [...b, to]] : [[...a, to], b],
        empty
      )
    : empty
}

type Partitions = [TimeOff[], TimeOff[]]
