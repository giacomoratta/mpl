/* Standard Libraries */
global._ =  require('lodash');
global.path = require('path');
global.readlinesync = require('readline-sync');
global.d = console.log;
global.MPL_Options = {

};

/* Project Libraries */
global.Utils = require('./libs/Utils.js');
global.ConfigMgr = require('./libs/ConfigManager.js');
global.CliMgr = require('./libs/CliManager.js');
global.SamplesMgr = require('./libs/SamplesManager.js');

/* Project logic & interface */
let CliParams = CliMgr.processParams();
if(CliParams.isError()){
    ConfigMgr.printHelp();
    Utils.EXIT("Invalid parameters");
}

if(CliParams.commandIs('lookup')){
    CliMgr.C_lookup();

} else if(CliParams.commandIs('save')){
    CliMgr.C_save();

} else if(CliParams.commandIs('set')){
    CliMgr.C_set();

} else if(CliParams.commandIs('config')){
    ConfigMgr.printStatus();
    ConfigMgr.print();

} else if(CliParams.commandIs('coverage')){
    CliMgr.C_coverage();

} else if(CliParams.commandIs('scan')){
    CliMgr.C_scan();

} else {
    ConfigMgr.printHelp();
    Utils.EXIT("Unrecognized command");
}

console.log("\n");
