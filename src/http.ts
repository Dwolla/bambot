import axios from 'axios'
// @ts-ignore
import xml2js from 'xml2js-es6-promise'
import { SlackMsg } from '.'

export async function getXml<T>(url: string): Promise<T> {
  return xml2js((await axios.get(url)).data)
}

export async function getJson<T>(url: string): Promise<T> {
  return (await axios.get(url, { headers: { Accept: 'application/json' } }))
    .data
}

export async function postMsg(url: string, msg: SlackMsg): Promise<void> {
  if (!msg.text) return Promise.resolve()
  await axios.post(url, JSON.stringify(msg))
}
