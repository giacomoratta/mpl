const Samples = require('./Samples.class.js');

class SamplesManager {

    constructor(){
        this._samples_index_label = 'samples_index';
        this._createIndexHolder({
                label: this._samples_index_label,
                filePath: ConfigMgr.path('samples_index'),
                directoryToScan: ConfigMgr.path('samples_directory')
        });
    }

    _createIndexHolder(options){
        return DataMgr.setHolder({
            label:options.label,
            filePath:options.filePath,
            fileType:'json',
            dataType:'object',
            logErrorsFn:console.log,
            preLoad:true,

            checkFn:(dataObj,args)=>{
                return (dataObj && !dataObj.error());
            },

            getFn:(dataObj,$cfg,args)=>{
                return dataObj;
            },

            printFn:(dataObj,$cfg,args)=>{
                if(!dataObj) return;
                dataObj.walk({
                    itemCb:(data)=>{
                        console.log(_.padStart(' ',(data.item.level+1)*3),data.item.rel_path,'('+data.item.sizeString+')');
                    }
                });
            },

            setFn:($cfg,args)=>{
                let tt = new DirectoryTree(options.directoryToScan);
                tt.read({
                    fileAcceptabilityFn:function(/* {PathInfo} */ item){
                        return ( _.indexOf( ConfigMgr.get('ExtensionExcludedForSamples') , _.toLower((item.ext.length!=0?item.ext:item.name)) )<0 );
                    }
                });
                if(!tt.error()) return tt;
                return null;
            },

            loadFn:(fileData,$cfg,args)=>{
                if(!_.isObject(fileData)) return null;
                let tt = new DirectoryTree(options.directoryToScan);
                tt.fromJson(fileData);
                if(!tt.error()) return tt;
                return null;
            },

            saveFn:(dataObj,$cfg,args)=>{
                if(!$cfg.checkFn(dataObj)) return;
                return dataObj.toJson();
            }
        });
    }


    /**
     * Check the main index file
     * @returns { boolean | null } true if exists, false if not exists, null if missing data
     */
    sampleIndexFileExistsSync(){
        return DataMgr.fileExistsSync(this._samples_index_label);
    }


    setSamplesIndex(options){
        options = _.merge({
            printFn:function(){},
            force:false
        },options);

        if(options.force === true){
            return DataMgr.set(this._samples_index_label);
        }
        return DataMgr.load(this._samples_index_label);
    }





    /* ... work in progress ...*/

    /**
     * Generate the directory with samples.
     * @param {Samples} smp_obj
     * @param options
     *        - dirname: custom name for the directory
     *        - forcedir: force overwrite otherwise rename
     * @returns { Promise{array} | null }
     */
    generateSamplesDir(smp_obj,options){
        if(!_.isObject(options)) options={
            dirname:null,   //custom name
            forcedir:false, //force overwrite
            _smppath:null    //absolute path (private)
        };

        if(!_.isString(options['dirname']) || options['dirname'].length<2) options['dirname']=_.join(_.slice(smp_obj.getTags(),0,2),'_');//.substring(0,20);
        options['_smppath'] = Utils.File.pathJoin(ConfigMgr.get('Project'),ConfigMgr._labels.sample_dir, options['dirname']);
        if(options['forcedir']!==true){
            options['_smppath'] = Utils.File.checkAndSetDuplicatedDirectoryNameSync(options['_smppath']);
        }
        if(!options['_smppath']) return null;
        if(smp_obj.empty()) return null;

        let p_array = [];
        let _links_dir = Utils.File.pathJoin(options['_smppath'],'_links');

        Utils.File.ensureDirSync(options['_smppath']);
        Utils.File.ensureDirSync(_links_dir);

        console.log('   generateSamplesDir - start copying '+smp_obj.size()+' files...');
        smp_obj.forEach(function(item,index){
            let f_name = Utils.File.pathBasename(item.path);
            let link_file_name = f_name+'___'+Utils.replaceAll(item.path.substring(ConfigMgr.get('SamplesDirectory').length),Utils.File.pathSeparator,'___');

            /* Copy File */
            p_array.push(Utils.File.copyFile( item.path, Utils.File.pathJoin(options['_smppath'] ,f_name) ).then(function(data){
                console.log('   generateSamplesDir - sample file successfully copied '+data.path_to);
            }).catch(function(data){
                console.log('   generateSamplesDir - sample file copy failed '+data.path_to);
                console.error(data.err);
            }));

            /* Create txt link file */
            p_array.push(Utils.File.writeTextFile(Utils.File.pathJoin(_links_dir ,link_file_name), item.path /* text */).catch(function(data){
                console.log('   generateSamplesDir - link file copy failed '+data.path_to);
                console.error(data.err);
            }));
        });

        return Promise.all(p_array)
            .then(function(data){
                console.log('   generateSamplesDir - '+(p_array.length/2)+' files successfully copied!');
                return data;
            })
            .catch(function(err){
                console.log('   generateSamplesDir - error on final step');
                console.error(err);
            });
    }



    /**
     * Check the coverage (or uncoverage) of all samples.
     * @param options
     *        - dirPath: custom absolute path for the directory
     *        - tagQuery: custom query string with tags
     *        - getUncovered: true to collect uncovered samples
     *        - consoleOutput: true to print result directly in the console
     *        - createIndexes: true to generate the index files
     * @returns {Samples} smp_obj
     */
    checkSamplesCoverage(options){
        options = _.merge({
            stats:true,
            dirPath:null,
            dirPathCustom:false,
            tagQuery:null,
            coverageCondition:true,
            consoleOutput:true,
            createIndexes:false,
            _output:{
                max_length_tag_string:10
            }
        },options);

        let _d = function(m){ arguments[0]='coverage: '+arguments[0]; console.log.apply(null,arguments); };

        let _self = this;
        options.console_log = (options.consoleOutput===true?console.log:function(){});

        /* Check getUncovered */
        if(!_.isBoolean(options.coverageCondition)) options.coverageCondition=true;
        _d("uncovered ",options.coverageCondition,"\n");

        /* Check tagQuery */
        let _tagQueries = {};
        if(_.isString(options.tagQuery)){
            _d("tagQuery from string");
            _tagQueries['default']=options.tagQuery;
        }else if(_.isObject(ConfigMgr.get('Tags'))) {
            _d("tagQuery from config.Tags");
            _tagQueries = ConfigMgr.get('Tags');
        }
        _d("tagQueries are",_tagQueries,"\n");
        if(_tagQueries.length<=0) return null;

        /* Process all tag queries */
        let _ptags = [];
        Object.keys(_tagQueries).forEach(function(v,i,a){
            let ptag_obj = _self.processTagString(_tagQueries[v],_ptags);
        });
        _ptags.forEach(function(v){
            if(v.string.length> options._output.max_length_tag_string)
                options._output.max_length_tag_string=v.string.length;
        });
        _d("found ",_ptags.length," tag 'AND conditions'\n");
        //_d("processed tag 'AND conditions' are",_ptags,"\n");
        //_d("processed tag 'AND conditions' are"); _ptags.forEach(function(v){ console.log("\t"+v.string); });
        if(_ptags.length<=0) return null;

        /* Check dirPath */
        if(_.isString(options.dirPath)){
            _d("dirPath from string; scanning the absolute path "+options.dirPath+" ...");
        }else{
            options.dirPath = null;
            _d("dirPath from config; reading the scan index...");
            options.progressive = true;
            _d("setting progressive as 'true'...");
        }

        let smp_obj = this.scanSamples(options.dirPath);
        if(smp_obj.empty()){
            _d("Cannot check the coverage: no samples found. \n");
            return null;
        }

        /* Option fixes */
        if(options.stats) {
            options.progressive = options.progressive_keepalive = false;
        }

        return this._checkSamplesCoverage(smp_obj, options, _ptags, _d);
    }

    _checkSamplesCoverage(smp_obj, options, _ptags, _d){
        _d("checking the coverage of "+smp_obj.size()+" samples...");

        // _ptags = array of {string,check_fn} objects
        _.sortBy(_ptags, [function(o) { return o.string; }]);
        options.dirPath = smp_obj.getOriginPath();
        //options.dirPath = Utils.File.pathResolve(smp_obj.getOriginPath());

        let coverage_array = [];
        let __uncovered_items = {};

        _ptags.forEach(function(v1,i1,a1){

            let smp_coverage = new Samples();
            smp_coverage.setTags(v1.tag_array);
            coverage_array.push({
                covered:0,
                uncovered:0,
                query:v1.string,
                samples:smp_coverage
            });

            let coverage_item = coverage_array[coverage_array.length-1];

            smp_obj.forEach(function(item,i2){
                if(!__uncovered_items[item.n_path]) __uncovered_items[item.n_path]={ path:item.path, check:true };

                let is_covered = v1.check_fn(item.n_path);
                if(is_covered===options.lookingForCoverage){
                    smp_coverage.addItem(item);
                }
                if(is_covered){
                    coverage_item.covered++;
                    __uncovered_items[item.n_path].check = false;
                }
                else{
                    coverage_item.uncovered++;
                    //if(uncovered_items.indexOf(item.path)<0) uncovered_items.push(item.path);
                }
            });

            if(options.consoleOutput){
                if((options.progressive || options.progressive_keepalive)){
                    options.console_log("\n");
                    smp_coverage.forEach(function(item,index){ options.console_log("    "+(item.path.substring(options.dirPath.length))); });
                    options.console_log("  "+_.repeat('-', 100));
                }

                options.console_log(_.padEnd(/*"    Q#"+(i1+1)+" "*/"     "+v1.string,options._output.max_length_tag_string+9)+
                                    ' c:'+_.padEnd(coverage_item.covered,10)+
                                    ' u:'+_.padEnd(coverage_item.uncovered,10)+
                                    ' coverage:'+_.padEnd(Math.round((coverage_item.covered/(coverage_item.covered+coverage_item.uncovered)*100))+'%',5));
            }

            /* Save Custom INDEX */
            if(!options.dirPathCustom && options.createIndexes===true && coverage_item.uncovered<=0){
                //reading from config.samplesdir
                this.saveSampleScanToFile(smp_coverage,true /*is_custom_index*/);
            }

            /* Progressive */
            if(options.progressive &&
                ((options.lookingForCoverage && coverage_item.covered>0)
                    || (!options.lookingForCoverage && coverage_item.uncovered>0))
            ){
                Utils.EXIT();
            }

            /* Progressive and Keep-Alive */
            if(options.progressive_keepalive &&
                ((options.lookingForCoverage && coverage_item.covered>0)
                    || (!options.lookingForCoverage && coverage_item.uncovered>0))
            ){
                CliMgr.waitForEnter();
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
