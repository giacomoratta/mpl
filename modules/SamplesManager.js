class SamplesManager {

    constructor(){

        /* LABELS */
        this._LABEL_samples_index = 'samples_index';

        /* CACHES */
        this._CACHE_latest_smp_obj_search = null;
        this._CACHE_stqall = new DataCache(); //Sampleby_Tag_Query_ALL
        this._CACHE_stqrnd = new DataCache(); //Sampleby_Tag_Query_RANDOM

        /* DATA HOLDER */
        this._createIndexHolder({
                label: this._LABEL_samples_index,
                filePath: ConfigMgr.path('samples_index'),
                directoryToScan: ConfigMgr.path('samples_directory')
        });
    }

    _createIndexHolder(options){
        let __new_SamplesTree = function(){
            let STree = new SamplesTree(options.directoryToScan,{
                /* SampleTree options */
            },{
                /* DirectoryTree options */
                excludedExtensions:ConfigMgr.get('ExtensionExcludedForSamples')
            });
            return STree;
        }

        return DataMgr.setHolder({
            label:options.label,
            filePath:options.filePath,
            fileType:'json',
            dataType:'object',
            logErrorsFn:console.log,
            preLoad:true,

            checkFn:(STree,args)=>{
                return (STree && STree.T && !STree.T.error());
            },

            getFn:(STree, $cfg, args)=>{
                if(!$cfg.checkFn(STree,args)) return;
                return STree;
            },

            printFn:(STree, $cfg, args)=>{
                STree.T.print();
            },

            setFn:($cfg,args)=>{
                let STree = __new_SamplesTree();
                STree.T.read();
                if(!$cfg.checkFn(STree)) return;
                return STree;
            },

            loadFn:(fileData, $cfg, args)=>{
                if(!_.isObject(fileData)) return;
                let STree = __new_SamplesTree();
                STree.T.fromJson(fileData);
                if(!$cfg.checkFn(STree)) return;
                return STree;
            },

            saveFn:(STree, $cfg, args)=>{
                if(!$cfg.checkFn(STree)) return;
                return STree.T.toJson();
            }
        });
    }


    getLatestLookup(){
        return this._CACHE_latest_smp_obj_search;
    }

    setLatestLookup(smp_obj){
        this._CACHE_latest_smp_obj_search = smp_obj;
    }


    /**
     * Check the main index file
     * @returns { boolean | null } true if exists, false if not exists, null if missing data
     */
    sampleIndexFileExistsSync(){
        return DataMgr.fileExistsSync(this._LABEL_samples_index);
    }


    printSamplesTree(){
        DataMgr.print(this._LABEL_samples_index)
    }


    hasSamplesIndex(){
        return DataMgr.hasData(this._LABEL_samples_index);
    }


    setSamplesIndex(options){
        options = _.merge({
            //printFn:function(){},
            force:false
        },options);

        if(options.force === true){
            let smp_obj = DataMgr.set(this._LABEL_samples_index);
            if(!DataMgr.save(this._LABEL_samples_index)) return;
            return smp_obj;
        }
        return DataMgr.load(this._LABEL_samples_index);
    }


    searchSamplesByTags(tagString, random){
        this.setLatestLookup(null);

        let _self = this;
        let smp_obj_search = this._CACHE_stqall.get(tagString /* label */,function(){

            let ST = DataMgr.get(_self._LABEL_samples_index);
            if(!ST) return null;

            let smp_obj2 = ST.filterByTags(tagString);
            if(smp_obj2.error() || smp_obj2.size()==0) return null;

            return smp_obj2;
        });
        if(!smp_obj_search) return null;
        if(random!==true){
            this.setLatestLookup(smp_obj_search);
            return smp_obj_search;
        }

        this._CACHE_stqrnd.remove(tagString /* label */);
        let smp_obj_search_random = this._CACHE_stqrnd.get(tagString /* label */,function(){

            let smp_rnd_obj2 = smp_obj_search.getRandom(ConfigMgr.get('RandomCount'),ConfigMgr.get('MaxOccurrencesSameDirectory'));
            if(smp_rnd_obj2.error() || smp_rnd_obj2.size()==0) return null;

            return smp_rnd_obj2;
        });

        if(!smp_obj_search_random) return null;
        this.setLatestLookup(smp_obj_search_random);
        return smp_obj_search_random;
    }



    /**
     * Generate the directory with samples.
     * @param {Samples} smp_obj
     * @param options
     *        - dirname: custom name for the directory
     *        - overwrite: force overwrite otherwise rename
     * @returns { Promise{array} | null }
     */
    generateSamplesDir(smp_obj,options){
        if(!_.isObject(options)) options={
            dirname:null,   //custom name
            overwrite:false, //force overwrite
            path:null   //absolute path
        };

        // Set Path
        if(!_.isString(options.path)){
            if(!_.isString(options.dirname) || options.dirname.length<2) options.dirname=smp_obj.getTagShortLabel(); // DirName
            options.path = Utils.File.pathJoin(ConfigMgr.get('Project'),ConfigMgr._labels.sample_dir, options.dirname);
        }

        // Overwrite
        if(options.overwrite===true){
            Utils.File.removeDirSync(options.path);
        }else{
            options.path = Utils.File.checkAndSetDuplicatedDirectoryNameSync(options.path);
        }
        if(!options.path) return _.readyPromise(null);
        if(smp_obj.empty()) return _.readyPromise(null);

        let p_array = [];
        let fname_array = [];
        let smp_copied_obj = smp_obj.createEmptyFromThis();
        let _links_dir = Utils.File.pathJoin(options.path,'_links');

        Utils.File.ensureDirSync(options.path);
        Utils.File.ensureDirSync(_links_dir);

        //console.log('   generateSamplesDir - start copying '+smp_obj.size()+' files...');
        smp_obj.forEach(function(item,index){

            let f_name = _.noDuplicatedValues(fname_array,Utils.File.pathBasename(item.path),(v,cv,i,a)=>{
                if(_.indexOf(a,cv)<0) return true;
                return Utils.File.pathChangeFilename(v,(old_name)=>{
                    return old_name+'_'+i;
                });
            });
            fname_array.push(f_name);
            let link_file_name = f_name+'___'+Utils.replaceAll(item.path.substring(ConfigMgr.get('SamplesDirectory').length),Utils.File.pathSeparator,'___');

            /* Copy File */
            p_array.push(Utils.File.copyFile( item.path, Utils.File.pathJoin(options.path, f_name) ).then(function(data){
                smp_copied_obj.add(item);
                //console.log('   generateSamplesDir - sample file successfully copied '+data.path_to);
            }).catch(function(data){
                d$('generateSamplesDir - sample file copy failed '+data.path_to,data.err);
            }));

            /* Create txt link file */
            p_array.push(Utils.File.writeTextFile(Utils.File.pathJoin(_links_dir ,link_file_name), item.path /* text */).then(function(data){
                // do something
            }).catch(function(data){
                d$('generateSamplesDir - link file copy failed '+data.path_to,data.err);
            }));
        });

        return Promise.all(p_array)
            .then(function(data){
                //console.log('   generateSamplesDir - '+(smp_copied_obj.size())+'/'+(smp_obj.size())+' files copied.');
                return smp_copied_obj;
            })
            .catch(function(err){
                d$('generateSamplesDir - error on final step',err);
            });
    }






    /* ... work in progress ...*/


    /**
     * Check the coverage (or uncoverage) of all samples.
     * @param options
     *        - path: custom absolute path for the directory
     *        - query: custom query string with tags
     *        - getUncovered: true to collect uncovered samples
     *        - consoleOutput: true to print result directly in the console
     *        - createIndexes: true to generate the index files
     * @returns {Samples} smp_obj
     */
    checkSamplesCoverage(options){
        options = _.merge({
            stats:true,
            path:null,
            pathCustom:false,
            query:null,
            consoleOutput:true,
            createIndexes:false,
            _output:{
                max_length_tag_string:10
            }
        },options);

        let _d = function(m){ arguments[0]='coverage: '+arguments[0]; console.log.apply(null,arguments); };

        options.console_log = (options.consoleOutput===true?console.log:function(){});

        /* Check query */
        let _tagQueries = {};
        if(_.isString(options.query)){
            _d("query from string");
            _tagQueries['default']=options.query;
        }else if(_.isObject(ConfigMgr.get('Tags'))) {
            _d("query from config.Tags");
            _tagQueries = ConfigMgr.get('Tags');
        }
        _d("tagQueries are",_tagQueries,"\n");
        if(_tagQueries.length<=0) return null;

        /* Process all tag queries */
        let _ptags = [];
        Object.keys(_tagQueries).forEach(function(v,i,a){
            let ptag_obj = Samples.processTagString(_tagQueries[v],_ptags);
        });
        _ptags.forEach(function(v){
            if(v.string.length > options._output.max_length_tag_string)
                options._output.max_length_tag_string=v.string.length;
        });
        _d("found ",_ptags.length," tag 'AND conditions'\n");
        //_d("processed tag 'AND conditions' are",_ptags,"\n");
        //_d("processed tag 'AND conditions' are"); _ptags.forEach(function(v){ console.log("\t"+v.string); });
        if(_ptags.length<=0) return null;

        /* Check path */
        if(_.isString(options.path)){
            _d("path from string; scanning the absolute path "+options.path+" ...");
        }else{
            options.path = null;
            _d("path from config; reading the scan index...");
            options.progressive = true;
            _d("setting progressive as 'true'...");
        }

        let ST = DataMgr.get(this._LABEL_samples_index);
        if(ST.empty()){
            _d("Cannot check the coverage: no samples found. \n");
            return null;
        }

        /* Option fixes */
        if(options.stats) {
            options.progressive = options.progressive_keepalive = false;
        }

        return this._checkSamplesCoverage(ST, options, _ptags, _d);
    }

    _checkSamplesCoverage(ST, options, _ptags, _d){
        _d("checking the coverage of "+ST.size()+" samples...");

        // _ptags = array of {string,check_fn} objects
        _.sortBy(_ptags, [function(o) { return o.string; }]);
        options.path = ST.getOriginPath();

        let coverage_array = [];
        let __uncovered_items = {};

        _ptags.forEach(function(v1,i1,a1){

            let smp_coverage = new SamplesTree();
            smp_coverage.setTags(v1.tag_array);
            coverage_array.push({
                covered:0,
                uncovered:0,
                query:v1.string,
                samples:smp_coverage
            });

            let coverage_item = coverage_array[coverage_array.length-1];

            ST.T.forEach({
                itemCb:function(data){
                    if(!__uncovered_items[data.item.n_path]) __uncovered_items[data.item.n_path]={ path:data.item.path, check:true };

                    let is_covered = v1.check_fn(data.item.n_path);
                    if(is_covered===options.lookingForCovered){
                        smp_coverage.addItem(data.item);
                    }
                    if(is_covered){
                        coverage_item.covered++;
                        __uncovered_items[data.item.n_path].check = false;
                    }
                    else{
                        coverage_item.uncovered++;
                        //if(uncovered_items.indexOf(item.path)<0) uncovered_items.push(item.path);
                    }
                }
            });

            if(options.consoleOutput){
                if((options.progressive || options.progressive_keepalive)){
                    options.console_log("\n");
                    smp_coverage.forEach(function(item,index){ options.console_log("    "+(item.path.substring(options.path.length))); });
                    options.console_log("  "+_.repeat('-', 100));
                }

                options.console_log(_.padEnd(/*"    Q#"+(i1+1)+" "*/"     "+v1.string,options._output.max_length_tag_string+9)+
                                    ' c:'+_.padEnd(coverage_item.covered,10)+
                                    ' u:'+_.padEnd(coverage_item.uncovered,10)+
                                    ' coverage:'+_.padEnd(Math.round((coverage_item.covered/(coverage_item.covered+coverage_item.uncovered)*100))+'%',5));
            }

            /* Save Custom INDEX */
            if(!options.pathCustom && options.createIndexes===true && coverage_item.uncovered<=0){
                //reading from config.samplesdir
                this.saveSampleScanToFile(smp_coverage,true /*is_custom_index*/);
            }

            /* Progressive */
            if(options.progressive &&
                ((options.lookingForCovered && coverage_item.covered>0)
                    || (!options.lookingForCovered && coverage_item.uncovered>0))
            ){
                return;
            }

            /* Progressive and Keep-Alive */
            if(options.progressive_keepalive &&
                ((options.lookingForCovered && coverage_item.covered>0)
                    || (!options.lookingForCovered && coverage_item.uncovered>0))
            ){
                CliMgr.waitForEnter('...');
            }
        });
        options.console_log("");

        if(options.stats){
            //uncovered_items.sort();
            let __uncovered_items_count = 0;
            Object.keys(__uncovered_items).forEach(function(v){
                if(__uncovered_items[v].check===false) return;
                options.console_log("    "+__uncovered_items[v].path);
                __uncovered_items_count++;
            });
            if(__uncovered_items_count>0) options.console_log("  Found "+__uncovered_items_count+" uncovered samples.");
            else options.console_log("  All samples are covered!");
        }

        return coverage_array;
    }
};

module.exports = new SamplesManager();
