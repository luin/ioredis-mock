import Redis from 'ioredis'

// eslint-disable-next-line import/no-relative-parent-imports
import { runTwinSuite } from '../../../test-utils'

runTwinSuite('psubscribe', command => {
  describe(command, () => {
    it('should return number of subscribed channels', () => {
      const redis = new Redis()
      return redis[command]('news.*', 'music.*').then(subNum => {
        return expect(subNum).toBe(2)
      })
    })

    it('should return number of subscribed channels when calling subscribe twice', () => {
      const redis = new Redis()
      return redis[command]('first.*')
        .then(subNum => {
          return expect(subNum).toBe(1)
        })
        .then(() => {
          return redis[command]('second.*').then(subNum => {
            return expect(subNum).toBe(2)
          })
        })
    })

    it('should not incremented number of subscribed channels when subscribing to same channel multiple times', () => {
      const redis = new Redis()
      return redis[command]('channel.*')
        .then(subNum => {
          return expect(subNum).toBe(1)
        })
        .then(() => {
          return redis[command]('channel.*').then(subNum => {
            return expect(subNum).toBe(1)
          })
        })
    })

    it('should reject non-subscribe commands when having at least one open subscription', () => {
      const redis = new Redis()
      return redis[command]('channel').then(() => {
        return redis
          .get('key')
          .then(() => {
            throw new Error('get should fail when in subscriber mode')
          })
          .catch(error => {
            return expect(error.message).toBe(
              'Connection in subscriber mode, only subscriber commands may be used'
            )
          })
      })
    })

    it('should allow multiple instances to subscribe to the same channel', () => {
      const redisOne = new Redis()
      const redisTwo = new Redis()

      return Promise.all([
        redisOne[command]('first.*', 'second.*'),
        redisTwo[command]('first.*'),
      ]).then(([oneResult, twoResult]) => {
        expect(oneResult).toEqual(2)
        expect(twoResult).toEqual(1)
        let promiseOneFulfill
        let PromiseTwoFulfill
        const promiseOne = new Promise(f => {
          promiseOneFulfill = f
        })
        const promiseTwo = new Promise(f => {
          PromiseTwoFulfill = f
        })

        redisOne.on('pmessage', promiseOneFulfill)
        redisTwo.on('pmessage', PromiseTwoFulfill)

        redisOne.duplicate().publish('first.test', 'blah')

        return Promise.all([promiseOne, promiseTwo])
      })
    })

    it('should toggle subscriberMode correctly', () => {
      const redis = new Redis()
      return redis[command]('test.*')
        .then(() => {
          expect(redis.subscriberMode).toBe(true)
          return redis.punsubscribe('test.*')
        })
        .then(() => {
          expect(redis.subscriberMode).toBe(false)
          // this next part is just to make sure our tests go through the code path
          // where we have had subscriptions but currently have none
          return redis[command]()
        })
    })
  })
})
