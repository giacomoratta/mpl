const { Config } = require('../config')
const { PathQuery } = require('../path-query')
const { SampleIndex } = require('./sampleIndex.class')
const { SampleSet } = require('./sampleSet.class')
const { SpheroidCache } = require('../../core/spheroid-cache')

/* todo: store better data { latest set, latest query } */
const SampleSetCache = new SpheroidCache({ maxItems: 20 })
const LookupCache = new SpheroidCache({ maxItems: 30 })

let latestSampleSet = null
let latestSampleSetQuery = null
let latestLookup = []
let latestLookupQuery = null

// set logger

let mainSamplesIndex = null

const loadIndex = async () => {
  if (!Config.get('SamplesDirectory')) return false
  mainSamplesIndex = new SampleIndex({
    indexFilePath: Config.get('SampleIndexFile'),
    samplesPath: Config.get('SamplesDirectory')
  })
  const result = await mainSamplesIndex.load()
  if (result === true) {
    Config.getField('Status').add('new-scan-needed', false)
    Config.save()
  }
  return result
}

const createIndex = async () => {
  if (!Config.get('SamplesDirectory')) return false
  mainSamplesIndex = new SampleIndex({
    indexFilePath: Config.get('SampleIndexFile'),
    samplesPath: Config.get('SamplesDirectory')
  })
  const options = {
    excludedPaths: Config.get('SamplesDirectoryExclusions')
  }
  if (Config.get('ExtensionsPolicyForSamples') === 'E') {
    options.excludedExtensions = Config.get('ExcludedExtensionsForSamples')
  } else if (Config.get('ExtensionsPolicyForSamples') === 'I') {
    options.includedExtensions = Config.get('IncludedExtensionsForSamples')
  }
  const result = await mainSamplesIndex.create(options)
  if (result === true) {
    Config.getField('Status').add('new-scan-needed', false)
    Config.getField('Status').add('first-scan-needed', false)
    Config.save()
  }
  return result
}

const hasIndex = () => {
  return mainSamplesIndex !== null && mainSamplesIndex.loaded && mainSamplesIndex.size > 0
}

const indexSize = () => {
  if (mainSamplesIndex === null) return 0
  return mainSamplesIndex.size
}

const sampleSetByPathQuery = ({ queryString, queryLabel }) => {
  let sampleSet = null
  let query = null

  if (mainSamplesIndex === null) return

  if (queryLabel) {
    if (SampleSetCache.has(queryLabel)) {
      return SampleSetCache.get(queryLabel)
    }
    query = PathQuery.get(queryLabel)
  } else if (queryString) {
    const tempLabel = PathQuery.queryStringLabel(queryString)
    if (SampleSetCache.has(tempLabel)) {
      return SampleSetCache.get(tempLabel)
    }
    query = PathQuery.create(queryString)
  }

  if (!query || !query.isValid()) return

  sampleSet = new SampleSet({
    validate: function (sample) {
      return sample.isFile === true && query.check(sample.relPath)
    }
  })

  mainSamplesIndex.forEach(({ item }) => {
    sampleSet.add(item)
  })

  if (sampleSet.size === 0) return

  SampleSetCache.add(query.label, {
    sampleSet,
    query
  })
  return {
    sampleSet,
    query
  }
}

const lookupByPathQuery = ({ queryString, queryLabel }) => {
  let lookup = []
  const sampleSetInfo = sampleSetByPathQuery({ queryString, queryLabel })
  if (!sampleSetInfo) return
  lookup = sampleSetInfo.sampleSet.random({
    max: Config.get('RandomCount'),
    maxFromSameDirectory: Config.get('MaxSamplesSameDirectory')
  })
  if ( lookup.length > 0 ) LookupCache.add({
    lookup,
    ...sampleSetInfo
  })
  return {
    lookup,
    ...sampleSetInfo
  }
}

loadIndex().then((loadResult) => {
  if (loadResult !== true) {
    Config.getField('Status').add('first-scan-needed', true)
    Config.save()
  }
})

module.exports = {
  Sample: {
    hasIndex,
    indexSize,
    createIndex,
    loadIndex,
    sampleSetByPathQuery,
    lookupByPathQuery,

    getLatestSampleSet: () => { return SampleSetCache.first },
    getLatestLookup: () => { return LookupCache.first }
  }
}
