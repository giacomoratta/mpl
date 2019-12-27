const { CliVorpal, CLI_SUCCESS } = require('../cliVorpal.class')
const vCli = new CliVorpal()
const vCl2 = new CliVorpal()

vCli.on('beforeCommand', (e) => {
  console.info('test beforeCommand event message', e.command)
})

vCli.on('afterCommand', (e) => {
  console.info('test afterCommand event message', e.command)
})

vCl2.on('beforeCommand', (e) => {
  console.info('test beforeCommand2 event message', e.command)
})

vCl2.on('afterCommand', (e) => {
  console.info('test afterCommand2 event message', e.command)
})

vCli.addCommand('projects <reqA> <reqB> [optA] [optB]')

vCli.addCommandHeader('projects')
  .description('Manage all projects' + '\n')
  .option('-a, --all', 'Shows all projects')
  .option('--save', 'Save bookmarks in the current project')
  .option('-d, --dirname <dirname>', 'Set directory name.')

vCli.addCommandBody('projects', function (cliReference, cliNextCb, cliData) {
  console.log(cliData)
  return cliNextCb(cliData.successCode)
})

vCli.addCommand('simple')

vCli.addCommandBody('simple', async function (cliReference, cliNextCb, cliData) {
  console.log(cliData)

  let resultExternal

  await cliReference.prompt({
    type: 'input',
    name: 'inputValue',
    message: "['q' to quit] > "
  }, (result) => {
    console.log('result prompt:', result)
    resultExternal = result
  })
  if (resultExternal.inputValue === 'q') return cliNextCb(CLI_SUCCESS)
  console.log('111', resultExternal)

  await cliReference.prompt({
    type: 'input',
    name: 'inputValue',
    message: "['q' to quit] > "
  }, (result) => {
    console.log('result prompt:', result)
    resultExternal = result
  })
  if (resultExternal.inputValue === 'q') return cliNextCb(CLI_SUCCESS)
  console.log('222', resultExternal)

  return cliNextCb(CLI_SUCCESS)
})

vCli.show('abc')
