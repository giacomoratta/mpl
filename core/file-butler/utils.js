const _ = require('../utils/lodash.extended')

const ENUMS = {
    fileType: {
        json: 'json',
        json_compact: 'json-compact',
        text: 'text'
    },
    dataType: {
        object: 'object',
        string: 'string',
        array: 'array'
    }
}


const checkEnumValue = function (label, value, defaultValue) {
    const _check = (_.indexOf(Object.values(ENUMS[label]), value) >= 0)
    if (_check === true) return value
    if (!_.isNil(defaultValue)) return defaultValue
    return null
}

const setCheckDataTypeFn = function (dataType) {
    if (ENUMS.dataType.array === dataType) {
        return _.isArray
    } else if (ENUMS.dataType.string === dataType) {
        return _.isString
    }
    return _.isObject
}


const parseOption = function(options) {
    if (!options || !options.filePath ) return null

    options = {
        filePath: null,
        fileType: 'json',
        dataType: 'object',

        /* Behaviour */
        cloneFrom: '', // if filePath does not exist, clone from this path
        backupTo: '', // after save, copy the file in filePath to this path
        preLoad: false, // calls loadFn after creating relationship
        autoLoad: false, // calls loadFn if it has no data
        preSet: false, // calls setFn after creating relationship
        autoSet: false, // calls setFn if it has no data
        autoSave: false, // calls saveFn after loadFn or setFn

        /* Custom functions */
        checkFn: null,
        initFn: null,
        getFn: null,
        setFn: null,
        loadFn: null,
        saveFn: null,
        printFn: null,
        logErrorsFn: function () {},

        /* Private functions */
        _checkDataType: null,

        ...options
    }

    options.fileType = checkEnumValue('fileType', options.fileType, ENUMS.fileType.json)
    options.dataType = checkEnumValue('dataType', options.dataType, ENUMS.dataType.object)
    options._checkDataType = setCheckDataTypeFn(options.dataType)
    return options
}


module.exports = {
    ENUMS,
    parseOption
}
