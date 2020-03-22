const { API, Cli } = require('./ui_common')

const PathQuery = API.pathQuery

const commandName = 'query'

Cli.addCommand(`${commandName} [label] [query]`)

Cli.addCommandHeader(commandName)
  .description('Manage queries for sample, for matching sample directories and files. \n' +
                'In order to add, get or remove a query, use the 2 params label and query. \n'
  )
  // .option('-c, --copy <new-label>', 'Duplicate a query with the specified query \'new-label\'.') /* todo */
  .option('-r, --remove', 'Remove a query')
  // .option('-u, --uncovered <count>', 'Shows the first <count> uncovered samples by all queries') /* todo */

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter }) {
  const queryLabel = cliInput.getParam('label')
  const queryString = cliInput.getParam('query')

  /* Add new query */
  if (queryLabel && queryString) {
    if (PathQuery.add(queryLabel, queryString) !== true) {
      cliPrinter.error('Cannot add the query')
    } else {
      cliPrinter.info('Query added successfully')
      if (await PathQuery.save() !== true) {
        cliPrinter.error(`Cannot save the query file: ${PathQuery.getFilePath()}`)
      }
    }
    return cliNext()
  }

  /* Get single query or remove it */
  if (queryLabel) {
    const pathBasedQuery = PathQuery.get(queryLabel)
    if (!pathBasedQuery) {
      cliPrinter.warn(`Query '${queryLabel}' not found!`)
      return cliNext()
    }
    if (cliInput.hasOption('remove')) {
      PathQuery.remove(queryLabel)
      cliPrinter.info(`Query '${queryLabel}' removed successfully`)
      if (await PathQuery.save() !== true) {
        cliPrinter.error(`Cannot save the query file: ${PathQuery.getFilePath()}`)
      }
      return cliNext()
    }
    cliPrinter.info(`Query '${queryLabel}': ${pathBasedQuery.queryString}`)
    return cliNext()
  }

  /* List all queries */
  const pathBasedQueryList = PathQuery.list()
  if (!pathBasedQueryList || pathBasedQueryList.length === 0) {
    cliPrinter.warn('No queries found!')
    return cliNext()
  }
  pathBasedQueryList.forEach((q) => {
    cliPrinter.info(`  ${q.label}: ${q.queryString}`)
  })

  return cliNext()
})
