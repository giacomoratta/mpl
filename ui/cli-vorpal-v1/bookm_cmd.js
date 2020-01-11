const { App, Cli } = require('./common')

const Config = App.Config
const ProjectHistory = App.ProjectHistory
const Sample = App.Sample
const Bookmarks = null// App.Sample

const commandName = 'bookm'

Cli.addCommand(`${commandName} [tag]`)

Cli.addCommandHeader(commandName)
  .description('Manage all bookmarks. It shows all the bookmarks by default, if no options are specified. \n')
  .option('-c, --copy <tag-to>', 'Copy a bookmark tag')
  .option('-e, --export', 'Export bookmarks in the current project')
  .option('-m, --manage', 'Shows and manage bookmarks with a prompt')
  .option('-l, --lookup', 'Add bookmarks from the latest lookup')
  .option('-r, --remove <tag>', 'Remove a bookmark tag')
  .option('-t, --tag', 'Shows and manage bookmark tag with a prompt')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  const mainTag = cliInput.getParam('tag')
  const copyTag = cliInput.getOption('copy')
  const exportToProject = cliInput.getOption('export')
  const manageBookmarks = cliInput.getOption('manage')
  const addFromLookup = cliInput.getOption('lookup')
  const removeTag = cliInput.getOption('remove')
  const manageTag = cliInput.getOption('tag')

  // Copy bookmarks tag
  if (copyTag) {
    return copyBookmarksTag({ fromTag: mainTag, toTag: copyTag, thisCli, cliNext, cliInput, cliPrinter })
  }

  // Export bookmarks to current project
  if (exportToProject) {
    return exportToProject({ thisCli, cliNext, cliInput, cliPrinter })
  }

  // Add bookmarks from latest lookup
  if (addFromLookup) {
    return addFromLookup({ thisCli, cliNext, cliInput, cliPrinter })
  }

  // Remove a bookmark tag
  if (removeTag) {
    return removeBookmarkTag({ tag: removeTag, thisCli, cliNext, cliInput, cliPrinter })
  }

  // Manage a bookmark tag
  if (manageTag) {
    return manageBookmarkTag({ tag: manageTag, thisCli, cliNext, cliInput, cliPrinter })
  }

  // Manage all bookmarks
  if (manageBookmarks) {
    return manageAllBookmarks({ thisCli, cliNext, cliInput, cliPrinter })
  }

  return showAllBookmarks({ tag: mainTag, thisCli, cliNext, cliInput, cliPrinter })
})

const showAllBookmarks = ({ tag, thisCli, cliNext, cliInput, cliPrinter }) => {
  if (tag) {
    if (Bookmarks.hasTag(tag)) {
      printBookmarks({ tag, cliPrinter })
    } else {
      cliPrinter.warn(`No bookmarks found for tag '${tag}'.`)
    }
    return cliNext()
  }
  if (Bookmarks.size() > 0) {
    printBookmarks({ cliPrinter })
  } else {
    cliPrinter.warn('No bookmarks found.')
  }
  return cliNext()
}

const printBookmarks = ({ tag, toArray = false, cliPrinter }) => {
  const indentedPrinter = cliPrinter.createChild({ command: cliPrinter.command })
  const registry = []
  let i = 0
  const printBookmark = (bookmark) => {
    i++
    indentedPrinter.info(`${i}) ${bookmark.relPath}`)
    if (toArray === true) registry.push(bookmark)
    cliPrinter.newLine()
  }

  cliPrinter.newLine()
  if (tag) {
    Bookmarks.getTag(tag).forEach(printBookmark)
    return registry
  }

  Bookmarks.forEach((tag) => {
    Bookmarks.getTag(tag).forEach(printBookmark)
  })
  return registry
}

const manageAllBookmarks = ({ thisCli, cliNext, cliInput, cliPrinter }) => {
  if (Bookmarks.size() > 0) {
    // interactiveManager
  } else {
    // error: no tags
  }
  return cliNext()
}

const manageBookmarkTag = ({ tag, thisCli, cliNext, cliInput, cliPrinter }) => {
  if (Bookmarks.hasTag(tag)) {
    // remove
  } else {
    // error: no tag
  }
  return cliNext()
}

const removeBookmarkTag = ({ tag, thisCli, cliNext, cliInput, cliPrinter }) => {
  if (Bookmarks.hasTag(tag)) {
    // remove
  } else {
    // error: no tag
  }
  return cliNext()
}

const addFromLookup = ({ thisCli, cliNext, cliInput, cliPrinter }) => {
  if (Sample.getLatestLookup()) {
    // interactiveManager
  } else {
    // error: no latest lookup
  }
  return cliNext()
}

const exportToProject = ({ thisCli, cliNext, cliInput, cliPrinter }) => {
  if (ProjectHistory.latest()) {
    // ASK and export
  } else {
    // error: no project history
  }
  return cliNext()
}

const copyBookmarksTag = ({ fromTag, toTag, thisCli, cliNext, cliInput, cliPrinter }) => {
  if (fromTag) {
    // duplicate
  } else {
    // error: need main tag!
  }
  return cliNext()
}

const collectionToList = () => {
  // foreach k i -> registry
}

const interactiveManager = (collection, registry) => {
  // printCollection
  // reg = registry[id]
  // item = collection[reg.key][reg.id]
}

const parseIds = (idString) => {
  // 3 = add
  // m3 = move
  // r3 = remove
}
