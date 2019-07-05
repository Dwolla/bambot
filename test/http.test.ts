import axios from "axios"
jest.mock("axios")
import { SlackMsg } from "../src"
import { getJson, getXml, postMsg } from "../src/http"

const URL = "https://www.example.com"
const DATA = { name: "my-name" }
const get = axios.get as jest.Mock
const post = axios.post as jest.Mock

interface IType {
  name: string
}

test("getJson", async () => {
  get.mockResolvedValue({ data: DATA })

  expect(await getJson<IType>(URL)).toBe(DATA)
})

test("getXml", async () => {
  get.mockResolvedValue({ data: `<?xml version="1.0"?><name>my-name</name>` })

  expect(await getXml<IType>(URL)).toEqual(DATA)
})

test("publish", async () => {
  const req = { text: "hi", attachments: [] } as SlackMsg
  post.mockResolvedValue({ data: DATA })

  await postMsg(URL, req)

  expect(post).toHaveBeenCalledWith(URL, JSON.stringify(req))
})
