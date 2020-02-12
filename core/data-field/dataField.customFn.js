const _ = require('lodash')

const customFn = {}

customFn.array = {}
customFn.array.add = function (field, value, index) {
  const array = field.valueRef
  if (index === undefined) array.push(value)
  else if (index === 0) array.unshift(value)
  else array.splice(Math.min(index, array.length), 0, value)
  field.value = array
}
customFn.array.remove = function (field, value, index) {
  const array = field.valueRef
  if (array.length === 0) return
  if (value) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (array[i] === value) array.splice(i, 1)
    }
  } else if (index !== undefined) {
    if (index === 0) array.shift(value)
    else array.splice(index, 1)
  } else {
    array.pop()
  }
  field.value = array
}

customFn.object = {}
customFn.object.getProp = function (field, key) {
  const obj = field.valueRef
  if (!obj) return null
  return _.cloneDeep(obj[key])
}
customFn.object.setProp = function (field, key, value) {
  let obj = field.value
  if (!obj) obj = {}
  obj[key] = value
  field.value = obj
}
customFn.object.unsetProp = function (field, key) {
  const obj = field.value
  if (!obj) return
  delete obj[key]
  field.value = obj
}

module.exports = {
  customFn
}
