const path = require('path')
const { fileUtils } = require('../../core/utils/file.utils')

const { PathInfo } = require('../../core/path-info')
const { ProjectError } = require('./project.error')

class Project {
  constructor () {
    this._pathInfo = new PathInfo()
  }

  get name () {
    return this._pathInfo.name
  }

  get path () {
    return this._pathInfo.path
  }

  get parentPath () {
    return this._pathInfo.dir
  }

  get modifiedAt () {
    return this._pathInfo.modifiedAt
  }

  /**
   * Set the project object by its path (and it must exist!)
   * @param {string} projectPath
   * @throws {PathInfoError, ProjectError}
   * @returns {Promise<boolean>}
   */
  async set (projectPath) {
    if (await this._pathInfo.set({ absolutePath: projectPath }) !== true) {
      throw new ProjectError(`Cannot set ${projectPath} as project path.`)
    }
    if (!this._pathInfo.isDirectory) {
      throw new ProjectError(`Project is not a directory: ${projectPath}`)
    }
    return true
  }

  /**
   * Create a new project (if it does not exist)
   * @param {string} projectPath
   * @returns {Promise<boolean>}
   */
  async create (projectPath) {
    // todo
    // check absolute path
    // create if not exists
    // this.set
  }

  /**
   * Gets an array of projects in the same parent directory; returns the failed paths too.
   * @param {string} orderBy
   * @returns {Promise<{ projects:[], failed:[] }>}
   */
  async getSiblings ({ orderBy = 'name' } = {}) {
    if (!this.isValid()) {
      throw new ProjectError('Project is not a valid object')
    }
    return Project.projectsFromDirectory({ projectsPath: this.parentPath, orderBy })
  }

  isValid () {
    return this._pathInfo !== null && this._pathInfo.isSet() === true
  }

  isEqualTo (obj) {
    return this._pathInfo.isEqualTo(obj._pathInfo)
  }

  fromJson (data) {
    this._pathInfo.fromJson(data.pathInfo)
  }

  toJson () {
    return {
      pathInfo: this._pathInfo.toJson()
    }
  }

  /**
   * Gets an array of projects in the same parent directory; returns the failed paths too.
   * @param {string} projectsPath
   * @param {string} orderBy
   * @returns {Promise<{ projects:[], failed:[] }>}
   */
  static async projectsFromDirectory ({ projectsPath, orderBy = 'name' }) {
    const projects = []
    const failed = []
    await fileUtils.readDirectory(projectsPath, null, async (item) => {
      const tempObj = new Project()
      const tempObjPath = path.join(projectsPath, item)
      try {
        await tempObj.set(tempObjPath)
        projects.push(tempObj)
      } catch (e) {
        failed.push({
          path: tempObjPath,
          error: e.message
        })
      }
    })

    if (projects.length > 0 || orderBy !== 'name') {
      orderBy === 'modifiedAt' && projects.sort((a, b) => { /* DESC */
        if (a.modifiedAt > b.modifiedAt) return -1
        if (a.modifiedAt < b.modifiedAt) return 1
        return 0
      })
    }

    return {
      projects,
      failed
    }
  }
}

module.exports = {
  Project
}
