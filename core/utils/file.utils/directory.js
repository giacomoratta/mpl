const { _ } = require('../lodash.extended')
const fs = require('fs')
const fsExtra = require('fs-extra')
const rimraf = require('rimraf') /* A "rm -rf" util for nodejs */

const libUtils = {}

libUtils.directoryExists = (pathString) => { // = libUtils.fileExists
  return new Promise((resolve) => {
    fs.access(pathString, fs.constants.F_OK, (error) => {
      if (!error) return resolve(true)
      return resolve(false)
    })
  })
}

libUtils.getPathStatsSync = (pathString) => {
  // usage: isDirectory, isFile
  try {
    return fs.lstatSync(pathString)
  } catch (e) {
    // console.error(e)
  }
}

libUtils.ensureDir = async (pathString) => {
  try {
    return !!fsExtra.ensureDir(pathString)
  } catch (e) {
    return e
  }
}

libUtils.removeDir = async (pathString) => {
  return new Promise(function (resolve, reject) {
    rimraf(pathString, (err) => {
      if (err) return resolve(err)
      resolve(true)
    })
  })
}

libUtils.copyDirectory = (pathFrom, pathTo, options) => {
  options = _.merge({
    overwrite: false,
    errorOnExist: false
  }, options)
  return new Promise(function (resolve) {
    const result = {
      err: null,
      pathFrom: pathFrom,
      pathTo: pathTo
    }
    fsExtra.copy(pathFrom, pathTo, options, function (err) {
      if (err) {
        result.err = err
        // console.log(result)
        return resolve(result)
      }
      return resolve(result)
    })
  })
}

libUtils.readDirectory = async function (pathString, preProcessItemsFn, itemFn) {
  return new Promise((resolve) => {
    if (!itemFn) itemFn = async function () {}
    if (!preProcessItemsFn) preProcessItemsFn = function () {}
    fs.readdir(pathString, async (err, items) => {
      if (err || !items) {
        resolve(null)
      }
      preProcessItemsFn(items)
      for (let i = 0; i < items.length; i++) {
        await itemFn(items[i], i, items)
      }
      resolve(items)
    })
  })
}

module.exports = libUtils
