const { CliVorpal } = require('../cliVorpal.class')
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

vCli.addCommandBody('projects', function ({ cliNext, cliInput }) {
  console.log(cliInput.command)
  console.log(cliInput.params)
  console.log(cliInput.options)
  console.log(cliInput.getParam('reqA'))
  console.log(cliInput.getOption('save'))
  return cliNext()
})

vCli.addCommand('simple')

vCli.addCommandBody('simple', async function ({ thisCli, cliNext }) {
  let resultExternal

  await thisCli.prompt({
    type: 'input',
    name: 'inputValue',
    message: "['q' to quit] > "
  }, (result) => {
    console.log('result prompt:', result)
    resultExternal = result
  })
  if (resultExternal.inputValue === 'q') return cliNext()
  console.log('111', resultExternal)

  await thisCli.prompt({
    type: 'input',
    name: 'inputValue',
    message: "['q' to quit] > "
  }, (result) => {
    console.log('result prompt:', result)
    resultExternal = result
  })
  if (resultExternal.inputValue === 'q') return cliNext()
  console.log('222', resultExternal)

  return cliNext()
})

function wait1 (label, time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(label + Date.now())
    }, time)
  })
}

vCli.addCommand('wait')
vCli.addCommandBody('wait', async function ({ cliNext }) {
  let data
  data = await wait1('label1', 8000)
  console.log(1, data)
  data = await wait1('label2', 2000)
  console.log(2, data)
  data = await wait1('label3', 2000)
  console.log(3, data)
  data = await wait1('label4', 2000)
  console.log(4, data)
  data = await wait1('label5', 2000)
  console.log(5, data)
  cliNext()
})

vCli.addCommand('wait2')
vCli.addCommandBody('wait2', async function ({ thisCli, cliNext, cliPrinter }) {
  let data
  data = await wait1('abc123', 1000)
  console.log(123, data)

  cliPrinter.title('choose a test1')
  cliPrinter.orderedList(['test1', 'test2', 'test3'])
  console.log(cliPrinter.indent.length)

  await thisCli.prompt({
    type: 'input',
    name: 'inputValue',
    message: "['q' to quit] > "
  }, (result) => {
    const cliP1 = cliPrinter.createChild({ command: 'clip-test' })
    console.log(cliP1.indent.length)
    cliP1.info('result prompt:', result.inputValue)
    data = result
  })
  if (data.inputValue === 'q') return cliNext()
  console.log('222', data)

  cliNext()
})

vCli.addCommand('prompt1')
vCli.addCommandBody('prompt1', async function ({ cliNext, cliPrinter, cliPrompt }) {
  await cliPrompt({
    message: 'Insert a good value',
    showFn: () => {
      cliPrinter.orderedList(['item1', 'item2', 'item3'])
    }

  }, async ({ exit, input }) => {
    if (exit === true) {
      cliNext()
      return true
    }

    if (input === 'good') {
      cliPrinter.info('Well done! Free to go!')
      cliNext()
      return true
    }

    cliPrinter.error('Error, so... repeat!')
    return false
  })
})

vCli.show('abc')
