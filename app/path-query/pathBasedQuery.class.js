const _ = require('lodash')
const { codeUtils } = require('../../core/utils/code.utils')

const removeEmptyArrayStringItems = function (array) {
  for (let i = array.length - 1; i >= 0; i--) {
    array[i] = array[i].trim()
    if (array[i].length === 0) array.splice(i, 1)
  }
}

const processQueryString = function (queryString) {
  queryString = queryString.toString().toLowerCase().replace(/[^a-zA-Z0-9+,]/g, '')

  const queryInfo = {
    label: '',
    functionBody: '',
    queryString: '',
    checkFn: null,
    _linesOR: [],
    _functionLinesOR: []
  }

  /* Split OR conditions */
  const queryOR = _.split(queryString, ',')
  if (!(queryOR instanceof Array) || queryOR.length === 0) return null
  removeEmptyArrayStringItems(queryOR)
  if (queryOR.length === 0) return null

  /* Composing function code */
  queryOR.forEach(function (lineOR, i1, a1) {
    const queryAND = lineOR.split('+')
    removeEmptyArrayStringItems(queryAND)
    if (queryAND.length === 0) return null

    queryInfo._linesOR.push(queryAND.join('+'))
    queryInfo._functionLinesOR.push(`if ( s.indexOf('${queryAND.join('\')>=0 && s.indexOf(\'')}')>=0 ) return true;`)
  })
  queryInfo._functionLinesOR.push('return false;')

  queryInfo.queryString = queryInfo._linesOR.join(',')
  if (queryInfo.queryString.length < 2) return null

  queryInfo.functionBody = `const s = v.toLowerCase(); ${queryInfo._functionLinesOR.join(' ')}`
  queryInfo.checkFn = codeUtils.createFunction('v', queryInfo.functionBody)

  delete queryInfo._linesOR
  delete queryInfo._functionLinesOR

  queryInfo.label = PathBasedQuery.generateQueryStringLabel(queryInfo.queryString)
  return queryInfo
}

class PathBasedQuery {
  constructor (queryString) {
    this.check = null

    this._label = null
    this._functionBody = null
    this._queryString = null

    if (queryString) {
      const queryInfo = processQueryString(queryString)
      if (!queryInfo) return
      this._label = queryInfo.label
      this._functionBody = queryInfo.functionBody
      this._queryString = queryInfo.queryString
      this.check = queryInfo.checkFn
    }
  }

  isValid () {
    return this._label !== null
  }

  isEqualTo (obj) {
    return this._queryString === obj._queryString
  }

  static generateQueryStringLabel (queryString) {
    return queryString.toString().toLowerCase()
      .replace(/[^a-zA-Z0-9+,]/g, '')
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .trim()
      .replace(/[ ]{1,}/g, '_')
  }

  get label () { return this._label }
  set label (label) { this._label = label }
  get queryString () { return this._queryString }

  clone () {
    const clonedPathBasedQuery = new this.constructor()
    clonedPathBasedQuery._label = this._label
    clonedPathBasedQuery._functionBody = this._functionBody
    clonedPathBasedQuery._queryString = this._queryString
    clonedPathBasedQuery.check = codeUtils.createFunction('v', this._functionBody)
    return clonedPathBasedQuery
  }

  fromJson (jsonData) {
    this._label = null
    if (!jsonData.label || !jsonData.queryString) return false
    if (!jsonData.functionBody) {
      const queryInfo = processQueryString(jsonData.queryString)
      if (!queryInfo) return false
      this._queryString = queryInfo.queryString
      this._functionBody = queryInfo.functionBody
      this.check = queryInfo.checkFn
    } else {
      this._queryString = jsonData.queryString
      this._functionBody = jsonData.functionBody
      this.check = codeUtils.createFunction('v', this._functionBody)
    }
    this._label = jsonData.label
    return true
  }

  toJson () {
    const jsonData = {}
    jsonData.label = this._label
    jsonData.functionBody = this._functionBody
    jsonData.queryString = this._queryString
    return jsonData
  }
}

module.exports = {
  PathBasedQuery
}
