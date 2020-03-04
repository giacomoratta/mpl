const path = require('path')
const { DataFieldBuiltInFactory } = require('../../data-field/dataFieldBuiltIn.factory')
const { JsonizedFile } = require('../index')

const jsonTestDir = path.join(__dirname, 'test_dir')
const jsonFileWrongJson = path.join(jsonTestDir, 'config_file_wrong_json')
const jsonFileEmpty = path.join(jsonTestDir, 'config_file_empty')
const jsonFileNotExists = path.join(jsonTestDir, 'config_file_not_exists')

const DFBF = new DataFieldBuiltInFactory()

describe('JsonizedFile operations with fields and json data', function () {
  beforeAll(function () {
    DFBF.initFactory()
  })

  it('should load non-existent json file', async function () {
    const jzf = new JsonizedFile({ filePath: jsonFileNotExists })
    await expect(jzf.load()).resolves.toEqual(false)
    expect(jzf.empty).toEqual(true)
  })

  it('should load empty json file', async function () {
    const jzf = new JsonizedFile({ filePath: jsonFileEmpty })
    await expect(jzf.load()).resolves.toEqual(false)
    expect(jzf.empty).toEqual(true)
  })

  it('should load bad json file', async function () {
    const jzf = new JsonizedFile({ filePath: jsonFileWrongJson })
    await expect(jzf.load()).resolves.toEqual(false)
    expect(jzf.empty).toEqual(true)
  })

  it('should save empty json file', async function () {
    const jsonFileEmpty2 = path.join(jsonTestDir, 'config_file_empty2')
    const jzf = new JsonizedFile({ filePath: jsonFileEmpty2 })
    await expect(jzf.load()).resolves.toEqual(false)
    expect(jzf.empty).toEqual(true)
    await expect(jzf.save()).resolves.toEqual(true)
    expect(jzf.empty).toEqual(true)
    expect(jzf.jsonData).toEqual(null)
    expect(jzf.empty).toEqual(true)
  })

  it('should load bad json file and set correct internal data', async function () {
    const jzf = new JsonizedFile({
      filePath: path.join(jsonTestDir, 'config_file_wrong_json2'),
      cloneFrom: jsonFileWrongJson
    })
    await expect(jzf.load()).resolves.toEqual(false)
    expect(jzf.jsonData).toEqual(null)
    expect(jzf.empty).toEqual(true)

    jzf.add(DFBF.create({
      name: 'username',
      schema: {
        type: 'string',
        min: 3
      },
      value: 'qwerty098'
    }))
    expect(jzf.jsonData).toEqual(null)

    await expect(jzf.save()).resolves.toEqual(true)
    expect(jzf.jsonData).toEqual({
      username: 'qwerty098'
    })

    expect(jzf.empty).toEqual(false)

    await jzf.clean()
  })

  it('should perform a basic flow: load, edit, save, re-load', async function () {
    const jzf = new JsonizedFile({ filePath: path.join(jsonTestDir, 'basicFile1.json'), prettyJson: true })

    jzf.add(DFBF.create({
      name: 'username',
      schema: {
        type: 'string',
        min: 3
      },
      value: 'qwerty098'
    }))

    jzf.add(DFBF.create({
      name: 'age',
      schema: {
        type: 'number',
        min: 3
      },
      value: 32
    }))

    jzf.add(DFBF.create({
      name: 'optional1',
      schema: {
        type: 'string'
      }
    }))

    await expect(jzf.load()).resolves.toEqual(false)
    expect(jzf.empty).toEqual(true)
    await jzf.save()
    expect(jzf.empty).toEqual(false)

    expect(jzf.jsonData).toMatchObject({
      username: 'qwerty098',
      age: 32
    })

    jzf.field('optional1').value = 'test-not-null'
    await jzf.save()
    expect(jzf.jsonData).toMatchObject({
      username: 'qwerty098',
      age: 32,
      optional1: 'test-not-null'
    })

    await jzf.clean()
  })

  it('should handle check and give information about fields', async function () {
    const jzf = new JsonizedFile({ filePath: path.join(jsonTestDir, 'basicFile1.json'), prettyJson: true })

    jzf.add(DFBF.create({
      name: 'username',
      schema: {
        type: 'string',
        min: 3
      },
      value: 'qwerty098'
    }))

    jzf.add(DFBF.create({
      name: 'age',
      schema: {
        type: 'number',
        min: 3
      },
      value: 32
    }))

    jzf.add(DFBF.create({
      name: 'fixed',
      schema: {
        type: 'number',
        min: 3,
        readOnly: true
      }
    }))

    expect(jzf.has('username')).toEqual(true)
    expect(jzf.has('not-exist')).toEqual(false)
    expect(jzf.has()).toEqual(false)

    expect(jzf.field('username').value).toEqual('qwerty098')
    expect(function () { jzf.field('not-exists').value }).toThrow()

    expect(jzf.length).toEqual(3)

    expect(jzf.list()).toMatchObject([
      'username',
      'age',
      'fixed'
    ])

    expect(jzf.list({ writableOnly: true })).toMatchObject([
      'username',
      'age'
    ])
  })

  it('should avoid to create existent fields and remove it', async function () {
    const jzf = new JsonizedFile({ filePath: path.join(jsonTestDir, 'basicFile1.json'), prettyJson: true })

    jzf.add(DFBF.create({
      name: 'username',
      schema: {
        type: 'string',
        min: 3
      },
      value: 'qwerty098'
    }))

    expect(function () {
      jzf.add(DFBF.create({
        name: 'username',
        schema: {
          type: 'string',
          min: 3
        },
        value: 'qwerty098'
      }))
    }).toThrow('already exists')

    expect(jzf.remove('username')).toEqual(true)
    expect(jzf.remove('username')).toEqual(false)
  })

  it('should handle operations with non-existent fields', async function () {
    const jzf = new JsonizedFile({ filePath: path.join(jsonTestDir, 'basicFile1.json'), prettyJson: true })
    expect(jzf.has('username')).toEqual(false)
    expect(jzf.remove('username')).toEqual(false)
    expect(jzf.field('username')).toEqual(undefined)
    expect(jzf.empty).toEqual(true)
  })

  it('should reset a jsonizedFile object with path fields', async function () {
    const jzf = new JsonizedFile({ filePath: path.join(jsonTestDir, 'basicFile1.json'), prettyJson: true })

    jzf.add(DFBF.create({
      name: 'field51',
      schema: {
        type: 'absDirPath',
        ensure: true
      }
    }))

    jzf.field('field51').value = path.join(jsonTestDir, 'field51')
    await expect(jzf.field('field51').fn.exists()).resolves.toEqual(true)
    expect(jzf.field('field51').value).toEqual(path.join(jsonTestDir, 'field51'))

    jzf.field('field51').reset()
    expect(jzf.field('field51').value).toEqual(null)

    await jzf.field('field51').fn.delete()
    await expect(jzf.field('field51').fn.exists()).resolves.toEqual(false)
  })

  it('should hard-reset a jsonizedFile object', async function () {
    const jzf = new JsonizedFile({ filePath: path.join(jsonTestDir, 'basicFile-hard-reset.json'), prettyJson: true })

    jzf.add(DFBF.create({
      name: 'username',
      schema: {
        type: 'string',
        min: 3
      },
      value: 'qwerty098'
    }))

    await jzf.save()
    await expect(jzf.fileHolder.exists()).resolves.toEqual(true)

    await jzf.reset(true)
    await expect(jzf.fileHolder.exists()).resolves.toEqual(false)
  })
})
