const path = require('path')
const tH = require('./dataFieldBuiltIn.testHelpers')('relFilePath')

describe('DataFieldBuiltInFactory relFilePath field type', function () {
  beforeAll(function () {
    tH.DFBF.initFactory()
  })

  it('should throw notRelFilePath error', function () {
    tH.throwInvalidPathFn('notRelFilePath')
  })

  // it('should throw fileNotExists error', function () {
  //   tH.throwPathNotExistsFn('fileNotExists', path.join('not', 'exists'))
  // })
  //
  // it('should throw fileAlreadyExists error', function () {
  //   tH.throwPathAlreadyExistsFn('fileAlreadyExists', path.join('directory1', 'file11.txt'), tH.testDir)
  // })
  //
  // it('should throw fileNotCreated error', function () {
  //   tH.throwPathNotCreatedFn('fileNotCreated', path.join(tH.rootDir, 'new-file33.txt'))
  // })

  it('should support empty initial path', function () {
    tH.supportEmptyInitialPath('notRelFilePath')
  })

  it('should support default path', function () {
    tH.supportDefaultPath(path.join('directory1', 'file11.txt'), tH.testDir)
  })

  // it('should support schema.presence = true', function () {
  //   tH.schemaPresenceTrueFn(path.join('directory1', 'file11.txt'), tH.testDir)
  // })
  //
  // it('should support schema.presence = false', function () {
  //   tH.schemaPresenceFalseFn(path.join('directory1', 'not', 'file11.txt'), tH.testDir)
  // })
  //
  // it('should support schema.ensure (not create)', function () {
  //   tH.schemaEnsureFn(path.join('directory1', 'file11.txt'), false, tH.testDir)
  // })
  //
  // it('should support schema.ensure (create)', function () {
  //   tH.schemaEnsureFn(path.join('directory1', 'file123.txt'), true, tH.testDir)
  // })

  it('should have fn.exists', async function () {
    await tH.customFnExists(path.join('directory1', 'file11.txt'), tH.testDir)
  })

  it('should have fn.ensure and fn.delete', async function () {
    await tH.customFnEnsureDelete(path.join('directory1', 'file44.txt'), tH.testDir)
  })

  /* Tests for relative path fields  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  */

  it('should throw invalidBasePath error', function () {
    tH.throwInvalidBasePathFn('invalidBasePath')
  })

  it('should have fn.changeBasePath', function () {
    tH.customFnChangeBasePath(path.join(tH.testDir, 'directory2', 'file543.txt'))
  })

  it('should have fn.fromAbsPath', function () {
    tH.customFnFromAbsPath(
      path.join('directory1', 'directory2', 'file123.txt'),
      tH.testDir,
      path.join(tH.testDir, 'directory1', 'directory33', 'file777.txt'),
      path.join(tH.rootDir, 'different', 'root', 'file999.txt')
    )
  })

  it('should have fn.toAbsPath', function () {
    tH.customFnToAbsPath(path.join('directory1', 'directory2', 'file9292'), tH.testDir)
  })
})
