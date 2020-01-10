const { CliVorpal } = require('../index')

describe('cli interface with vorpal library', function () {
  const myCli = new CliVorpal()
  it('should add a command', function () {
    expect(myCli.addCommand('cmdname1 <action> [query]')).toEqual('cmdname1')
    expect(myCli.addCommand('cmdname2 ')).toEqual('cmdname2')

    expect(myCli.addCommandHeader('cmdname2')).toHaveProperty('description')
    expect(myCli.addCommandHeader('cmdname2')).toHaveProperty('option')

    myCli.addCommandHeader('cmdname2')
      .description('Prints the samples collection' + '\n')
      .option('-a, --all', 'Shows all the bookmarks')
      .option('-l, --lookup', 'Shows the latest lookup')
      .option('-t, --tag <tag>', 'Shows the bookmarks under the specified custom tag')
      .option('-s, --save', 'Save bookmarks in the current project')
  })

  it('should set listener on events', function () {
    const myCli = new CliVorpal()
    expect(function () {
      myCli.on('show', () => {
        /* callback code */
      })
    }).not.toThrow()

    expect(function () {
      myCli.on('exit', () => {
        /* callback code */
      })
    }).not.toThrow()

    expect(function () {
      myCli.on('beforeCommand', () => {
        /* callback code */
      })
    }).not.toThrow()

    expect(function () {
      myCli.on('afterCommand', () => {
        /* callback code */
      })
    }).not.toThrow()

    expect(function () {
      myCli.on('show-wrong', () => {
        /* callback code */
      })
    }).toThrow('Invalid')
  })

  it('should set a custom logger', function () {
    expect(myCli.setLogger({
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      extra: () => {}
    })).toEqual(true)

    expect(myCli.setLogger({
      debug: () => {},
      info: () => {},
      warn: () => {}
    })).toEqual(false)
  })
})
