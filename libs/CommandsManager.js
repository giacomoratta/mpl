
class CommandsManager {

    constructor(){
        this._error_code = -1;
        this._success_code = 1;
    }


    C_set(cli_params){
        if(_.isNil(cli_params[1])){
            console.log("Set command: missing property name");
            return this._error_code;
        }
        if(!Config.checkProperty(cli_params[1])){
            console.log("Set command: unknown property name '"+cli_params[1]+"'");
            return this._error_code;
        }
        let _new_prop_val=cli_params[2];
        if(_.isNil(_new_prop_val)){
            console.log("Set command: missing value for property");
            return this._error_code;
        }
        Config.setProperty(cli_params[1],_.slice(cli_params,2));
        Config.save();
    }


    C_lookup(cli_params){
        if(cli_params.length<2){
            console.log("Lookup command: missing tags or option (-t)");
            return this._error_code;
        }

        let tagList=null;
        if(cli_params[1]=='-t'){
            if(cli_params.length<3){
                console.log("Lookup command: missing tag name after option -t");
                return this._error_code;
            }
            let _tagList = Config.getProperty('tags')[cli_params[2]];
            if(_.isNil(_tagList)){
                console.log("Lookup command: unknown tag name after option -t");
                return this._error_code;
            }
            tagList = _.split(_tagList,',');

        } else {
            tagList = _.slice(cli_params,1);
        }

        if(_.isNil(tagList)) return null;
        let smp_obj = FS_Samples.searchSamplesByTags(_.slice(cli_params,1));
        FS_Samples.saveSampleObjectToFile(smp_obj);
        return smp_obj;
    }


    C_lookup_save(cli_params){
        let smp_obj = this.C_lookup(cli_params);
        if(smp_obj === this._error_code) return this._error_code;
        FS_Samples.generateSamplesDir(smp_obj);
    }
};

module.exports = new CommandsManager();
