const { App, Cli } = require('../ui_common')
const { ConfigAPI, SampleIndexAPI } = App

const commandName = 'look'

Cli.addCommand(commandName, '[query]')

Cli.addCommandHeader(commandName)
  .description('Search samples by query or show the latest sample look. \n')
  .option('-l, --label <label>', 'Use a query label (see \'query\' command)')
  .option('-s, --save [custom-path]', 'Save latest lookup to current project directory or custom path')

Cli.addCommandBody(commandName, function ({ cliNext, cliInput, cliPrinter }) {
  if (SampleIndexAPI.absent() === true) {
    cliPrinter.warn('No samples indexed (see \'config SamplesDirectory\' and use \'samples-scan\')')
    return cliNext()
  }
  if (SampleIndexAPI.empty() === true) {
    cliPrinter.warn('Sample index is empty (see \'config SamplesDirectory\' and use \'samples-scan\')')
    return cliNext()
  }

  // look: print latest lookup
  // look [query]: search, set and print latest lookup
  // look -l <label>: get path-query, search, set and print latest lookup
  // look -s: save latest lookup to project
  // look -s [custom-path]: save latest lookup to directory

  // search: print all samples
  // search [query]: search, set and print all samples
  // search -l <label>: get path-query, search, set and print latest lookup

  return cliNext()
})
