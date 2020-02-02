const path = require('path')
const { fileUtils } = require('../../utils/file.utils')
const baseRoot = path.parse(__dirname).root
const { JsonizedFile } = require('../index')

describe('JsonizedFile class and object', function () {
  it('should handle files with bad content', function () {
    let jsonizedFile

    const jsonFileWrongJson = path.join(__dirname, 'test_dir', 'config_file_wrong_json')
    const jsonFileEmpty = path.join(__dirname, 'test_dir', 'config_file_empty')
    const jsonFileNotExists = path.join(__dirname, 'test_dir', 'config_file_not_exists')

    fileUtils.removeFileSync(jsonFileNotExists)

    jsonizedFile = new JsonizedFile({ filePath: jsonFileWrongJson })
    jsonizedFile.load()
    expect(jsonizedFile.hasData()).toEqual(false)

    jsonizedFile = new JsonizedFile({ filePath: jsonFileEmpty })
    jsonizedFile.load()
    expect(jsonizedFile.hasData()).toEqual(false)

    jsonizedFile = new JsonizedFile({ filePath: jsonFileNotExists })
    jsonizedFile.load()
    expect(jsonizedFile.hasData()).toEqual(false)

    fileUtils.removeFileSync(jsonFileNotExists)
  })
  it('should create an basic JsonizedFile with simple fields', function () {
    const jszFile1 = new JsonizedFile({ filePath: path.join(baseRoot, 'fake', 'dir') })

    jszFile1.addField({
      name: 'counter1',
      schema: { type: 'number', positive: true, integer: true },
      value: 32
    })

    jszFile1.removeField('counter2')

    expect(function () {
      jszFile1.addField({
        name: 'counter1',
        schema: { type: 'string' },
        value: 'abcde'
      })
    }).toThrow('already exists')

    jszFile1.addField({
      name: 'counter2',
      schema: { type: 'number', positive: false, integer: true },
      value: -12
    })

    expect(function () { jszFile1.removeField('counter2') }).not.toThrow()
    expect(jszFile1.get('counter2')).toEqual(undefined)
    expect(jszFile1.getField('counter2')).toEqual(undefined)

    expect(jszFile1.get('counter1')).toEqual(32)

    const counter1Field = jszFile1.getField('counter1')

    expect(counter1Field).toBeInstanceOf(Object)
    expect(counter1Field.get()).toEqual(32)

    const onChangeData = { fieldAttr: null }
    counter1Field.on('change', function (fieldAttr) {
      onChangeData.fieldAttr = fieldAttr
    })

    jszFile1.set('counter1', 42)
    expect(onChangeData.fieldAttr.fieldName).toEqual('counter1')
    expect(onChangeData.fieldAttr.newValue).toEqual(42)
    expect(onChangeData.fieldAttr.oldValue).toEqual(32)

    expect(function () {
      jszFile1.addField({
        name: 'counter1_wrong',
        schema: { type: 'number', positive: true, integer: true },
        value: -32
      })
    }).toThrow('numberPositive')

    expect(jszFile1.get('counter1_wrong')).toEqual(undefined)

    // expect(myConfig.isValid()).toEqual(false)
  })

  it('should create an basic JsonizedFile with complex fields', function () {
    const jszFile1 = new JsonizedFile({ filePath: path.join(baseRoot, 'fake', 'dir') })

    const defaultValue = {
      id: 32,
      name: 'abcde12345',
      status: true,
      nested: {
        id: 42,
        name: 'fghil67890',
        status: false,
        listing: [
          'elm1',
          'elm2'
        ]
      }
    }

    jszFile1.addField({
      name: 'person1',
      schema: {
        type: 'object',
        props: {
          id: { type: 'number', positive: true, integer: true },
          name: { type: 'string', min: 3, max: 255 },
          status: 'boolean',
          nested: {
            type: 'object',
            props: {
              id: { type: 'number', positive: true, integer: true },
              name: { type: 'string', min: 3, max: 255 },
              status: 'boolean',
              listing: { type: 'array' }
            }
          }
        }
      },
      value: defaultValue
    })

    // defaultValue.id = 1234
    // expect(jszFile1.get('person1')).not.toMatchObject(defaultValue)
  })

  it('should create an basic JsonizedFile with absPath fields', function () {
    const jszFile1 = new JsonizedFile({ filePath: path.join(baseRoot, 'fake', 'dir') })

    jszFile1.addField({
      name: 'absDir1',
      schema: { type: 'absDirPath', checkExists: false, createIfNotExists: true, deleteIfExists: false },
      value: path.join(__dirname, 'file_utils_test_dir1')
    })

    expect(fileUtils.directoryExistsSync(jszFile1.get('absDir1'))).toEqual(true)

    jszFile1.addField({
      name: 'absFile1',
      schema: { type: 'absFilePath', checkExists: false, createIfNotExists: true, deleteIfExists: false },
      value: path.join(__dirname, 'file_utils_test_dir1/file1.json')
    })

    expect(fileUtils.fileExistsSync(jszFile1.get('absFile1'))).toEqual(true)

    fileUtils.removeDirSync(jszFile1.get('absDir1'))
  })

  it('should create an basic JsonizedFile with relPath fields', function () {
    const jszFile1 = new JsonizedFile({ filePath: path.join(baseRoot, 'fake', 'dir') })

    jszFile1.addField({
      name: 'relDir1',
      schema: { type: 'relDirPath', basePath: __dirname, checkExists: false, createIfNotExists: true, deleteIfExists: false },
      value: 'file_utils_test_dir2'
    })

    expect(fileUtils.directoryExistsSync(jszFile1.get('relDir1'))).toEqual(true)

    jszFile1.addField({
      name: 'relFile1',
      schema: { type: 'relFilePath', basePath: __dirname, checkExists: false, createIfNotExists: true, deleteIfExists: false },
      value: path.join('file_utils_test_dir2', 'file2.json')
    })

    expect(fileUtils.fileExistsSync(jszFile1.get('relFile1'))).toEqual(true)

    fileUtils.removeDirSync(jszFile1.get('relDir1'))
  })

  it('should get fields list and export a complete json object', function () {
    const jszFile1 = new JsonizedFile({ filePath: path.join(baseRoot, 'fake', 'dir') })

    jszFile1.addField({
      name: 'counter1',
      schema: { type: 'number', positive: true, integer: true },
      value: 42
    })

    jszFile1.addField({
      name: 'person1',
      schema: {
        type: 'object',
        props: {
          id: { type: 'number', positive: true, integer: true },
          name: { type: 'string', min: 3, max: 255 },
          status: 'boolean',
          nested: {
            type: 'object',
            props: {
              id: { type: 'number', positive: true, integer: true },
              name: { type: 'string', min: 3, max: 255 },
              status: 'boolean',
              listing: { type: 'array' }
            }
          }
        }
      },
      value: {
        id: 32,
        name: 'abcde12345',
        status: true,
        nested: {
          id: 42,
          name: 'fghil67890',
          status: false,
          listing: [
            'elm1',
            'elm2'
          ]
        }
      }
    })

    jszFile1.addField({
      name: 'absDir1',
      schema: { type: 'absDirPath', checkExists: false, createIfNotExists: true, deleteIfExists: false },
      value: path.join(__dirname, 'file_utils_test_dir1')
    })

    jszFile1.addField({
      name: 'absFile1',
      schema: { type: 'absFilePath', checkExists: false, createIfNotExists: true, deleteIfExists: false },
      value: path.join(__dirname, 'file_utils_test_dir1/file1.json')
    })

    jszFile1.addField({
      name: 'relDir1',
      schema: { type: 'relDirPath', basePath: __dirname, checkExists: false, createIfNotExists: true, deleteIfExists: false },
      value: 'file_utils_test_dir2'
    })

    jszFile1.addField({
      name: 'relFile1',
      schema: { type: 'relFilePath', basePath: __dirname, checkExists: false, createIfNotExists: true, deleteIfExists: false },
      value: path.join('file_utils_test_dir2', 'file2.json')
    })

    const exportObject = jszFile1.toObject()

    expect(exportObject).toMatchObject({
      counter1: 42,
      person1: {
        id: 32,
        name: 'abcde12345',
        status: true,
        nested: { id: 42, name: 'fghil67890', status: false, listing: ['elm1', 'elm2'] }
      },
      absDir1: path.join(__dirname, 'file_utils_test_dir1'),
      absFile1: path.join(__dirname, 'file_utils_test_dir1', 'file1.json'),
      relDir1: path.join('file_utils_test_dir2'),
      relFile1: path.join('file_utils_test_dir2', 'file2.json')
    })

    jszFile1.addField({
      name: 'null-field',
      schema: {
        type: 'array',
        items: 'number',
        default: [61, 53, 96]
      }
    })

    const fieldsList = jszFile1.getFieldsList()

    expect(fieldsList).toBeInstanceOf(Array)
    expect(fieldsList).toMatchObject([
      'counter1',
      'person1',
      'absDir1',
      'absFile1',
      'relDir1',
      'relFile1',
      'null-field'
    ])
  })
})
