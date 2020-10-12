const { App, Cli, uiUtils } = require('../ui_common')
const { ConfigAPI, SampleIndexAPI, SampleLookAPI, PathQueryAPI } = App

const commandName = 'look'

Cli.addCommand(commandName, '[query]')

Cli.addCommandHeader(commandName)
  .description('Search samples by query or show the latest sample look; (related configurations: LookRandomCount, LookRandomSameDirectory) \n')
  .option('-i, --info', 'Show more info')
  .option('-l, --label <label>', 'Use a query label (see \'query\' command)')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter }) {
  if (ConfigAPI.field('SamplesDirectory').unset === true) {
    cliPrinter.warn('No samples directory set (see \'config SamplesDirectory\' and use \'samples-scan\')')
    return cliNext()
  }
  if (SampleIndexAPI.absent() === true) {
    cliPrinter.warn('No samples indexed (see \'config SamplesDirectory\' and use \'samples-scan\')')
    return cliNext()
  }
  if (SampleIndexAPI.empty() === true) {
    cliPrinter.warn('Sample index is empty (see \'config SamplesDirectory\' and use \'samples-scan\')')
    return cliNext()
  }

  /* PARAM: query */
  const paramQueryString = cliInput.getParam('query')
  if (paramQueryString) {
    cliPrinter.info(`Searching samples with query: ${paramQueryString}`)
    const { sampleLook } = SampleLookAPI.create({ queryString: paramQueryString })
    if (!sampleLook || sampleLook.size === 0) {
      cliPrinter.warn('Samples not found!')
    } else {
      printSearchResults(sampleLook, cliInput, cliPrinter)
      // await saveSearchResults(sampleLook, pathBasedQuery, cliPrinter, cliInput, cliPrompt)
    }
    return cliNext()
  }

  /* OPTION: label */
  const optQueryLabel = cliInput.getOption('label')
  if (optQueryLabel) {
    cliPrinter.info(`Searching samples with label: ${optQueryLabel}`)
    const pathQueryObj = PathQueryAPI.get(optQueryLabel)
    if (!pathQueryObj) {
      cliPrinter.warn('Query not found!')
      return cliNext()
    }
    const { sampleLook } = SampleLookAPI.create({ pathQueryObj })
    if (!sampleLook || sampleLook.size === 0) {
      cliPrinter.warn('Samples not found!')
    } else {
      printSearchResults(sampleLook, cliInput, cliPrinter)
      // await saveSearchResults(sampleLook, pathBasedQuery, cliPrinter, cliInput, cliPrompt)
    }
    return cliNext()
  }

  const { sampleLook } = SampleLookAPI.latest()
  if (!sampleLook || sampleLook.size === 0) {
    cliPrinter.warn('No samples found in the latest look!')
  } else {
    printSearchResults(sampleLook, cliInput, cliPrinter)
    // await saveSearchResults(sampleLook, pathBasedQuery, cliPrinter, cliInput, cliPrompt)
  }
  return cliNext()
})

const printSearchResults = (sampleSet, cliInput, cliPrinter) => {
  const printer = cliPrinter.child()
  let index = 1
  const extendedInfo = cliInput.getOption('info')
  const length = sampleSet.size.toString().length
  sampleSet.forEach((sample) => {
    printer.info(`${(index++).toString().padStart(length, '0')}) ${uiUtils.sampleInlineInfo(sample, extendedInfo)}`)
  })
}
