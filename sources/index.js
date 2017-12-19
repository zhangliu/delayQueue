const EventEmitter = require('events')

class DelayQueue extends EventEmitter {
  constructor (delayTime, limitNum) {
    super()
    this.limitNum = +limitNum || 0
    this.delayTime = +delayTime || 0
    this.sendTime = 0
    this.delayMessages = []
  }

  putMessage (message) {
    if (this.delayMessages.length >= this.limitNum) return false
    this.delayMessages.push(message)
    if (!this.timer) {
      const diffTime = Date.now() - this.sendTime
      const delayTime = this.delayTime - diffTime
      this.timer = this.handleMessage(delayTime > 0 ? delayTime : 0)
    }
    return true
  }

  handleMessage (delayTime) {
    return setTimeout(() => {
      const messages = this.delayMessages
      if (messages.length <= 0) {
        clearTimeout(this.timer)
        this.timer = undefined
        return
      }
      const message = messages.shift()
      if (message) {
        this.sendTime = Date.now()
        this.emit('message', message)
      }
      this.timer = this.handleMessage(this.delayTime)
    }, delayTime)
  }
}

module.exports = DelayQueue
