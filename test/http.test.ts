import axios from 'axios'
jest.mock('axios')
import { getJson, getXml, postJson } from '../src/http'

const URL = 'http://www.example.com'
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
  post.mockResolvedValue({ data: DATA })

  expect(await postJson<TType>(URL, DATA)).toBe(DATA)

  expect(post).toHaveBeenCalledWith(URL, JSON.stringify(DATA))
})
