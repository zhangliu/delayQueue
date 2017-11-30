/* global describe, it */
const assert = require('assert')
const DelayQueue = require('../../sources')

describe('DelayQueue', () => {
  it('每隔一秒回收到一个消息', done => {
    const duration = 1000
    const queue = new DelayQueue(duration, 3)
    const putTime = Date.now()

    queue.putMessage({ reqId: 1, name: 'zhangliu1' })
    queue.putMessage({ reqId: 2, name: 'zhangliu2' })
    queue.putMessage({ reqId: 3, name: 'zhangliu3' })
    queue.putMessage({ reqId: 4, name: 'zhangliu4' })
    queue.putMessage({ reqId: 5, name: 'zhangliu5' })
    let index = 0

    queue.on('message', message => {
      console.log('获取到消息1：', message)
      assert.equal(message.reqId, ++index)
      const diffOk = Math.abs(Date.now() - putTime - (duration * (index - 1))) < 50
      assert.equal(diffOk, true)
    })

    setTimeout(() => {
      assert.equal(index, 3)
      done()
    }, duration * 6)
  })

  it('前一个消息发送后，隔了1.2秒，来了第二个消息，应该立马发送这个消息', done => {
    const duration = 1000
    const queue = new DelayQueue(duration, 3)
    const putTime = Date.now()

    queue.putMessage({ reqId: 1, name: 'zhangliu1' }) // 第0秒发送
    setTimeout(() => queue.putMessage({ reqId: 2, name: 'zhangliu2' }), duration + 200) // 1.2秒，第1.2秒发送
    setTimeout(() => queue.putMessage({ reqId: 3, name: 'zhangliu3' }), (duration * 2) - 200) // 1.8秒，第2.2秒发送
    setTimeout(() => queue.putMessage({ reqId: 4, name: 'zhangliu4' }), (duration * 2)) // 2秒，第3.2秒发送
    setTimeout(() => queue.putMessage({ reqId: 5, name: 'zhangliu5' }), (duration * 5) + 500) // 5.5秒，第5.5秒发送
    let index = 0

    queue.on('message', message => {
      console.log('获取到消息2：', message)
      assert.equal(message.reqId, ++index)
      console.log(Date.now() - putTime, '----')
      if (message.reqId === 1) {
        assert.equal(Math.abs(Date.now() - putTime) < 50, true)
      }
      if (message.reqId === 2) {
        assert.equal(Math.abs(Date.now() - putTime - duration - 200) < 50, true)
      }
      if (message.reqId === 3) {
        assert.equal(Math.abs(Date.now() - putTime - (2 * duration) - 200) < 50, true)
      }
      if (message.reqId === 4) {
        assert.equal(Math.abs(Date.now() - putTime - (3 * duration) - 200) < 50, true)
      }
      if (message.reqId === 5) {
        assert.equal(Math.abs(Date.now() - putTime - (5 * duration) - 500) < 50, true)
      }
      if (message.reqId === 5) done()
    })
  })
})
