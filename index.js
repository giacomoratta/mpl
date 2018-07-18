/* Standard Libraries */
global._ =  require('lodash');
global.path = require('path');
global.fs = require('fs');
global.fs_extra = require('fs-extra');

/* Project Libraries */
global.Config = require('./libs/ConfigManager.js');
global.Utils = require('./libs/Utils.js');
global.Commands = require('./libs/CommandsManager.js');
global.FS_Samples = require('./libs/FS_Samples.js');



/* Project logic & interface */

let cli_params = [];
if(process.argv.length<3){
    console.log('Help');
    process.exit(0);
}
else{
    cli_params=_.slice(process.argv,2);
}

let command = cli_params[0];
if(command=='set'){
    Commands.C_set(cli_params);
} else if(command=='lookup'){
    Commands.C_lookup(cli_params);
}

console.log('Help');
