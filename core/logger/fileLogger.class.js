const path = require('path')
const fs = require('fs')
const fsExtra = require('fs-extra')
const childProcess = require('child_process')
const stream = require('stream')
const pino = require('pino')
const pinoTeeReq = require.resolve('pino-tee')

class FileLogger {
  constructor ({ logsDirPath, minLevel = 10, maxFiles = 10 }) {
    this.mainLogFile = logsDirPath ? path.join(logsDirPath, `${this._generateFileName()}.log`) : null // todo: add date to filename
    logsDirPath && fsExtra.ensureDir(logsDirPath)

    logsDirPath && this._removeOldLogFiles({ logsDirPath, maxFiles })
    this._init({ minLevel })
  }

  _init ({ minLevel }) {
    this.logThrough = new stream.PassThrough()
    this.log = pino({
      // name: 'project',
      // prettyPrint: { colorize: true },
      level: minLevel,
      base: {}
    }, this.logThrough)

    // Log to multiple files using a separate process
    this.childProcess = childProcess.spawn(process.execPath, [
      pinoTeeReq,
      'trace', this.mainLogFile
      // 'info', `${logPath}/info.log`,
      // 'warn', `${logPath}/warn.log`,
      // 'error', `${logPath}/error.log`,
      // 'fatal', `${logPath}/fatal.log`
    ], {
      cwd: process.cwd(),
      env: process.env
    })

    this.logThrough.pipe(this.childProcess.stdin)
  }

  _generateFileName () {
    const d = new Date()
    return [
      d.getFullYear().toString(),
      (d.getMonth() + 1).toString().padStart(2, '0'),
      d.getDate().toString().padStart(2, '0'),
      'H',
      d.getHours().toString().padStart(2, '0')
      // d.getMinutes().toString().padStart(2, '0')
    ].join('')
  }

  _removeOldLogFiles ({ logsDirPath, maxFiles }) {
    fs.readdir(logsDirPath, async (err, items) => {
      if (err || !items || items.length < maxFiles) return
      items.sort((a, b) => {
        return b.localeCompare(a)
      })
      items = items.slice(maxFiles)
      for (let i = 0; i < items.length; i++) {
        fs.unlink(path.join(logsDirPath, items[i]), () => {})
      }
    })
  }

  child ({ module }) {
    return this.log.child({ module })
  }

  kill () {
    // this.childProcess.kill('SIGINT')
    this.logThrough.end()
  }
}

module.exports = {
  FileLogger
}
