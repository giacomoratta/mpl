const _ = require('lodash')
const FileButlerError = require('./fileButlerError.class')
const { fileUtils } = require('../utils/file.utils')

class FileButler {
  constructor (options) {
    if (new.target === FileButler) {
      throw new FileButlerError('Cannot construct FileButler instances directly')
    }

    this._config = {}
    this._parseOptions(options)
    this._hasData = false
    this._currentFileHasData = false
    this._data = this._config.defaultValue
  }

  get path () {
    return this._config.filePath
  }

  get data () {
    return this._data
  }

  set data (data) {
    return this._setData(data)
  }

  get empty () {
    return !this._hasData
  }

  async exists () {
    try {
      return await this._fileExists(this._config.filePath)
    } catch (e) {
      return false
    }
  }

  clean () {
    this._data = this._config.defaultValue
    this._hasData = false
  }

  async delete () {
    if ((await this._fileExists(this._config.filePath)) === true) {
      if ((await this._removeFile(this._config.filePath)) !== true) return false
    }
    this._data = this._config.defaultValue
    this._hasData = false
    return true
  }

  _setData (data, doNotClone = false) {
    if (this._config.validityCheck(data) !== true) return this._hasData
    this._hasData = !this._config.emptyCheck(data)
    if (!this._hasData) this._data = this._config.defaultValue
    else this._data = (doNotClone === true ? data : _.cloneDeep(data))
    return this._hasData
  }

  _parseOptions (options) {
    options = {

      /* Required */
      filePath: null,
      defaultValue: null,
      validityCheck: null,
      emptyCheck: null,
      fileToDataFn: null,
      dataToFileFn: null,

      /* Optionals */
      loadFn: null,
      saveFn: null,
      cloneFrom: null,
      backupTo: null,

      /* File properties */
      fileEncoding: 'utf8',
      fileReadFlag: 'r',
      fileWriteFlag: 'w',
      fileMode: 0o666,

      ...options
    }

    if (!options.filePath) {
      throw new FileButlerError('Missing \'filePath\' option.')
    }
    if (!this._isAbsolutePath(options.filePath)) {
      throw new FileButlerError(`'filePath' option must be an absolute path: ${options.filePath} .`)
    }

    if (options.defaultValue === undefined) {
      throw new FileButlerError('Missing \'defaultValue\' option.')
    }

    if (!_.isFunction(options.validityCheck)) {
      throw new FileButlerError('\'validityCheck\' option is required and must be a function.')
    }

    if (!_.isFunction(options.emptyCheck)) {
      throw new FileButlerError('\'emptyCheck\' option is required and must be a function.')
    }

    if (!options.fileToDataFn || !_.isFunction(options.fileToDataFn)) {
      throw new FileButlerError('\'fileToDataFn\' option is required and must be a function.')
    }

    if (!options.dataToFileFn || !_.isFunction(options.dataToFileFn)) {
      throw new FileButlerError('\'dataToFileFn\' option is required and must be a function.')
    }

    if (options.cloneFrom && !this._isAbsolutePath(options.cloneFrom)) {
      throw new FileButlerError(`'cloneFrom' option must be an absolute path: ${options.cloneFrom} .`)
    }

    if (options.backupTo && !this._isAbsolutePath(options.backupTo)) {
      throw new FileButlerError(`'backupTo' option must be an absolute path: ${options.backupTo} .`)
    }

    if (options.loadFn && !_.isFunction(options.loadFn)) {
      throw new FileButlerError('\'loadFn\' option must be a function.')
    }

    if (options.saveFn && !_.isFunction(options.saveFn)) {
      throw new FileButlerError('\'saveFn\' option must be a function.')
    }

    this._config = options
  }

  _isAbsolutePath (pathString) {
    return fileUtils.isAbsolutePath(pathString)
  }

  _fileExists (pathString) {
    return fileUtils.fileExists(pathString)
  }

  _copyFile (pathFrom, pathTo, options) {
    return fileUtils.copyFile(pathFrom, pathTo, options)
  }

  _removeFile (pathString) {
    return fileUtils.removeFile(pathString)
  }

  _readFile (pathString, encoding, flag) {
    return fileUtils.readFile(pathString, encoding, flag)
  }

  _writeFile (fileData, pathString, encoding, flag, mode) {
    return fileUtils.writeFile(pathString, fileData, encoding, flag, mode)
  }

  async load () {
    /* clone file */
    if (this._config.cloneFrom && (await this._fileExists(this._config.cloneFrom)) === true) {
      await this._copyFile(this._config.cloneFrom, this._config.filePath)
    }

    /* read file */
    let fileData = this._config.defaultValue
    if ((await this._fileExists(this._config.filePath)) === true) {
      fileData = await this._readFile(this._config.filePath, this._config.fileEncoding, this._config.fileReadFlag)
    }

    /* file content to data */
    const fileToDataFnResult = this._config.fileToDataFn(fileData)
    if (fileToDataFnResult instanceof Promise) fileData = await fileToDataFnResult
    else fileData = fileToDataFnResult

    /* post-process file data and set internal data */
    if (this._config.loadFn) {
      const loadFnResult = this._config.loadFn(fileData)
      if (loadFnResult instanceof Promise) fileData = await loadFnResult
      else fileData = loadFnResult
    }
    this._currentFileHasData = this._setData(fileData, true)

    /* return the presence of data */
    return this._currentFileHasData
  }

  async save () {
    /* backup file before saving */
    if (this._currentFileHasData === true && this._config.backupTo && (await this._fileExists(this._config.filePath)) === true) {
      await this._copyFile(this._config.filePath, this._config.backupTo)
    }

    /* pre-process file data and set internal data */
    let fileData = this.data
    if (this._config.saveFn) {
      const saveFnResult = this._config.saveFn(fileData)
      if (saveFnResult instanceof Promise) fileData = await saveFnResult
      else fileData = saveFnResult
    }
    this._currentFileHasData = this._setData(fileData, true)

    /* save empty file */
    if (this._currentFileHasData === false) {
      await this._writeFile('', this._config.filePath, this._config.fileEncoding, this._config.fileWriteFlag, this._config.fileMode)
      return false
    }

    /* data to specific file content and save */
    const dataToFileFnResult = this._config.dataToFileFn(fileData)
    if (dataToFileFnResult instanceof Promise) fileData = await dataToFileFnResult
    else fileData = dataToFileFnResult
    await this._writeFile(fileData, this._config.filePath, this._config.fileEncoding, this._config.fileWriteFlag, this._config.fileMode)

    /* return the presence of data */
    return this._currentFileHasData
  }
}

module.exports = FileButler
