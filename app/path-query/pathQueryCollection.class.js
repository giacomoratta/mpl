const { JsonCollectionFile } = require('../../core/file-butler/jsonCollectionFile.class')
const { PathBasedQuery } = require('./pathBasedQuery.class')

class PathQueryCollection extends JsonCollectionFile {
  constructor (filePath) {
    super({
      filePath,
      orderType: 'ASC',
      collectionType: 'object',
      checkFn: (obj) => {
        if (!(obj instanceof PathBasedQuery)) {
          throw new TypeError('pathBasedQueryObject should be an instance of PathBasedQuery class')
        }
        return obj.isValid()
      }
    })
  }

  fromJson (jsonData) {
    const obj = new PathBasedQuery()
    obj.fromJson(jsonData)
    return obj
  }

  toJson (obj) {
    return obj.toJson()
  }
}

module.exports = {
  PathQueryCollection
}
