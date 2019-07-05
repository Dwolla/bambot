import * as utils from "@therockstorm/utils"
import dayjs from "dayjs"
import { Employee } from "../src"
import * as colorMod from "../src/color"
import * as http from "../src/http"
jest.mock("@therockstorm/utils")
jest.mock("../src/http")
jest.mock("../src/color")
const envVar = utils.envVar as jest.Mock
const postMsg = http.postMsg as jest.Mock
const color = colorMod.rndColor as jest.Mock
const COLOR = "#000"
const URL = "env-var"
envVar.mockReturnValue(URL)
color.mockReturnValue(() => COLOR)
import { holidays, timeOffAndCelebrations } from "../src/publisher"

afterEach(() => postMsg.mockClear())

test("envVar", () => expect(envVar).toHaveBeenCalledWith("SLACK_WEBHOOK_URL"))

test("publish celebrations", async () => {
  const today = dayjs()
  const e = {
    anniversary: { isAn: true, inDays: 0 },
    birthday: { isAn: true, inDays: 0 },
    hireDate: today,
    name: "my-name",
    photoUrl: "url"
  } as Employee

  await timeOffAndCelebrations([e], today)

  const aText = `Welcome, ${e.name}!`
  const bText = `Happy birthday, ${e.name}!`
  expect(postMsg).toHaveBeenCalledWith(URL, {
    attachments: [
      {
        author_icon: e.photoUrl,
        author_name: bText,
        color: COLOR,
        fallback: bText
      },
      {
        author_icon: e.photoUrl,
        author_name: aText,
        color: COLOR,
        fallback: aText
      }
    ],
    text: ":tada: Celebrations :tada:"
  })
})

test("publish holidays", async () => {
  const name = "Halloween"

  await holidays([{ name, date: dayjs() }], dayjs())

  expect(postMsg).toHaveBeenCalledWith(URL, {
    attachments: [{ fallback: name, author_name: name, color: COLOR }],
    text: "Company-Observed Holiday"
  })
})
