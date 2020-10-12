const { App } = require('../ui_common')
const { PathQueryAPI } = App

const _renameOrCopy = async function ({ copy, paramQueryLabel, paramNewQueryLabel, cliNext, cliPrinter }) {
  // get paramQueryLabel --> error
  // new label if not exists yet --> error
  // apply new label, remove existing object ??, add new object
  // save --> error
  return cliNext()
}

module.exports = {
  create: async function ({ paramQueryLabel, paramQueryString, cliNext, cliPrinter }) {
    if (PathQueryAPI.add(paramQueryLabel, paramQueryString) !== true) {
      cliPrinter.error('Cannot add the query')
    } else {
      cliPrinter.info('Query added successfully')
      if (await PathQueryAPI.save() !== true) {
        cliPrinter.error(`Cannot save the query file: ${PathQueryAPI.getFilePath()}`)
      }
    }
    return cliNext()
  },

  remove: async function ({ paramQueryLabel, cliNext, cliPrinter }) {
    if (PathQueryAPI.remove(paramQueryLabel) === false) {
      cliPrinter.info(`Query '${paramQueryLabel}' not found or not removed`)
    } else {
      cliPrinter.info(`Query '${paramQueryLabel}' removed successfully`)
      if (await PathQueryAPI.save() !== true) {
        cliPrinter.error(`Cannot save the query file: ${PathQueryAPI.getFilePath()}`)
      }
    }
    return cliNext()
  },

  rename: async function ({ paramQueryLabel, paramNewQueryLabel, cliNext, cliPrinter }) {
    return _renameOrCopy({ copy: false, paramQueryLabel, paramNewQueryLabel, cliNext, cliPrinter })
  },

  copy: async function ({ paramQueryLabel, paramNewQueryLabel, cliNext, cliPrinter }) {
    return _renameOrCopy({ copy: true, paramQueryLabel, paramNewQueryLabel, cliNext, cliPrinter })
  }
}
