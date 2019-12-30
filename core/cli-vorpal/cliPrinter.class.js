const INDENT = '  '
const NL = '\n'

class CliPrinter {
  constructor ({ command, indentLevel = 1 }) {
    this.command = command
    this.indent = INDENT.repeat(indentLevel)
  }

  createChild ({ command }) {
    return new this.constructor({ command, indentLevel:this.indent+1 })
  }

  newLine (count=0) {
    console.info(`${NL.repeat(count)}`)
  }

  info (message) {
    console.info(`${this.indent}${message}`)
  }

  warn (message) {
    console.info(`${this.indent}WARNING: ${message}`)
  }

  error (message) {
    console.info(`${this.indent}ERROR: ${message}`)
  }

  title (message) {
    console.info(`${NL}${this.indent}${message}`)
  }

  orderedList (array) {
    if (!array) return
    let i = 1
    array.forEach((e) => {
      console.info(`${this.indent}${i++} ${e}`)
    })
    console.info('')
  }

  unorderedList (array) {
    if (!array) return
    array.forEach((e) => {
      console.info(`${this.indent}- ${e}`)
    })
    console.info('')
  }

  simpleMap (object) {
    if (!object) return
    Object.keys(object).forEach((k) => {
      console.info(`${this.indent}  ${k}: ${object[k]}`)
    })
    console.info('')
  }

  simpleMapByKey (object) {
    if (!object) return
    Object.keys(object).sort().forEach((k) => {
      console.info(`${this.indent}  ${k}: ${object[k]}`)
    })
    console.info('')
  }
}

module.exports = {
  CliPrinter
}
