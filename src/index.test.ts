import crypto from 'crypto'

beforeAll(() => {
  vi.stubGlobal('crypto', crypto)
})

describe('skaizarazcustom', () => {
  it('example test', () => {
    expect(true).toEqual(true)
  })
})
