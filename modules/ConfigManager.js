class ConfigManager {

    constructor(options){
        this._flags = {
            samples_index_scan_needed:false,
            samples_index_update_needed:false,
        };

        options = this._parseExternalOptions(options);
        this._paths = {
            config_file: options.config_file,
            config_file_sample: options.config_file_sample,
            temp_dir: options.temp_dir,
            custom_indexes: options.custom_indexes,
            latest_lookup: options.latest_lookup,
            samples_index: options.samples_index,
            bookmarks: options.bookmarks
        };
        this._labels = {
            'sample_dir':'mpl'
        };

        // Check and set paths
        this._paths.config_file = Utils.File.setAsAbsPath(this._paths.config_file,true /*isFile*/);
        this._paths.config_file_sample = Utils.File.setAsAbsPath(this._paths.config_file_sample,true /*isFile*/);
        this._paths.temp_dir = Utils.File.setAsAbsPath(this._paths.temp_dir);
        this._paths.custom_indexes = Utils.File.setAsAbsPath(this._paths.custom_indexes);
        this._paths.latest_lookup = Utils.File.setAsAbsPath(this._paths.latest_lookup,true /*isFile*/);
        this._paths.samples_index = Utils.File.setAsAbsPath(this._paths.samples_index,true /*isFile*/);
        this._paths.bookmarks = Utils.File.setAsAbsPath(this._paths.bookmarks,true /*isFile*/);
        this._paths.project_directory = null;
        this._paths.samples_directory = null;
        this._paths.export_directory = null;

        // DataManager
        DataMgr.setHolder({
            label:'config_file',
            filePath:this._paths.config_file,
            fileType:'json',
            dataType:'object',

            preLoad:true,
            cloneFrom:this._paths.config_file_sample,
            logErrorsFn:console.log
        });

        // Open config.json
        this._config = DataMgr.get('config_file');
        if(!this._config){
            Utils.EXIT('Cannot create or read the configuration file '+this.path('config_file'));
        }

        // Check and set paths [2]
       this._setInternals(true /*isInit*/);

        // Create directories
        Utils.File.ensureDirSync(this.path('temp_dir'));
        Utils.File.ensureDirSync(this.path('custom_indexes'));
    }

    _parseExternalOptions(options){
        options = _.merge({
            config_file: 'config.json',
            config_file_sample: 'config.sample.json',
            temp_dir: 'temp/',
            custom_indexes: 'temp/c_indexes/',
            latest_lookup: 'temp/latest_lookup',
            samples_index: 'temp/samples_index',
            bookmarks: 'temp/bookmarks.json',
        },options);
        return options;
    }


    _setInternals(){
        this._paths.samples_directory = Utils.File.checkAndSetPathSync(this._config.SamplesDirectory);
        if(!this._paths.samples_directory) clUI.warning("Sample directory does not exist: ",this._config.SamplesDirectory);

        this._paths.project_directory = Utils.File.checkAndSetPathSync(this._config.Project);
        if(!this._paths.project_directory) clUI.warning("The project directory does not exist: ",this._config.Project);

        this._paths.export_directory = Utils.File.checkAndSetPathSync(this._config.ExportDirectory);
        clUI.print(); //new empty row
    }


    path(name){
        return this._paths[name];
    }

    getFlag(name){
        return this._flags[name];
    }

    setFlag(name,value){
        this._flags[name] = value;
    }


    getConfigParams(){
        return Object.keys(this._config);
    }


    printInternals(){
        clUI.print("Internal Configuration");
        let _self = this;
        clUI.print("  # Work directories");
        Object.keys(this._paths).forEach(function(v){
            clUI.print("    "+v+" : "+_self._paths[v]);
        });
    }


    get(name){
        return this._config[name];
    }

    _set(old_v,new_v){
        let _outcome_error = { error:true, type:null, value:null };
        let _outcome_value = { error:false, type:null, value:new_v };

        if(_.isArray(old_v)){
            _outcome_value.type = _outcome_error.type = 'array';
            if(!_.isArray(new_v) && !_.isString(new_v)) { // no conversion
                return _outcome_error;
            }
            _outcome_value.value = new_v;
            return _outcome_value;
        }

        if(_.isObject(old_v)){
            _outcome_value.type = _outcome_error.type = 'object';
            if(!_.isObject(new_v)) {
                // no conversion
                return _outcome_error;
            }
            _outcome_value.value = new_v;
            return _outcome_value;
        }

        // if(_.isInteger(old_v)){
        //     _outcome_value.type = _outcome_error.type = 'integer';
        //     if(!_.isInteger(new_v)) {
        //         if(!_.isString(new_v)) return _outcome_error;
        //         new_v = Utils.strToInteger(new_v);
        //         if(_.isNil(new_v)) return _outcome_error;
        //     }
        //     _outcome_value.value = new_v;
        //     return _outcome_value;
        // }

        if(_.isNumber(old_v)){
            _outcome_value.type = _outcome_error.type = 'number';
            if(!_.isNumber(new_v)) {
                if(!_.isString(new_v)) return _outcome_error;
                new_v = Utils.strToFloat(new_v);
                if(_.isNil(new_v)) return _outcome_error;
            }
            _outcome_value.value = new_v;
            return _outcome_value;
        }

        if(_.isBoolean(old_v)){
            _outcome_value.type = _outcome_error.type = 'boolean';
            new_v = Utils.strToBoolean(new_v);
            if(_.isNil(new_v)) return _outcome_error;
            _outcome_value.value = new_v;
            return _outcome_value;
        }

        if(_.isString(old_v)){
            _outcome_value.type = _outcome_error.type = 'string';
            new_v = Utils.strToString(new_v);
            if(_.isNil(new_v)) return _outcome_error;
            _outcome_value.value = _.trim(new_v);
            return _outcome_value;
        }

        return _outcome_error;
    }

    set(name, value){
        let _outcome = this._set(this._config[name],value);
        if(_outcome.error!==false){
            if(_outcome.type){
                clUI.print("> current value and old value have different types:");
                clUI.print("    old: ",this._config[name]);
                clUI.print("    new: ",value);
            }
            return null;
        }
        let _new_value = this._setFinalValue(name,_outcome);
        if(_new_value===null) return null;

        this._setInternals();

        DataMgr.set('config_file',this._config);
        return _new_value;
    }


    _setFinalValue(n,_outcome){
        let v = _outcome.value;
        let v_copy = v;

        if(n==="Project"){
            v = Utils.File.checkAndSetPathSync(v);
            if(!v){
                clUI.print("The projects directory does not exist: "+v_copy);
                return null;
            }
        }

        else if(n==="ExportDirectory"){
            if(!Utils.File.isAbsoluteParentDirSync(v)){
                clUI.print("The export directory has not a valid path: "+v_copy);
                return null;
            }
        }

        else if(n==="SamplesDirectory"){
            v = Utils.File.checkAndSetPathSync(v);
            if(!v){
                clUI.print("The samples directory does not exist: "+v_copy);
                return null;
            }
            this.setFlag('samples_index_update_needed',true);
        }

        else if(n==="ExtensionCheckForSamples"){
            if(_.indexOf(['I','E','X'],v)<0){
                clUI.print("Wrong value for ExtensionCheckForSamples. Allowed values: I (included), E (excluded), X (disabled)");
                return null;
            }
            this.setFlag('samples_index_update_needed',true);
        }

        else if(_outcome.type==='array'){

            if(this._config[n].length>0){
                let _ot = this._set(this._config[n][0],v);
                if(_ot.error===true){
                    if(_ot.type){
                        clUI.print("Config.set [Array]: current value and old value have different types.");
                        clUI.print("\n                   old: ",this._config[n][0]);
                        clUI.print("\n                   new: ",v);
                    }
                    return null;
                }
            }

            if(n==="IncludedExtensionsForSamples" || n==="ExcludedExtensionsForSamples"){
                if(v[0]==='!'){
                    v=v.slice(1);
                    if(v[0]==='.') v=v.slice(1);
                    _.remove(this._config[n],function(value){ return (value===v || value==='.'+v ); });
                    this.setFlag('samples_index_update_needed',true);
                    return v;
                }
                if(v[0]==='.') v=v.slice(1);
            }
            if(this._config[n].indexOf(v)<0) this._config[n].push(v);
            this.setFlag('samples_index_update_needed',true);
            return this._config[n];
        }

        this._config[n] = v;
        return v;
    }

    save(){
        DataMgr.set('config_file',this._config);
        return DataMgr.save('config_file');
    }

    print(){
        clUI.print("Configuration File");
        let keys = _.keys(this._config);
        let _this=this;
        keys.forEach(function(v){
            let vprint = '';
            if(_.isArray(_this._config[v])) vprint=JSON.stringify(_this._config[v], null, '');
            else if(_.isObject(_this._config[v])){
                vprint=JSON.stringify(_this._config[v], null, '  ');
                if(vprint.length>3) vprint = "\n\t  "+Utils.replaceAll(vprint,"\n","\n\t  ");
            }
            else vprint=JSON.stringify(_this._config[v], null, '');
            clUI.print("  "+v+':'+" "+vprint);
        });
    }


    setFromCliParams(name,values){
        if(!_.isString(name) || !_.isArray(values)) return null;
        /* Custom action 'set' */
        if(name==='Tags') return this.setTags(values);
        return this.set(name,values[0]);
    }

    setTags(values){
        if(!_.isObject(this._config['Tags'])) this._config['Tags']={};
        if(values.length===1){
            if(!this._config['Tags'][values[0]]) return null;
            delete this._config['Tags'][values[0]];
        } else if(_.isString(values[1])) {
            this._config['Tags'][values[0]] = values[1];
            this._config['Tags'] = Utils.sortObjectByKey(this._config['Tags']);
        }
        return true;
    }

    printMessages(){
        clUI.print("");
        if(this.getFlag('samples_index_scan_needed')===true){
            clUI.print("\nWARNING: no samples index detected; perform 'scan' before using other commands.\n");
        }
        if(this.getFlag('samples_index_update_needed')===true){
            clUI.print("\nWARNING: samples index not compliant with current configuration;");
            clUI.print(  "         perform 'scan -f' before using other commands otherwise you could get wrong results.\n");
        }
    }
}

module.exports = new ConfigManager(global.ConfigManagerOptions);
