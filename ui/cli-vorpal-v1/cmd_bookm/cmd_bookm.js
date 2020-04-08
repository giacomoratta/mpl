const { App, Cli } = require('../ui_common')
const { BookmarkAPI } = App

const commandName = 'bookm'

Cli.addCommand(commandName, '[label]')

Cli.addCommandHeader(commandName)
  .description('Show or manage the bookmarks. \n')
  .option('-c, --copy <new-label>', 'copy the bookmarks in a new label or merge in an existent label.') // ask for confirmation
  .option('-l, --label <new-label>', 'change the label of a bookmark set') // ask for confirmation)
  .option('-r, --remove [indexes]', 'remove an entire label or some bookmarks by indexes (e.g. \'3,5,7\')') // ask for confirmation)

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter }) {
  if (!BookmarkAPI.hasBookmarks()) {
    cliPrinter.info('No bookmarks present.')
    return cliNext()
  }

  const mainLabel = cliInput.getParam('label')
  if ((!mainLabel && cliInput.hasOptions()) || !BookmarkAPI.has(mainLabel)) {
    cliPrinter.warn(`Management operations require an existing label. Invalid label: '${mainLabel || '-'}'.`)
    return cliNext()
  }

  if (cliInput.hasOption('copy')) {
    await optCopyHandler(mainLabel, cliInput, cliPrinter)
    return cliNext()
  }

  if (cliInput.hasOption('label')) {
    await optLabelHandler(mainLabel, cliInput, cliPrinter)
    return cliNext()
  }

  if (cliInput.hasOption('remove')) {
    await optRemoveHandler(mainLabel, cliInput, cliPrinter)
    return cliNext()
  }

  const allBookmarks = BookmarkAPI.get()
  cliPrinter.info('Bookmarks list')
  cliPrinter.newLine()

  Object.keys(allBookmarks).forEach((key) => {
    cliPrinter.info(key)
    printBookmarkSet(allBookmarks[key], cliPrinter)
  })

  return cliNext()
})

const printBookmarkSet = (bookmarkSet, cliPrinter) => {
  cliPrinter.orderedList(bookmarkSet.array, (item) => { return item.relPath })
  cliPrinter.newLine()
}

const optCopyHandler = async (mainLabel, cliInput, cliPrinter) => {
  const newLabel = cliInput.getOption('copy')
  cliPrinter.info(`Copying bookmarks from ${mainLabel} to ${newLabel}...`)
  if (BookmarkAPI.copySet(mainLabel, newLabel) === true) {
    cliPrinter.info('Successfully copied.')
    await BookmarkAPI.update()
  } else {
    cliPrinter.warn('Something went wrong.')
  }
  cliPrinter.newLine()
  cliPrinter.info(`Bookmark set ${newLabel}:`)
  printBookmarkSet(BookmarkAPI.get(newLabel), cliPrinter)
}

const optLabelHandler = async (mainLabel, cliInput, cliPrinter) => {
  const newLabel = cliInput.getOption('label')
  cliPrinter.info(`Renaming bookmark set from ${mainLabel} to ${newLabel}...`)
  if (BookmarkAPI.renameSet(mainLabel, newLabel) === true) {
    cliPrinter.info('Successfully renamed.')
    await BookmarkAPI.update()
  } else {
    cliPrinter.warn('Something went wrong.')
  }
  cliPrinter.newLine()
  cliPrinter.info(`Bookmark set ${newLabel}:`)
  printBookmarkSet(BookmarkAPI.get(newLabel), cliPrinter)
}

const optRemoveHandler = async (mainLabel, cliInput, cliPrinter) => {
  const optRemove = cliInput.getOption('remove')
  if (optRemove === true) {
    const bookmarkSet = BookmarkAPI.remove(mainLabel)
    await BookmarkAPI.update()
    cliPrinter.info(`Removed ${mainLabel} with ${bookmarkSet.size} bookmarks.`)
    return
  }

  const bookmarkSet = BookmarkAPI.get(mainLabel)
  const setSize = bookmarkSet.size
  const indexes = optRemove.split(',')
  const removedIndexes = []
  indexes.forEach((strIndex) => {
    const index = parseInt(strIndex)
    if (isNaN(index) || index < 1 || index > setSize) {
      return
    }
    const bookmarkInfo = bookmarkSet.remove(index - 1)
    if (bookmarkInfo) removedIndexes.push(index)
  })

  if (removedIndexes.length > 0) {
    cliPrinter.info(`Successfully removed ${removedIndexes.length} bookmarks from ${mainLabel}: ${removedIndexes.join(',')}.`)
    await BookmarkAPI.update()
  } else {
    cliPrinter.info(`No bookmarks removed from ${mainLabel}.`)
  }
}
