import Redis from 'ioredis'

describe('msetnx', () => {
  it('should batch set values', () => {
    const redis = new Redis()
    return redis
      .msetnx('key1', 'Hello', 'key2', 'World')
      .then(status => {
        return expect(status).toBe(1)
      })
      .then(() => {
        expect(redis.data.get('key1')).toBe('Hello')
        expect(redis.data.get('key2')).toBe('World')
      })
  })

  it('should bail on batch set values if just one key exists', () => {
    const redis = new Redis({
      data: {
        key1: 'Nope',
      },
    })
    return redis
      .msetnx('key1', 'Hello', 'key2', 'World')
      .then(status => {
        return expect(status).toBe(0)
      })
      .then(() => {
        expect(redis.data.get('key1')).toBe('Nope')
        expect(redis.data.has('key2')).toBe(false)
      })
  })
})
