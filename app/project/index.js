const config = require('../config').API.config
const { Project } = require('./project.class')
const { ProjectHistoryFile } = require('./projectHistoryFile.class')
const log = require('../../core/logger').createLogger('project')

let ProjectHistoryFileInstance = null

const boot = async (filePath) => {
  log.info('Booting...')
  try {
    ProjectHistoryFileInstance = new ProjectHistoryFile(filePath)
    const dataPresence = await ProjectHistoryFileInstance.fileHolder.load()
    log.info({ dataPresence }, 'History loaded successfully')
    // todo: remove all invalid projects (not exists)
    return true
  } catch (e) {
    log.error(e, 'Cannot load history')
    return false
  }
}

const clean = async () => {
  log.info('Cleaning data...')
  if (!ProjectHistoryFileInstance) return
  try {
    ProjectHistoryFileInstance.collection.clean()
    return await ProjectHistoryFileInstance.fileHolder.delete()
  } catch (e) {
    log.error(e, 'Error while cleaning history')
    return false
  }
}

module.exports = {
  boot,
  clean,

  API: {
    projectManager: {
      /* ! Do not allow to delete directories ! */

      // todo: create: ({ projectPath }) => {
      // create a new project directory if not exists
      // projectObj can be template
      // },

      // todo: createSibling: ({ projectPath }) => {
      // create a new project directory if not exists
      // projectObj can be template
      // },

      duplicate: ({ srcPath, srcObj, dstPath, dstObj, waitFn, requestOnly = false }) => {
        // create a new project directory if not exists
        // check source exists
        // copy source to projectPath
        // todo: projectObj can be template
      },

      getCurrentProject: () => {
        return ProjectHistoryFileInstance.collection.latest
      },

      setCurrentProject: async ({ projectObj, projectPath }) => {
        try {
          if (projectPath) {
            projectObj = new Project()
            await projectObj.set(projectPath)
          }
          const result = ProjectHistoryFileInstance.collection.add(projectObj)
          if (result !== true) return result
          await ProjectHistoryFileInstance.fileHolder.save()
          return result
        } catch (error) {
          log.error({ error, projectObj, projectPath }, 'Cannot set the current project')
          return error
        }
      }
    },

    projectHistory: {
      get: (index) => {
        return ProjectHistoryFileInstance.collection.get(index)
      },

      latest: () => {
        return ProjectHistoryFileInstance.collection.latest
      },

      list: ({ orderBy = 'history' } = {}) => {
        const array = []
        ProjectHistoryFileInstance.collection.forEach((index, projectObj) => {
          array.push(projectObj)
        })
        if (array.length > 0) {
          orderBy === 'name' && array.sort((a, b) => { /* ASC */
            if (a.name < b.name) return -1
            if (a.name > b.name) return 1
            return 0
          })
          orderBy === 'modifiedAt' && array.sort((a, b) => { /* DESC */
            if (a.modifiedAt > b.modifiedAt) return -1
            if (a.modifiedAt < b.modifiedAt) return 1
            return 0
          })
        }
        return array
      }
    },

    projectTemplate: {
      list: () => {
        if (config.field('TemplatesDirectory').unset !== false || config.field('TemplatesDirectory').fn.exists() !== true) {
          return
        }
        const array = []
        // todo
        return array
      }
    }
  }
}
