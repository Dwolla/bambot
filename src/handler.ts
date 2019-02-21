import { error } from '@therockstorm/utils'
import { Handler } from 'aws-lambda'
import dayjs from 'dayjs'
import 'source-map-support/register'
import { employees, holidaysAndTimeOff } from './fetcher'
import { toEmployees } from './mapper'
import { holidays, timeOffAndCelebrations } from './publisher'

export const handle: Handler = async () => {
  try {
    const today = dayjs().startOf('day')
    const [es, wo] = await Promise.all([employees(), holidaysAndTimeOff(today)])
    await Promise.all([
      timeOffAndCelebrations(toEmployees(es, wo, today), today),
      holidays(wo.holidays, today)
    ])
    return { success: true }
  } catch (e) {
    error(e)
    throw e
  }
}
