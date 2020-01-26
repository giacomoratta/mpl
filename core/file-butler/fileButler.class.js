const { _ } = require('../utils/lodash.extended')
const { parseOption } = require('./fileButler.utils')
const { FileButlerError } = require('./fileButlerError.class')
const Events = require('events')
const { fileUtils } = require('../utils/file.utils')

const ACCEPTED_EVENTS = ['save', 'load']

class FileButler {
  constructor (options) {
    this.eventEmitter = new Events()
    this.config = parseOption(options)
    this.data = this.config.defaultValue
    this._hasData = false
    // this.load()
  }

  hasData () {
    return this._hasData
  }

  get () {
    return this.data
  }

  set (data) {
    if (this.config.fn.validityCheck(data) !== true) return false
    this.data = _.cloneDeep(data)
    return true
  }

  async delete () {
    return fileUtils.removeFile(this.config.filePath)
  }

  async save () {
    let savedData = this.data
    if (this.config.saveFn) savedData = this.config.saveFn(this.data)
    const saveResult = this.config.fn.saveToFile(this.config.filePath, savedData)
    if (saveResult === true) {
      this.eventEmitter.emit('save', { filePath: this.config.filePath, data: savedData })
      if (this.config.backupTo) {
        try {
          await fileUtils.copyFile(this.config.filePath, this.config.backupTo)
        } catch(copyResult) {
          if (copyResult.err) {
            throw new FileButlerError(`Backup failed! From '${this.config.backupTo}' to ${this.config.backupTo}`)
          }
        }
      }
    }
    return saveResult
  }

  async load () {
    if (this.config.cloneFrom && !await fileUtils.fileExists(this.config.filePath)) {
      try {
        await fileUtils.copyFile(this.config.cloneFrom, this.config.filePath)
      } catch(copyResult) {
        if (copyResult.err) {
          throw new FileButlerError(`Cloning failed! From '${this.config.cloneFrom}' to ${this.config.filePath}`)
        }
      }
    }
    let loadedData = this.config.fn.loadFromFile(this.config.filePath)
    if (this.config.loadFn) loadedData = this.config.loadFn(loadedData)
    this._hasData = !_.isNil(loadedData)
    if (!this._hasData) loadedData = this.config.defaultValue
    this.data = loadedData
    this.eventEmitter.emit('load', { filePath: this.config.filePath, data: loadedData })
    return this._hasData
  }

  on (eventName, cb) {
    if (!ACCEPTED_EVENTS.includes(eventName)) {
      throw new FileButlerError(`Unrecognized event '${eventName}' for ${this.constructor.name}`)
    }
    this.eventEmitter.on(eventName, cb)
  }
}

module.exports = {
  FileButler
}
