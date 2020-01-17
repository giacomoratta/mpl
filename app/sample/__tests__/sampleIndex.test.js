const path = require('path')
const { fileUtils } = require('./../../../core/utils/file.utils')
const { SampleIndex } = require('../sampleIndex.class')

const SampleIndexFile = path.join(__dirname, 'new_samples_index')
const SamplesDirectory = path.join(path.resolve(path.join(__dirname, '..', '..', '__tests__')), 'test_dir')
const SampleIndexFileWrongJson = path.join(__dirname, 'test_dir', 'fixed_samples_index_wrong_json')
const SampleIndexFileEmpty = path.join(__dirname, 'test_dir', 'fixed_samples_index_empty')
const SampleIndexFileNotExists = path.join(__dirname, 'test_dir', 'fixed_samples_index_not_exists')

describe('SampleIndex functions', function () {
  beforeAll(function () {
    fileUtils.removeFileSync(SampleIndexFile)
  })
  afterAll(function () {
    fileUtils.removeFileSync(SampleIndexFile)
  })

  it('should create a sample index', async function () {
    let result
    expect(function () {
      return new SampleIndex({
        indexFilePath: SampleIndexFile,
        samplesPath: SamplesDirectory + 'wrong'
      })
    }).toThrow()

    const sIndex1 = new SampleIndex({
      indexFilePath: SampleIndexFile + 'wrong',
      samplesPath: SamplesDirectory
    })
    result = await sIndex1.load()
    expect(result).toEqual(false)
    expect(function () { sIndex1.forEach(() => {}) }).toThrow()
    expect(function () { return sIndex1.size }).toThrow()

    const sIndex2 = new SampleIndex({
      indexFilePath: SampleIndexFile,
      samplesPath: SamplesDirectory
    })
    result = await sIndex2.load()
    expect(result).toEqual(false)
    expect(function () { sIndex2.forEach(() => {}) }).toThrow()
    expect(function () { return sIndex2.size }).toThrow()

    fileUtils.writeTextFileSync(SampleIndexFile, '')
    result = await sIndex2.load()
    expect(result).toEqual(false)
    expect(function () { sIndex2.forEach(() => {}) }).toThrow()
    expect(function () { return sIndex2.size }).toThrow()

    result = await sIndex2.create()
    expect(result).toEqual(true)
    expect(function () { sIndex2.forEach(() => {}) }).not.toThrow()
    expect(sIndex2.size).toEqual(13)

    const sIndex3 = new SampleIndex({
      indexFilePath: SampleIndexFile,
      samplesPath: SamplesDirectory
    })
    result = await sIndex3.load()
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(13)

    sIndex2.forEach(({ item }) => {
      expect(item.relRoot).toEqual(SamplesDirectory)
    })

    result = await sIndex3.create({ includedExtensions: ['wav', 'json'] })
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(6)

    result = await sIndex3.create({ excludedExtensions: ['wav', 'json'] })
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(7)

    result = await sIndex3.create({
      excludedPaths: [
        path.join(SamplesDirectory, 'directory1', 'directory3'),
        path.join(SamplesDirectory, 'directory6')
      ]
    })
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(8)

    result = await sIndex3.create({
      excludedExtensions: ['json', 'wav'],
      excludedPaths: [
        path.join(SamplesDirectory, 'directory1', 'directory3'),
        path.join(SamplesDirectory, 'directory6')
      ]
    })
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(3)

    result = await sIndex3.create({
      includedExtensions: ['json', 'wav'],
      excludedPaths: [
        path.join(SamplesDirectory, 'directory1', 'directory3'),
        path.join(SamplesDirectory, 'directory6')
      ]
    })
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(5)

    fileUtils.writeTextFileSync(SampleIndexFile, '')
  })

  it('should support file problems', function () {
    let sIndex1

    sIndex1 = new SampleIndex({
      indexFilePath: SampleIndexFileWrongJson,
      samplesPath: __dirname
    })

    expect(function () { return sIndex1.size }).toThrow()
    expect(sIndex1.loaded).toEqual(false)

    sIndex1 = new SampleIndex({
      indexFilePath: SampleIndexFileEmpty,
      samplesPath: __dirname
    })

    expect(function () { return sIndex1.size }).toThrow()
    expect(sIndex1.loaded).toEqual(false)

    sIndex1 = new SampleIndex({
      indexFilePath: SampleIndexFileNotExists,
      samplesPath: __dirname
    })

    expect(function () { return sIndex1.size }).toThrow()
    expect(sIndex1.loaded).toEqual(false)
  })
})
