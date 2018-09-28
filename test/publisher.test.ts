import * as utils from '@therockstorm/utils'
import * as dayjs from 'dayjs'
import * as http from '../src/http'
import * as colorMod from '../src/color'
import { EmpMap } from '../src'
jest.mock('@therockstorm/utils')
jest.mock('../src/http')
jest.mock('../src/color')
const envVar = utils.envVar as jest.Mock
const postJson = http.postJson as jest.Mock
const color = colorMod.color as jest.Mock
const COLOR = '#000'
const URL = 'env-var'
envVar.mockReturnValue(URL)
color.mockReturnValue(COLOR)
import { celebrations, holidays, timeOff } from '../src/publisher'

const YMD_FORMAT = 'YYYY-MM-DD'
const empMap: EmpMap = {
  'my-id': {
    id: 'my-id',
    name: 'my-name',
    photoUrl: 'my-photo.com',
    birthday: '01-01',
    hireDate: '2018-01-01'
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
  await holidays([])

  expect(postJson).not.toHaveBeenCalled
})

test('publish holidays', async () => {
  const name = 'Halloween'

  await holidays([{ name }])

  expect(postJson).toHaveBeenCalledWith(URL, {
    text: 'Company-Observed Holiday',
    attachments: [{ fallback: name, author_name: name, color: COLOR }]
  })
})

test('not publish if no timeOff', async () => {
  await timeOff(empMap, [], dayjs())

  expect(postJson).not.toHaveBeenCalled
})

test('publish timeOff', async () => {
  const d = dayjs('2018-01-01')
  const to = { id: 'my-id', name: 'my-name', end: d.format(YMD_FORMAT) }

  await timeOff(empMap, [to], d)

  const text = `${to.name} returns Tuesday`
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
})
