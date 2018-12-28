import * as utils from '@therockstorm/utils'
import dayjs from 'dayjs'
import * as http from '../src/http'
import * as colorMod from '../src/color'
import { Day, EmpMap } from '../src'
jest.mock('@therockstorm/utils')
jest.mock('../src/http')
jest.mock('../src/color')
const envVar = utils.envVar as jest.Mock
const postJson = http.postJson as jest.Mock
const color = colorMod.rndColor as jest.Mock
const COLOR = '#000'
const URL = 'env-var'
envVar.mockReturnValue(URL)
color.mockReturnValue(() => COLOR)
import { celebrations, holidays, timeOff } from '../src/publisher'

afterEach(() => postJson.mockClear())

const empMap: EmpMap = {
  'my-id': {
    id: 'my-id',
    name: 'my-name',
    photoUrl: 'my-photo.com',
    birthday: dayjs('01-01'),
    hireDate: dayjs('2018-01-01')
  }
}

test('envVar', () => {
  expect(envVar).toHaveBeenCalledWith('SLACK_WEBHOOK_URL')
})

test('not publish if no celebrations', async () => {
  const d = dayjs('2018-01-02')
  await celebrations(empMap, d)

  expect(postJson).not.toHaveBeenCalled
})

test('publish celebrations', async () => {
  const e = empMap['my-id']
  const d = dayjs('2018-01-01')

  await celebrations(empMap, d)

  const aText = `Welcome, ${e.name}!`
  const bText = `Happy birthday, ${e.name}!`
  expect(postJson).toHaveBeenCalledWith(URL, {
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

  expect(postJson).not.toHaveBeenCalled
})

test('publish holidays', async () => {
  const name = 'Halloween'

  await holidays([{ name, start: dayjs() }], dayjs())

  expect(postJson).toHaveBeenCalledWith(URL, {
    text: 'Company-Observed Holiday',
    attachments: [{ fallback: name, author_name: name, color: COLOR }]
  })
})

test('not publish if no timeOff', async () => {
  await timeOff(empMap, [], [], dayjs())

  expect(postJson).not.toHaveBeenCalled
})

const expectPublishTimeOff = async (d: Day, dayOfWeek: string) => {
  const to = { id: 'my-id', name: 'my-name', start: d, end: d }

  await timeOff(empMap, [to], [], d)

  const text = `${to.name} returns ${dayOfWeek}`
  expect(postJson).toHaveBeenCalledWith(URL, {
    text: ":palm_tree: Who's Out :palm_tree:",
    attachments: [
      {
        fallback: text,
        author_name: text,
        author_icon: empMap[to.id].photoUrl,
        color: COLOR
      }
    ]
  })
}

test('publish timeOff ending Sun', async () =>
  await expectPublishTimeOff(dayjs('2018-01-07'), 'Monday'))

test('publish timeOff ending Mon', async () =>
  await expectPublishTimeOff(dayjs('2018-01-08'), 'Tuesday'))

test('publish timeOff ending Tue', async () =>
  await expectPublishTimeOff(dayjs('2018-01-09'), 'Wednesday'))

test('publish timeOff ending Wed', async () =>
  await expectPublishTimeOff(dayjs('2018-01-10'), 'Thursday'))

test('publish timeOff ending Thu', async () =>
  await expectPublishTimeOff(dayjs('2018-01-11'), 'Friday'))

test('publish timeOff ending Fri', async () =>
  await expectPublishTimeOff(dayjs('2018-01-12'), 'Monday'))

test('publish timeOff ending Sat', async () =>
  await expectPublishTimeOff(dayjs('2018-01-13'), 'Monday'))
