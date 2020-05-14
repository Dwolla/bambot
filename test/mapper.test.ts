import dayjs from "dayjs"
import { Day } from "../src"
import { DayOfWeek, toEmployees } from "../src/mapper"

const today = dayjs().startOf("day")
const es = [
  {
    birthday: today.add(1, "day"),
    hireDate: today.add(1, "day"),
    id: "my-id",
    name: "my-name",
    photoUrl: "my-url",
  },
]
const wo = {
  holidays: [],
  timeOff: {},
}

test("timeOff ending Sun", async () =>
  await expectTimeOff(dayjs("2018-01-07"), DayOfWeek.Mon))

test("timeOff ending Mon", async () =>
  await expectTimeOff(dayjs("2018-01-08"), DayOfWeek.Tue))

test("timeOff ending Tue", async () =>
  await expectTimeOff(dayjs("2018-01-09"), DayOfWeek.Wed))

test("timeOff ending Wed", async () =>
  await expectTimeOff(dayjs("2018-01-10"), DayOfWeek.Thu))

test("timeOff ending Thu", async () =>
  await expectTimeOff(dayjs("2018-01-11"), DayOfWeek.Fri))

test("timeOff ending Fri", async () =>
  await expectTimeOff(dayjs("2018-01-12"), DayOfWeek.Mon))

test("timeOff ending Sat", async () =>
  await expectTimeOff(dayjs("2018-01-13"), DayOfWeek.Mon))

const expectTimeOff = async (d: Day, dayOfWeek: DayOfWeek) => {
  const id = es[0].id
  wo.timeOff = { [id]: [{ id, name: "my-name", startDate: d, endDate: d }] }

  const res = await toEmployees(es, wo, today)

  expect((res[0].returnDate as Day).day()).toEqual(dayOfWeek)
}
