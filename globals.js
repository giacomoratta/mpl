
/* Standard Libraries */
global._ =  require('lodash');
require('./libs/Lodash.Extensions.js');

/* Output */
let UI_options = {};
if(!ENV_CONFIG.debug_enabled){
    UI_options.debugFn=function(){};
    UI_options.debugTimedFn=function(){};
}
global.clUI  = new (require('./modules/UI.class.js'))(UI_options);
global.d$ = clUI.debug;
global.dt$ = clUI.debugTimed;

/* Common Libraries */
global.Utils = require('./libs/Utils.js');
global.DataCache = require('./libs/DataCache.class.js');
global.PathInfo = require('./libs/PathInfo.class.js');
global.DirectoryTree = require('./libs/DirectoryTree.class.js');
global.Samples = require('./libs/Samples.class.js');
global.SamplesTree = require('./libs/SamplesTree.class.js');
global.DataMgr = require('./libs/DataManager.js');

/* DAW Adapters */
global.DAW_Adapters = {};
global.DAW_Adapters.Ableton = require('./modules/daw.adapters/AbletonProject.class.js');
global.DAW_Adapters.Cubase = require('./modules/daw.adapters/CubaseProject.class.js');


/* Project Modules */
global.ConfigMgr = require('./modules/ConfigManager.js');
global.SamplesMgr = require('./modules/SamplesManager.js');
global.DirCommand = require('./modules/Dir.command.js');
global.BookmarksMgr = require('./modules/BookmarksManager.js');
global.ProjectsMgr = require('./modules/ProjectsManager.js');
global.TQueryMgr = require('./modules/TQueryManager.js');
global.ExportMgr = require('./modules/ExportManager.js');

/* Latest module: Command Line Interface */
global.CliMgr = require('./modules/CliManager.js');