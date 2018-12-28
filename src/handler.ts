import { error } from '@therockstorm/utils'
import { Callback, Context, Handler, ScheduledEvent } from 'aws-lambda'
import { EmpMap } from './index'
import dayjs from 'dayjs'
import { employees, holidaysAndTimeOff } from './fetcher'
import { celebrations, holidays, timeOff } from './publisher'

process.on('unhandledRejection', e => error('unhandledRejection', e))

export const handle: Handler = async (
  _1: ScheduledEvent & EmpMap,
  _2: Context,
  cb: Callback
) => {
  try {
    const today = dayjs().startOf('day')
    const [es, hto] = await Promise.all([
      employees(),
      holidaysAndTimeOff(today)
    ])
    await Promise.all([
      holidays(hto.holidays, today),
      timeOff(es, hto.timeOff, hto.holidays, today),
      celebrations(es, today)
    ])
    return cb(null, { success: true })
  } catch (e) {
    error(e)
    return cb(e)
  }
}
