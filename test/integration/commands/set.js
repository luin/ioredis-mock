import Redis from 'ioredis'

describe('set', () => {
  it('should return OK when setting a hash key', () => {
    const redis = new Redis()
    return redis
      .set('foo', 'bar')
      .then(status => {
        return expect(status).toBe('OK')
      })
      .then(() => {
        return expect(redis.data.get('foo')).toBe('bar')
      })
  })

  it('should turn number to string', () => {
    const redis = new Redis()
    return redis
      .set('foo', 1.5)
      .then(status => {
        return expect(status).toBe('OK')
      })
      .then(() => {
        return expect(redis.data.get('foo')).toBe('1.5')
      })
  })

  it('should set empty value if null', () => {
    const redis = new Redis()
    return redis
      .set('foo', null)
      .then(status => {
        return expect(status).toBe('OK')
      })
      .then(() => {
        expect(redis.data.get('foo')).toBe('')
      })
  })

  it('should set value and expire', () => {
    const redis = new Redis()
    return redis
      .set('foo', 'bar', 'EX', 1)
      .then(status => {
        return expect(status).toBe('OK')
      })
      .then(() => {
        expect(redis.data.get('foo')).toBe('bar')
        expect(redis.expires.has('foo')).toBe(true)
      })
  })

  it('should throw an exception if both NX and XX are specified', () => {
    const redis = new Redis()

    return redis.set('foo', 1, 'NX', 'XX').catch(err => {
      return expect(err.message).toBe('ERR syntax error')
    })
  })

  it('should return null if XX is specified and the key does not exist', () => {
    const redis = new Redis()

    return redis.set('foo', 1, 'XX').then(result => {
      return expect(result).toBe(null)
    })
  })

  it('should return null if NX is specified and the key already exists', () => {
    const redis = new Redis({
      data: {
        foo: 'bar',
      },
    })

    return redis.set('foo', 1, 'NX').then(result => {
      return expect(result).toBe(null)
    })
  })
})
