const _ = require('lodash')
const utils = require('./utils')
const { PathInfoBase } = require('./pathInfoBase.class')

class PathInfo extends PathInfoBase {
  async set ({ absolutePath, relRootPath }) {
    this.info = null

    const pInfo = utils.checkParameters({ absolutePath, relRootPath })
    if (!pInfo) return false

    const pStats = await utils.lstat(absolutePath)
    if (!pStats) return false

    if (!utils.setBasicPathInfo({ pInfo, pStats, absolutePath })) return false
    this.info = pInfo

    if (_.isString(relRootPath)) this.relRoot = relRootPath
    return true
  }
}

module.exports = {
  PathInfo
}
