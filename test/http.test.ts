import axios from 'axios'
jest.mock('axios')
import { getJson, getXml, postMsg } from '../src/http'
import { SlackMsg } from '../src'

const URL = 'https://www.example.com'
const DATA = { name: 'my-name' }
const get = axios.get as jest.Mock
const post = axios.post as jest.Mock

interface TType {
  name: string
}

test('getJson', async () => {
  get.mockResolvedValue({ data: DATA })

  expect(await getJson<TType>(URL)).toBe(DATA)
})

test('getXml', async () => {
  get.mockResolvedValue({ data: `<?xml version="1.0"?><name>my-name</name>` })

  expect(await getXml<TType>(URL)).toEqual(DATA)
})

test('publish', async () => {
  const req = { text: 'hi', attachments: [] } as SlackMsg
  post.mockResolvedValue({ data: DATA })

  await postMsg(URL, req)

  expect(post).toHaveBeenCalledWith(URL, JSON.stringify(req))
})
