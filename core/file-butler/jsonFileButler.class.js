const FileButlerError = require('./fileButlerError.class')
const FileButler = require('core/file-butler/fileButler.class')

const DEFAULT_VALUE = null

const ENUMS = {
  fileType: {
    json: 'json',
    json_compact: 'json-compact'
  }
}

class JsonFileButler extends FileButler {
  constructor (options) {
    if (!options) {
      throw new FileButlerError('Missing options')
    }

    if (!options.fileType) options.fileType = 'json-compact'

    if (!options.fileType || !Object.values(ENUMS.fileType).includes(options.fileType)) {
      throw new FileButlerError(`'fileType' option must be present and have one of these values: ${Object.values(ENUMS.fileType).join(', ')} .`)
    }

    options.defaultValue = DEFAULT_VALUE
    options.fileEncoding = 'utf8'
    options.fileReadFlag = 'r'
    options.fileWriteFlag = 'w'
    options.fileMode = 0o666

    options.fileToDataFn = function (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        return DEFAULT_VALUE
      }
    }

    options.dataToFileFn = function (data) {
      try {
        if (options.fileType === ENUMS.fileType.json) {
          return JSON.stringify(data, null, '\t')
        } else if (options.fileType === ENUMS.fileType.json_compact) {
          return JSON.stringify(data, null)
        }
      } catch (e) {
        return DEFAULT_VALUE
      }
    }

    options.validityCheck = function (data) {
      if (typeof data !== 'object' || !(data instanceof Object) || data.constructor !== Object) {
        throw new FileButlerError('This data is not valid as json.')
      }
    }

    super(options)
  }
}

module.exports = JsonFileButler
