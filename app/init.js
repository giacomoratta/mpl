require('./config_init.js');

/* Singleton Objects */
global.SamplesTree = require('./managers/SamplesTree.class.js');

/* Data Types */
global.Samples = require('./micro/Samples.class.js');

/* Project Modules */
global.SamplesMgr = require('./managers/SamplesManager.js');
global.DirCommand = require('./managers/Dir.command.js');
global.BookmarksMgr = require('./managers/BookmarksManager.js');
global.ProjectsMgr = require('./managers/ProjectsManager.js');
global.TQueryMgr = require('./managers/TQueryManager.js');
global.ExportMgr = require('./managers/ExportManager.js');


require('./cli_sections/bookm_cmd.js');
require('./cli_sections/config_cmd.js');
require('./cli_sections/coverage_cmd.js');
require('./cli_sections/dir_cmd.js');
require('./cli_sections/export_cmd.js');
require('./cli_sections/lookup_cmd.js');
require('./cli_sections/project_cmd.js');
require('./cli_sections/samples_cmd.js');
require('./cli_sections/save_cmd.js');
require('./cli_sections/scan_cmd.js');
require('./cli_sections/tquery_cmd.js');


/* Last command: start CLI! */
cliMgr.show('mpl');
