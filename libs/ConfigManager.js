class ConfigManager {

    constructor(){
        this._sampleScan = null;
        this._filename = {
            config: 'config.json',
            latest_lookup: 'temp/latest_lookup', //TODO: ensure dir temp!!!
            samples_index: 'temp/samples_index'
        };
        this._labels = {
            'sample_dir':'mpl'
        };
        this._cli_options = {
            tag_label:'-t',
            directory_name:'-d',
            force_overwrite:'-f'
        };
        try{
            this._config = require('../fd'+this._filename.config);
        }catch(e){

        }
    }

    printHelp(){
        let i=1;
        console.log("\nHELP");
        console.log("----------------------------------------------------------------------------------------------------");
        console.log("\n  set: modifies a configuration parameter.");
        console.log("       [e.g.#"+(i++)+"]  set Project project-name (or path)");
        console.log("       [e.g.#"+(i++)+"]  set Tag tag-label query,tag+tag2,or,tag3");
        console.log("\n  config: shows the current configuration parameters.");
        console.log("\n  scan: starts a full scan of the sample directory config.ProjectsDirectory.");
        console.log("\n  lookup: looks for the tags and selects random samples;");
        console.log("       the tag query is an AND/OR query (','=or, '+'=and).");
        console.log("       [e.g.#"+(i++)+"]  lookup query,tag+tag2,or,tag3");
        console.log("       [e.g.#"+(i++)+"]  lookup "+this._cli_options.tag_label+"=tag_label  / select the query from config.Tags[tag_label]");
        console.log("\n  save: create a directory with the samples previously found;");
        console.log("       the directory name is set automatically with some tag names;");
        console.log("       [e.g.#"+(i++)+"]  save "+this._cli_options.directory_name+"=dir-name  / use this option to specify a custom directory name");
        console.log("\n\n");
    }

    checkProperty(name){
        return !_.isUndefined(this._config[name]);
    }

    get(name){
        return this._config[name];
    }

    set(name, value){
        if(_.isArray(this._config[name])){
            if(!_.isArray(value)) { // no conversion
                return null;
            }
            return this._setFinalValue(name,value);
        }
        if(_.isObject(this._config[name])){
            if(!_.isObject(value)) {
                // no conversion
                return null;
            }
            return this._setFinalValue(name,value);
        }
        if(_.isInteger(this._config[name])){
            if(!_.isInteger(value)) {
                if(!_.isString(value)) return null;
                value = Utils.strToInteger(value);
                if(_.isNil(value)) return null;
            }
            return this._setFinalValue(name,value);
        }
        if(_.isNumber(this._config[name])){
            if(!_.isNumber(value)) {
                if(!_.isString(value)) return null;
                value = Utils.strToFloat(value);
                if(_.isNil(value)) return null;
            }
            return this._setFinalValue(name,value);
        }
        if(_.isString(this._config[name])){
            value = Utils.strToString(value);
            if(_.isNil(value)) return null;
            return this._setFinalValue(name,value);
        }
        return null;
    }

    _setFinalValue(n,v){
        if(n=="Project"){
            let ph = path.parse(v);
            v = ph.base || ph.name;
            let proj_dir = this._config['ProjectsDirectory'];
            if(_.isString(ph.dir) && ph.dir.length>0) proj_dir=ph.dir+path.sep;
            if(!Utils.File.directoryExists(proj_dir+v)){
                console.log("   The project directory does not exist: "+proj_dir+v);
                return;
            }
            this._config['ProjectsDirectory'] = ph.dir+path.sep;
        }
        this._config[n] = v;
        return v;
    }

    save(){
        let file_path = path.resolve(this._filename.config);
        let config_text = JSON.stringify(this._config, null, '\t');
        try{
            fs.writeFileSync(file_path, config_text, 'utf8');
        }catch(e){
            console.log(e);
            return false;
        }
        return true;
    }

    print(){
        console.log("\n  Configuration");
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
            console.log("    "+v+':'+" "+vprint);
        });
    }


    setFromCliParams(name,values){
        /* Custom action 'set' */
        if(name=='Tags') return this.setTags(values);
        return this.set(name,values[0]);
    }

    setTags(values){
        if(!_.isObject(this._config['Tags'])) this._config['Tags']={};
        if(values.length==1){
            if(!this._config['Tags'][values[0]]) return null;
            delete this._config['Tags'][values[0]];
        } else if(_.isString(values[1])) {
            this._config['Tags'][values[0]] = values[1];
        }
        return true;
    }
};

module.exports = new ConfigManager();
