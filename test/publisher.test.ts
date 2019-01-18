import * as utils from '@therockstorm/utils'
import dayjs from 'dayjs'
import * as http from '../src/http'
import * as colorMod from '../src/color'
import { Employee } from '../src'
jest.mock('@therockstorm/utils')
jest.mock('../src/http')
jest.mock('../src/color')
const envVar = utils.envVar as jest.Mock
const postMsg = http.postMsg as jest.Mock
const color = colorMod.rndColor as jest.Mock
const COLOR = '#000'
const URL = 'env-var'
envVar.mockReturnValue(URL)
color.mockReturnValue(() => COLOR)
import { holidays, timeOffAndCelebrations } from '../src/publisher'

afterEach(() => postMsg.mockClear())

const es: Employee[] = [
  {
    name: 'my-name',
    photoUrl: 'url',
    birthday: { isAn: false, inDays: 0 },
    anniversary: { isAn: false, inDays: 0 }
  } as Employee
]

test('envVar', () => {
  expect(envVar).toHaveBeenCalledWith('SLACK_WEBHOOK_URL')
})

test('not publish if no celebrations', async () => {
  const d = dayjs('2018-01-02')
  await timeOffAndCelebrations(es, d)

  expect(postMsg).not.toHaveBeenCalled
})

test('publish celebrations', async () => {
  const e = {
    name: 'my-name',
    photoUrl: 'url',
    birthday: { isAn: true, inDays: 0 },
    anniversary: { isAn: true, inDays: 0 }
  } as Employee

  await timeOffAndCelebrations([e], dayjs())

  const aText = `Welcome, ${e.name}!`
  const bText = `Happy birthday, ${e.name}!`
  expect(postMsg).toHaveBeenCalledWith(URL, {
    text: ':tada: Celebrations :tada:',
    attachments: [
      {
        fallback: bText,
        author_name: bText,
        author_icon: e.photoUrl,
        color: COLOR
      },
      {
        fallback: aText,
        author_name: aText,
        author_icon: e.photoUrl,
        color: COLOR
      }
    ]
  })
})

test('not publish if no holidays', async () => {
  await holidays([], dayjs())

  expect(postMsg).not.toHaveBeenCalled
})

test('publish holidays', async () => {
  const name = 'Halloween'

  await holidays([{ name, date: dayjs() }], dayjs())

  expect(postMsg).toHaveBeenCalledWith(URL, {
    text: 'Company-Observed Holiday',
    attachments: [{ fallback: name, author_name: name, color: COLOR }]
  })
})

test('not publish if no timeOff', async () => {
  await timeOffAndCelebrations(es, dayjs())

  expect(postMsg).not.toHaveBeenCalled
})
