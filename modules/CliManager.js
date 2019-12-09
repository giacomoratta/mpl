const cliParam = require('./atoms/cliParam.class.js');
const vorpal = require('vorpal')();

class CliManager {

    constructor(){
        //this.ui_log = vorpal.log;
        this._commands = {};
        this._vorpal = vorpal;
        this._delimiter = '';
        this._error_code = -1;
        this._success_code = 1;

        this._vorpal.on('client_prompt_submit',function(command){
            if(command==='exit'){
                ConfigMgr.save();
            }
        });
    }

    show(delimiter){
        if(delimiter) this._delimiter=delimiter;
        ConfigMgr.printMessages();
        this._vorpal
            .delimiter(this._delimiter+'$')
            .show();
    }

    addCommand(cmd_string){
        let cmd_split = _.split(_.trim(cmd_string)," ");
        this._commands[cmd_split[0]] = this._vorpal.command(cmd_string);
    }

    addCommandHeader(cmd_label){
        return this._commands[cmd_label];
    }

    addCommandBody(cmd_label,cmdFn){
        this._commands[cmd_label].action(this._getActionFn(cmd_label,cmdFn));
    }

    _getActionFn(cmdName, cmdFn){
        const thisCliMgr = this;
        return function(args,cb){
            const cliReference = this;

            cmdFn(cliReference,(code,err)=>{
                if(code===thisCliMgr._error_code){
                    d$('command',cmdName,'terminated with an error.');
                    if(err) d$(err);
                }
                ConfigMgr.printMessages();
                cb();
            },{
                cli_params:new cliParam(args, cmdName),
                error_code:thisCliMgr._error_code,
                success_code:thisCliMgr._success_code,
                ui: clUI.newLocalUI('> '+cmdName+':')
            });
        };
    }

}

module.exports = new CliManager();
