const Events = require('events')
const validator = require('./validator')
const DataFieldError = require('./dataField.error')
const transform = require('./transform')
const _ = require('../utils/lodash.extended')
const dataFieldUtils = require('./utils')

const ACCEPTED_EVENTS = ['change']

/* schema docs: https://www.npmjs.com/package/fastest-validator */

class DataField {
  constructor ({ name, schema, value }) {
    this.name = name
    this.eventEmitter = new Events()
    schema = dataFieldUtils.fixSchema(schema)

    /* work-around */
    this.defaultValue = false
    if (!_.isNil(schema.default) && _.isNil(value)) {
      value = schema.default
      this.defaultValue = true
    }

    this.schema = { [name]: schema }
    this.check = validator.compile(this.schema)
    this.value = { [this.name]: null }
    this.tranformFn = transform.getFieldTransformFn(schema)

    if (this.defaultValue === true) {
      this.set(value)
      this.defaultValue = true
      delete schema.default
      return
    }
    this.set(value)
  }

  validate (value) {
    value = { [this.name]: value }
    return this.check(value)
  }

  set (value) {
    const errors = this.validate(value)
    if (errors === true) {
      const oldValue = this.get(false)
      const newValue = _.cloneDeep(value)
      this.value = { [this.name]: newValue }
      this.defaultValue = false
      //console.log('change >> ',{ fieldName: this.name, newValue, oldValue })
      this.eventEmitter.emit('change', { fieldName: this.name, newValue, oldValue })
      return true
    }
    throw new DataFieldError(errors)
  }

  get (finalValue = true) {
    //console.log('check1',this.name,this.defaultValue)
    if (this.defaultValue === true) {
      return null
    }
    if (finalValue !== false && this.tranformFn) return this.tranformFn(this.value[this.name], this.schema[this.name])
    return this.value[this.name]
  }

  on (eventName, cb) {
    if (!ACCEPTED_EVENTS.includes(eventName)) {
      throw new DataFieldError(`Unrecognized event '${eventName}' for ${this.constructor.name} '${this.name}'`)
    }
    this.eventEmitter.on(eventName, cb)
  }

  add (key,value) {
    let newValue
    if( this.schema[this.name].type === 'array' || this.schema[this.name].type === 'circularArray' ) {
      if(!value) value=key
      newValue = dataFieldUtils.addToArray(this.get(),value,this.schema[this.name])
    } else if ( this.schema[this.name].type === 'object' ) {
      newValue = dataFieldUtils.addToObject(this.get(),key,value,this.schema[this.name])
    }
    if(newValue === null) return false
    return this.set(newValue)
  }

  remove (key,value) {
    let newValue
    if( this.schema[this.name].type === 'array' || this.schema[this.name].type === 'circularArray' ) {
      newValue = dataFieldUtils.removeFromArray(this.get(),this.schema[this.name])
    } else if ( this.schema[this.name].type === 'object' ) {
      newValue = dataFieldUtils.removeFromObject(this.get(),key,this.schema[this.name])
    }
    if(newValue === null) return false
    return this.set(newValue)
  }
}



module.exports = DataField
