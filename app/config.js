//ConfigMgr

(function(){

    ConfigMgr.addField('SamplesDirectory', {
        description:'',
        datatype: 'absdirpath',
        defaultValue: '',
        checkPathExists: true,
        flagsOnChange: [ 'samples_index_first_scan_needed' ]
    });

    ConfigMgr.addField('ExportDirectory', {
        description:'',
        datatype: 'absdirpath',
        defaultValue: ''
    });

    ConfigMgr.addField('ProjectsDirectory', {
        description:'',
        datatype: 'absdirpath',
        defaultValue: '',
        checkPathExists: true
    });

    ConfigMgr.addField('DAW', {
        description:'',
        datatype: 'string',
        defaultValue: 'Ableton',
        allowedValues: ['Ableton','Cubase']
    });

    ConfigMgr.addField('RandomCount', {
        description:'',
        datatype: 'integer',
        defaultValue: 11
    });

    ConfigMgr.addField('MaxOccurrencesSameDirectory', {
        description:'',
        datatype: 'integer',
        defaultValue: 1
    });

    ConfigMgr.addField('ExtensionCheckForSamples', {
        datatype: 'char',
        defaultValue: 'X',
        allowedValues: ['X','E','I'],
        flagsOnChange: [ 'samples_index_new_scan_needed' ]
    });

    ConfigMgr.addField('IncludedExtensionsForSamples', {
        description:'',
        datatype: 'array',
        objectDatatype: 'string',
        defaultValue: [
            ".xml",
            ".log",
            "essentialsound",
            "olp"
        ],
        flagsOnChange: [ 'samples_index_new_scan_needed' ]
    });

    ConfigMgr.addField('ExcludedExtensionsForSamples', {
        description:'',
        datatype: 'array',
        objectDatatype: 'string',
        defaultValue: [
            "asd",
            "DS_Store",
            "cfg",
            "txt",
            "exe"
        ],
        flagsOnChange: [ 'samples_index_new_scan_needed' ]
    });

    ConfigMgr.addFlag('samples_index_first_scan_needed','First scan needed in the samples directory');
    ConfigMgr.addFlag('samples_index_new_scan_needed','New scan needed after changing the configuration on file extensions');

    ConfigMgr.setUserdataDirectory('userdata');
    ConfigMgr.setConfigFile('config.json');

    ConfigMgr.addUserDirectory('default_projects','default_projects');
    ConfigMgr.addUserFile('bookmarks','bookmarks.json');
    ConfigMgr.addUserFile('projects','projects.json');
    ConfigMgr.addUserFile('tquery','tqueries.json');
    ConfigMgr.addUserFile('samples_index','samples_index');

    ConfigMgr.init();

})();




// console.log(ConfigMgr.get('MaxOccurrencesSameDirectory'));
// console.log(ConfigMgr.set('MaxOccurrencesSameDirectory',3));
// console.log(ConfigMgr.set('MaxOccurrencesSameDirectory',true));
// console.log(ConfigMgr.get('MaxOccurrencesSameDirectory'));
//
// console.log();
//
// console.log(ConfigMgr.get('ExtensionCheckForSamples'));
// console.log(ConfigMgr.set('ExtensionCheckForSamples',true));
// console.log(ConfigMgr.set('ExtensionCheckForSamples','Fd'));
// console.log(ConfigMgr.set('ExtensionCheckForSamples','R'));
// //console.log(ConfigMgr.set('ExtensionCheckForSamples','E'));
// //console.log(ConfigMgr.set('ExtensionCheckForSamples',3));
// console.log(ConfigMgr.get('ExtensionCheckForSamples'));



//console.log(ConfigMgr.set('SamplesDirectory','/Users'));

// ConfigMgr.print();
// ConfigMgr.printInternals();

// ConfigMgr.get('param');
// ConfigMgr.set('param',value);


//ConfigMgr.setUserDirectory('userdata' /*dir name*/);

//ConfigMgr.addUserFile('myfile.json');
//ConfigMgr.addUserDirectory('/newdir');
//ConfigMgr.addUserFile('/newdir/myfile.json');

// ConfigMgr.upath  //user path
// ConfigMgr.path   //app path

//ConfigMgr.setFlag('abc123');
//ConfigMgr.unsetFlag('abc123');

//ConfigMgr.firstStart(); //fn at first start > no need of configmgr...just type the code here

//ConfigMgr.save();
