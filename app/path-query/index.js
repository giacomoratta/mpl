const { PathQueryFile } = require('./pathQueryFile.class')
const { PathBasedQuery } = require('./pathBasedQuery.class')
const { SpheroidList } = require('../../core/spheroid-list')
const log = require('../../core/logger').createLogger('path-query')

const PathBasedQueryCache = new SpheroidList({ maxSize: 30 })
let PathQueryFileInstance = null

const boot = async (filePath) => {
  log.info(`Booting from ${filePath}...`)
  try {
    PathQueryFileInstance = new PathQueryFile(filePath)
    const dataPresence = await PathQueryFileInstance.fileHolder.load()
    log.info({ dataPresence }, 'Loaded successfully')
    return true
  } catch (e) {
    log.error(e, 'Cannot load')
    return false
  }
}

const clean = async () => {
  log.info('Cleaning data...')
  if (!PathQueryFileInstance) return
  try {
    PathQueryFileInstance.collection.clean()
    return await PathQueryFileInstance.fileHolder.delete()
  } catch (e) {
    log.error(e, 'Error while cleaning')
    return false
  }
}

module.exports = {
  boot,
  clean,

  API: {
    pathQuery: {

      getFilePath: () => {
        return PathQueryFileInstance.fileHolder.path
      },

      add: (label, queryString) => {
        const pathQueryObj = new PathBasedQuery(queryString)
        if (!pathQueryObj.isValid()) {
          log.warn({ label, queryString }, 'Invalid path-query')
          return false
        }
        pathQueryObj.label = label
        return PathQueryFileInstance.collection.add(label, pathQueryObj)
      },

      remove: (label) => {
        log.info({ label }, 'Removing path-query')
        return PathQueryFileInstance.collection.remove(label)
      },

      get: (label) => {
        return PathQueryFileInstance.collection.get(label)
      },

      has: (label) => {
        return PathQueryFileInstance.collection.has(label)
      },

      list: () => {
        const array = []
        PathQueryFileInstance.collection.forEach((label, pathQuery) => {
          array.push(pathQuery)
        })
        return array
      },

      save: async () => {
        try {
          const saveResult = await PathQueryFileInstance.fileHolder.save()
          log.info({ saveResult }, `Save file in ${PathQueryFileInstance.fileHolder.path}`)
          return true
        } catch (e) {
          log.error(e, `Error while saving in ${PathQueryFileInstance.fileHolder.path}`)
          return false
        }
      },

      create: (queryString) => {
        const queryStringLabel = PathBasedQuery.generateQueryStringLabel(queryString)
        if (PathBasedQueryCache.has(queryStringLabel)) {
          const pathQueryObj = PathBasedQueryCache.get(queryStringLabel)
          log.info({ label: pathQueryObj.label, queryString: pathQueryObj.queryString }, 'Found object in cache')
          return pathQueryObj.clone()
        }
        const pathQueryObj = new PathBasedQuery(queryString)
        if (!pathQueryObj.isValid()) {
          log.warn({ queryString }, 'Invalid query string')
          return null
        }
        PathBasedQueryCache.add(queryStringLabel, pathQueryObj)
        log.info({ label: pathQueryObj.label, queryString: pathQueryObj.queryString }, 'New object created')
        return pathQueryObj
      },

      generateQueryStringLabel: PathBasedQuery.generateQueryStringLabel
    }
  }
}
