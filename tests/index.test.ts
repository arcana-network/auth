import { computeAddress } from '../src/index'

const sampleData = {
  publicKey:
    '04cc504a24449804fbe5c239020e81b992afec553d01367683dfe07b362b646a25cd85452d5d6e822ded84f507e1bfeb2165f2de82249800f55b9236cc985ed1d0',
  address: '0xDcCbC66205fe3CABeECA9ae0649FE3857c675beB',
}
describe('index.ts', () => {
  test('computeAddress', () => {
    const addr = computeAddress(sampleData.publicKey)
    expect(addr).toBe(sampleData.address)
  })
})
