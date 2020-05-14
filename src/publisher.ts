import { envVar } from "@therockstorm/utils"
import { Day, Employee, Holiday, SlackableEmp } from "."
import { postMsg } from "./http"
import { toHolidaysMsg, toSlackMsg } from "./mapper"
import { ordinal } from "./ordinal"

const D_FORMAT = "dddd"
const WEBHOOK_URL = envVar("SLACK_WEBHOOK_URL")

export const timeOffAndCelebrations = async (
  es: Employee[],
  today: Day
): Promise<void> => {
  const dayStr = (n: number): string =>
    `${n === 0 ? "" : ` on ${today.add(n, "day").format(D_FORMAT)}`}`

  const d = es.reduce(
    (res, e) => {
      const addC = (text: string) => res.c.push({ ...e, text })
      if (e.birthday.isAn) {
        addC(`Happy birthday${dayStr(e.birthday.inDays)}, ${e.name}!`)
      }
      if (today.isSame(e.hireDate)) {
        addC(`Welcome, ${e.name}!`)
      } else if (e.anniversary.isAn) {
        addC(
          `Happy ${ordinal(
            today.add(e.anniversary.inDays, "day").diff(e.hireDate, "year")
          )} anniversary${dayStr(e.anniversary.inDays)}, ${e.name}!`
        )
      }
      if (e.returnDate) {
        const diff = e.returnDate.diff(today, "day")
        res.to.push({
          ...e,
          text: `${e.name} returns ${e.returnDate.format(
            diff >= 7 || diff < 0 ? "ddd, MMM D" : D_FORMAT
          )}`,
        })
      }
      return res
    },
    { c: [], to: [] } as { c: SlackableEmp[]; to: SlackableEmp[] }
  )
  await postMsg(
    WEBHOOK_URL,
    toSlackMsg(":palm_tree: Who's Out :palm_tree:", d.to)
  )
  await postMsg(WEBHOOK_URL, toSlackMsg(":tada: Celebrations :tada:", d.c))
}

export const holidays = async (hs: Holiday[], today: Day): Promise<void> =>
  await postMsg(
    WEBHOOK_URL,
    toHolidaysMsg(hs.filter((h) => today.isSame(h.date)))
  )
