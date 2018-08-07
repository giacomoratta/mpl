const Samples = require('./Samples.class.js');

class SamplesManager {

    constructor(){
    }


    /**
     * The first check on the sample path, according to rules configured in config.json.
     * @param path_string
     * @returns {boolean}
     * @private
     */
    _checkSampleName(path_string){
        path_string = _.toLower(path_string);
        if(_.indexOf(ConfigMgr.get('ExtensionExcludedForSamples'),path.extname(' '+path_string))>=0){ //space needed to read 'only-ext' files
            return false;
        }
        return true;
    }


    /**
     * Start scanning the whole samples directory (see Configuration).
     * @returns { Samples | null }
     */
    scanSamples(){
        let smp_obj = new Samples();
        this._scanSamples(ConfigMgr.get('SamplesDirectory'), {
            maxRec:1000000, //1.000.000
            callback:function(path_string){
                console.log("  ",path_string);
                smp_obj.array.push(path_string);
            }
        });
        if(smp_obj.array.length<=0) return null;
        return smp_obj;
    }


    /**
     * Performs a recursive scan.
     * @param {Samples} smp_obj - object to fill
     * @param {string} dir_path
     * @param {object} _options
     * @private
     */
    _scanSamples(smp_obj, dir_path, _options){
        if(_options.maxRec<=0){
            console.log('scanSamples: max recursions reached');
            return;
        }
        _options.maxRec

        let items = fs.readdirSync(dir_path);
        items = Utils.sortFilesArray(items);

        for (let i=0; i<items.length; i++) {
            //console.log(' >> ',items[i]);

            let path_string = path.join(dir_path,items[i]);
            let fsStat = fs.lstatSync(path_string);

            if(fsStat.isDirectory()){
                this._scanSamples(path_string, _options);

            }else if(fsStat.isFile() && this._checkSampleName(path_string)){
                // checkSampleName on path_string because we want to accept samples belonging directory with good name
                _options.callback(path_string);
            }
        }
    }



    /**
     * Load the index file and store it in a Samples object.
     * @returns { Samples | null }
     */
    loadSampleScanFromFile(){
        let samples_index = path.resolve('./'+ConfigMgr._filename.samples_index);
        let json_string = '';
        try{
            json_string = fs.readFileSync(samples_index,'utf8');
        }catch(e){
            //console.log(e);
            return null;
        }
        let smp_obj = new Samples();
        if(!smp_obj.fromJsonString(json_string)) return null;
        return smp_obj;
    }


    /**
     * Create the index file for all samples.
     * @param {Samples} smp_obj
     * @returns {boolean}
     */
    saveSampleScanToFile(smp_obj){
        if(!smp_obj) return false;
        let samples_index = path.resolve('./'+ConfigMgr._filename.samples_index);
        let json_string = smp_obj.toJsonString();
        if(!json_string) return false;
        try{
            fs.writeFileSync(samples_index, json_string, 'utf8');
        }catch(e){
            //console.log(e);
            return false;
        }
        return true;
    }



    /**
     * Check and process the tag query string.
     * The tag string is formatted with ',' (OR) and '+' (AND).
     * @param {string} ts
     * @returns { object | null }
     */
    processTagString(ts){
        let proc_obj = {
            string:[],  //array with strings e.g. ['a+b+c','d+e']
            array:[],   //array with subarrays of separated tags
            check_fn:null,  //function used to check the filename
            _check_fn_string:"" //string with composed function which is evaluated
        };
        ts = _.toLower(ts).replace(/[^a-zA-Z0-9\s +,]/g,'');;

        /* Split tags and shuffle */
        let tagOR = _.split(ts,',');
        if(!_.isArray(tagOR) || tagOR.length<=0) return null;
        tagOR = _.shuffle(tagOR);

        /* Writing new function */
        tagOR.forEach(function(v1,i1,a1){
            let tagAND=_.split(v1,'+');
            proc_obj.array.push([]);
            tagAND.forEach(function(v2,i2,a2){
                v2=_.trim(v2);
                if(v2.length<=0) return;
                a2[i2]=_.trim(a2[i2]);
                proc_obj.array[i1].push(a2[i2]);
            });
            if(tagAND.length<=0) return;
            proc_obj._check_fn_string+="if( f.indexOf('"+ _.join(tagAND,"')>=0 && f.indexOf('") +"')>=0 ) return true;\n";
            proc_obj.string.push(_.join(tagAND,"+"));
        });
        proc_obj.string = _.join(proc_obj.string,", ");
        proc_obj._check_fn_string+="return false;\n";

        /* Building new function */
        proc_obj.check_fn = Utils.newFunction('f',proc_obj._check_fn_string);
        if(!proc_obj.check_fn) return null;

        delete proc_obj._check_fn_string;
        return proc_obj;
    }



    /**
     * Perform a search by tags.
     * The tag string is formatted with ',' (OR) and '+' (AND).
     * @param tagString
     * @returns { Samples | null }
     */
    searchSamplesByTags(tagString){
        let smp_obj = new Samples();
        let ptags_obj = this.processTagString(tagString);
        if(!ptags_obj) return null;

        console.log(" Looking for: '"+ptags_obj.string+"'");

        let attempts = 5;
        let _MaxOccurrencesSameDirectory = ConfigMgr.get('MaxOccurrencesSameDirectory');
        let _RandomCount = ConfigMgr.get('RandomCount');

        while(attempts>0){
            smp_obj.init();
            smp_obj.tags = ptags_obj.array;

            for(let i=0; i<ConfigMgr._sampleScan.length; i++) {
                if(ptags_obj.check_fn(_.toLower(ConfigMgr._sampleScan[i]))){
                    //console.log("  ",ConfigMgr._sampleScan[i]);
                    smp_obj.array.push(ConfigMgr._sampleScan[i]);
                }
            }
            if(smp_obj.array.length<=0) return smp_obj;

            smp_obj.setRandom(_RandomCount, _MaxOccurrencesSameDirectory);
            if(smp_obj.random.length==_RandomCount) break;
            _MaxOccurrencesSameDirectory++;
            attempts--;
        }
        if(smp_obj.random.length<=0) return smp_obj;

        Utils.printArrayOrderedList(smp_obj.random,'   ',function(n){ return n.substring(ConfigMgr.get('SamplesDirectory').length); });
        console.log("\n   Performed search: '"+ptags_obj.string+"'");
        console.log(  "   Random selection of "+_RandomCount+" samples","(max "+_MaxOccurrencesSameDirectory+" from the same directory)");
        return smp_obj;
    }



    /**
     * Check if the current lookup is equal to the preious one.
     * @param {Samples} smp_obj
     * @returns {boolean}
     */
    isEqualToPreviousLookup(smp_obj){
        let old_smp_obj = this.openLookupFile();
        if(!old_smp_obj) return false;
        if(smp_obj.random.length!=old_smp_obj.random.length) return false;
        let eq=true;
        for(let i=0; i<smp_obj.random.length; i++){
            if(smp_obj.random[i]!=old_smp_obj.random[i]){
                eq=false;
                break;
            }
        }
        return eq;
    }



    /**
     * Save the latest lookup on file.
     * @param {Samples} smp_obj
     * @returns { Promise{string} | null }
     */
    saveLookupToFile(smp_obj){
        if(!smp_obj) return null;
        let lookup_file = path.resolve('./'+ConfigMgr._filename.latest_lookup);
        let text_to_file = smp_obj.toText();
        return new Promise(function(res,rej){
            fs.writeFile(lookup_file, text_to_file, 'utf8',function(err){
                if(err){ rej(err); return; }
                res(lookup_file);
            });
        });
    }



    /**
     * Open the file with latest lookup
     * @returns { {Samples} | null }
     */
    openLookupFile(){
        let lookup_file = path.resolve('./'+ConfigMgr._filename.latest_lookup);
        let file_to_text = "";
        try{
            file_to_text = fs.readFileSync(lookup_file, 'utf8');
        }catch(e){
            //console.log(e);
            return null;
        }
        let smp_obj = new Samples();
        if(!smp_obj.fromText(file_to_text)) return null;
        smp_obj.random = smp_obj.array;
        return smp_obj;
    }



    /**
     * Generate the directory with samples.
     * @param {Samples} smp_obj
     * @param options
     *        - dirname: custom name for the directory
     *        - forcedir: force overwrite otherwise rename
     * @returns { Promise{array} | null }
     */
    generateSamplesDir(smp_obj,options){
        let _path = path;
        if(!_.isObject(options)) options={
            dirname:null,   //custom name
            forcedir:false, //force overwrite
            _smppath:null    //absolute path (private)
        };

        if(!_.isString(options['dirname']) || options['dirname'].length<2) options['dirname']=_.join(_.slice(smp_obj.tags,0,2),'_');//.substring(0,20);
        options['_smppath'] = path.join(ConfigMgr.get('ProjectsDirectory'), ConfigMgr.get('Project'),ConfigMgr._labels.sample_dir, options['dirname']);
        if(options['forcedir']!==true){
            options['_smppath'] = Utils.checkAndSetDirectoryName(options['_smppath']);
        }
        if(!options['_smppath']) return null;

        let p_array = [];
        let _links_dir = path.join(options['_smppath'],'_links');

        fs_extra.ensureDirSync(options['_smppath']);
        fs_extra.ensureDirSync(_links_dir);

        let smpl_arr = smp_obj.random;
        if(!smpl_arr || smpl_arr.length<=0) smpl_arr = smp_obj.array;
        if(!smpl_arr || smpl_arr.length<=0) return null;
        smpl_arr.forEach(function(v,i,a){
            let f_name = path.basename(v);
            let link_file_name = f_name+'___'+Utils.replaceAll(v.substring(ConfigMgr.get('SamplesDirectory').length),_path.sep,'___');
            p_array.push(fs_extra.copy(v,path.join(options['_smppath'] ,f_name)));
            p_array.push(new Promise(function(res,rej){
                fs.writeFile(path.join(_links_dir ,link_file_name), v, 'utf8',function(err){
                    if(err){
                        //return rej(err);
                        console.log('   generateSamplesDir - error on file '+link_file_name);
                        console.error(err);
                        console.log("\n");
                    }
                    return res(link_file_name);
                });
            }));
        });

        return Promise.all(p_array)
            .then(function(data){
                //console.log('success!');
                return data;
            })
            .catch(function(err){
                console.error(err);
            });
    }
};

module.exports = new SamplesManager();
