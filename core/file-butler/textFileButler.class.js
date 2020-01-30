const FileButlerError = require('./fileButlerError.class')
const FileButler = require('core/file-butler/fileButler.class')

const DEFAULT_VALUE = ''

class TextFileButler extends FileButler {
  constructor (options) {
    if (!options) {
      throw new FileButlerError('Missing options')
    }

    options.fileType = 'text'
    options.defaultValue = DEFAULT_VALUE
    options.fileEncoding = 'utf8'
    options.fileReadFlag = 'r'
    options.fileWriteFlag = 'w'
    options.fileMode = 0o666

    options.fileToDataFn = function (data) {
      if (typeof data !== 'string') return DEFAULT_VALUE
      return data
    }

    options.dataToFileFn = function (data) {
      if (typeof data !== 'string') return DEFAULT_VALUE
      return data
    }

    options.validityCheck = function (data) {
      if (typeof data !== 'string') {
        throw new FileButlerError('This data is not valid as text.')
      }
    }

    super(options)
  }
}

module.exports = TextFileButler
