class DirCommand {
  constructor () {
    this._cache_extsearch = null
    this._cache_extsearch_samplesindex = null
  }

  _listExtensionsStats_getSearchObj (options) {
    const _esobj = {
      path: configMgr.cfg_path('SamplesDirectory'),
      extensions: {},
      filepaths: {},
      filecount: 0
    }
    const _DT_walk_options = {
      itemFn: (data) => {
        if (!data.item.isFile) return
        // let _ext = (item.ext.length>0?item.ext:item.base);
        const _ext = data.item.ext
        if (_ext.length == 0) return
        if (!_esobj.extensions[_ext]) {
          _esobj.filepaths[_ext] = []
          _esobj.extensions[_ext] = 0
        }
        _esobj.filepaths[_ext].push(data.item.rel_path)
        _esobj.extensions[_ext]++
        _esobj.filecount++
      }
    }

    if (options.index !== true) {
      if (!_.isObject(this._cache_extsearch) ||
                this._cache_extsearch.path != _esobj.path
      ) {
        directoryTree.walkDirectory(_esobj.path, _DT_walk_options)
        _esobj.extensions = Utils.sortObjectByValue(_esobj.extensions)
        this._cache_extsearch = _esobj
      }
      return this._cache_extsearch
    } else {
      if (!_.isObject(this._cache_extsearch_samplesindex) ||
                this._cache_extsearch_samplesindex.path != _esobj.path
      ) {
        const _sidt = SamplesMgr.getSamplesIndex_directoryTree()
        if (!_sidt) return null
        _sidt.forEach(_DT_walk_options)
        _esobj.extensions = Utils.sortObjectByValue(_esobj.extensions)
        this._cache_extsearch_samplesindex = _esobj
      }
      return this._cache_extsearch_samplesindex
    }
  }

  listExtensionsStats (options) {
    options = _.merge({
      extension: null, // focus on this extension
      index: false // focus on this extension
    }, options)
    const _esobj = this._listExtensionsStats_getSearchObj(options)
    if (!_esobj) {
      clUI.print('No data found ')
      return
    }

    if (_.isString(options.extension) && options.extension.length > 0) {
      if (options.extension[0] != '.') options.extension = '.' + options.extension
      if (!_.isArray(_esobj.filepaths[options.extension]) || _esobj.filepaths[options.extension].length == 0) {
        clUI.print("No files for the extension '" + options.extension + "' ")
        return
      }
      clUI.print("Files found with extension '" + options.extension + "' ")
      for (let i = 0; i < _esobj.filepaths[options.extension].length; i++) {
        clUI.print(' ', _esobj.filepaths[options.extension][i])
      }
      return
    }

    const k = _.keys(_esobj.extensions)
    if (k.length == 0) {
      clUI.print("No libs found in '" + _esobj.path + "' ")
      return
    }

    const padding = ('' + _esobj.filecount + '').length
    clUI.print("Extensions found in '" + _esobj.path + "' ")
    for (let i = 0; i < k.length; i++) {
      clUI.print(' ', _.padStart(_esobj.extensions[k[i]], padding), '', k[i])
    }
  }
}

module.exports = new DirCommand()
