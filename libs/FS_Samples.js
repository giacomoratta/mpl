
class FS_Samples {

    constructor(){
    }

    checkSampleName(path_string, names){
        path_string = _.toLower(path_string);
        if(_.indexOf(Config.getExtensionExcludedForSamples(),path.extname(path_string))>=0){
            return false;
        }
        for (let i=0; i<names.length; i++){
            if(_.includes(path_string,names[i])) return true; //case sensitive!
        }
        return false;
    }


    searchSamplesByTags(tags){
        tags.forEach(function(v, i, a){ a[i] = _.trim(_.toLower(a[i])); }); //normalize tags
        console.log(" Looking for: '"+_.join(tags,"', '")+"'");

        let finalArray = [];
        this._searchSamplesByTags(tags, Config.getSamplesDirectory(), finalArray);

        if(finalArray.length<=0) return null;
        let randomArray = this._selectRandomSamples(finalArray,20);

        return {
            array:finalArray,
            random:randomArray,
            tags:tags
        }
    }


    _searchSamplesByTags(names, dir_path, f_array, _maxRec){
        let items = fs.readdirSync(dir_path).sort();
        for (let i=0; i<items.length; i++) {
            //console.log(' >> ',items[i]);

            let path_string = path.join(dir_path,items[i]);
            let fsStat = fs.lstatSync(path_string);

            if(fsStat.isDirectory()){
                this._searchSamplesByTags(names, path_string, f_array);

            }else if(fsStat.isFile() && this.checkSampleName(path_string,names)){
                // checkSampleName on path_string because we want to accept samples belonging directory with good name
                console.log("  ",path_string);
                f_array.push(path_string);
            }
        }
    }


    _selectRandomSamples(f_array, count){
        console.log("\n\n  Random Samples");
        let _checkDirectory = function(arr,f){
            f = f.substring(Config.getSamplesDirectory().length);
            let p_split = f.split(path.sep);
            for(let i=0; i<arr.length; i++){
                for(let j=0; j<p_split.length; j++){
                    if(arr[i].indexOf(p_split[j])>=0) return true;
                }
            }
            return false;
        };

        let r_array = [];
        let size = f_array.length;
        let i=0, sec=size, rf, rn;
        while(i<count && sec>0){
            sec--;
            rn=_.random(0,size);
            rn=((rn*7)%size);
            rf=f_array[rn];

            if(_checkDirectory(r_array,rf)) continue;

            r_array.push(rf);
            console.log("   - ",rf);
            i++;
        }
        return Utils.sortFilesArray(r_array);
    }


    saveSampleObjectToFile(smp_obj){
        if(!_.isObject(smp_obj)) return false;
        let lookup_file = path.resolve('./latest_lookup.txt');
        let text_to_file = _.join(smp_obj.random,"\n");
        text_to_file = smp_obj.tags+"\n\n"+text_to_file;
        return fs.writeFile(lookup_file, text_to_file, 'utf8',function(err){
            if(err){ console.error(err); return; }
            console.log("The file was saved!",lookup_file);
        });
    }


    generateSamplesDir(smp_obj){
        let p_array = [];
        let dest_dir = path.join(Config.ProjectsDirectory, 'smpl', _.join(smp_obj.tags,'_').substring(0,20));
        let readme_file = path.join(dest_dir,'summary.txt');

        fs_extra.ensureDirSync(dest_dir);

        arr.forEach(function(v,i,a){
            let f_name = path.basename(v);
            p_array.push(fs_extra.copy(v,path.join(dest_dir ,f_name)));
        });

        return Promise.all(p_array)
            .then(function(data){
                console.log('success!');
                if(readme){
                    let text_to_file  = "\n"+_.join(arr,"\n");
                    return fs.writeFile(readme_file, text_to_file, 'utf8').then(function(data){
                        console.log("The file was saved!");
                    }).catch(function(err){
                        console.error(err);
                    });
                }
            })
            .catch(function(err){
                    console.error(err);
            });
    }
};

module.exports = new FS_Samples();
