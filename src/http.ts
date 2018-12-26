import axios from 'axios'
// @ts-ignore
import xml2js from 'xml2js-es6-promise'

export async function getXml<T>(url: string): Promise<T> {
  return xml2js((await axios.get(url)).data)
}

export async function getJson<T>(url: string): Promise<T> {
  return (await axios.get(url, { headers: { Accept: 'application/json' } }))
    .data
}

export async function postJson<T>(url: string, data: T): Promise<T> {
  return (await axios.post<T>(url, JSON.stringify(data))).data
}
