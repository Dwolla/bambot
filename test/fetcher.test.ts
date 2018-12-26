import * as utils from '@therockstorm/utils'
import dayjs from 'dayjs'
import * as http from '../src/http'
jest.mock('axios')
jest.mock('@therockstorm/utils')
jest.mock('../src/http')
const envVar = utils.envVar as jest.Mock
const getJson = http.getJson as jest.Mock
const getXml = http.getXml as jest.Mock
envVar.mockReturnValue('env-var')
import { employees, holidaysAndTimeOff } from '../src/fetcher'

const BASE_URL = `https://env-var:x@api.bamboohr.com/api/gateway.php/env-var/v1`
const YMD_FORMAT = 'YYYY-MM-DD'

test('envVar', () => {
  expect(envVar).toHaveBeenCalledWith('BAMBOOHR_KEY')
  expect(envVar).toHaveBeenCalledWith('BAMBOOHR_SUBDOMAIN')
})

test('employees', async () => {
  const dirRes = [
    {
      id: 'my-id',
      displayName: 'my-name',
      photoUrl: 'my-photo.com'
    }
  ]
  const byIdRes = {
    birthday: '01-01',
    hireDate: '2018-01-01'
  }
  getJson
    .mockResolvedValueOnce({ employees: dirRes })
    .mockResolvedValueOnce(byIdRes)

  expect(await employees()).toEqual({
    'my-id': {
      id: 'my-id',
      name: 'my-name',
      photoUrl: 'my-photo.com',
      ...byIdRes
    }
  })

  expect(getJson).toHaveBeenCalledWith(`${BASE_URL}/employees/directory`)
  expect(getJson).toHaveBeenCalledWith(
    `${BASE_URL}/employees/${dirRes[0].id}?fields=birthday,hireDate`
  )
})

test('holidaysAndTimeOff', async () => {
  const today = dayjs().startOf('day')
  const t = today.format(YMD_FORMAT)
  const exp = {
    holidays: [{ name: 'Thanksgiving Day' }],
    timeOff: [{ id: 'my-id', name: 'my-name', end: t }]
  }
  const to = exp.timeOff[0]
  const outRes = [
    {
      $: { type: 'timeOff' },
      employee: [{ _: to.name, $: { id: to.id } }],
      end: [to.end]
    },
    {
      $: { type: 'holiday' },
      holiday: [{ _: exp.holidays[0].name }],
      start: [t]
    }
  ]
  getXml.mockResolvedValue({ calendar: { item: outRes } })

  expect(await holidaysAndTimeOff(today)).toEqual(exp)

  expect(getXml).toHaveBeenCalledWith(`${BASE_URL}/time_off/whos_out/?end=${t}`)
})
