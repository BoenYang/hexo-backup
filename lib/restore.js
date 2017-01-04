'use strict';

var pathFn = require('path');
var fs = require('hexo-fs');
var internalFs = require('fs');
var spawn = require('hexo-util/lib/spawn');
var logger = require('hexo-log');
var chalk = require('chalk');
var tools = require('../lib/tools.js');

module.exports = function(args){
    var repo = this.config.backup;
    var baseDir = this.base_dir;
    var cloneDir = pathFn.join(baseDir,'.restore');
    var log = new logger({debug : false,silent:false});

    if(!repo || !repo.repo || !repo.branch){
        var help = '';
        help += 'You have to configure the backup settings in _config.yml first!\n\n';
        help += 'Example:\n';
        help += '  backup:\n';
        help += '    repo: <repository url>\n';
        help += '    branch: [branch]\n';
        help += 'For more help, you can check the docs: ' + chalk.underline('https://github.com/BoenYang/hexo-maintance');
        console.log(help);
        return;
    }

    function git() {
        var len = arguments.length;
        var args = new Array(len);

        for (var i = 0; i < len; i++) {
            args[i] = arguments[i];
        }
        return spawn('git', args, {
            cwd: baseDir,
            verbose: true
        });
    }

    function nodeInstall(){
        log.info('Installing nmp package .....')
        var args = ['install']
        return spawn('npm',args,{
            cwd: baseDir,
            verbose: true
        });
    }
 
    return fs.exists(cloneDir,function(exist){
        if(exist){
            return fs.rmdirSync(cloneDir);
        }
    }).then(function(){
        return git('clone','-b',repo.branch,repo.repo,cloneDir);
    }).then(function(){
        return internalFs.readdirSync(cloneDir);
    }).each(function(file){
        return tools.copyCloneDirToBaseDir(file,cloneDir,baseDir);
    }).then(function(){
        log.info('remove restore temp dir ' + cloneDir);
        return fs.rmdir(cloneDir);
    }).then(function(){
        log.info('update hexo-maintance version ');
        return tools.updateRestoreHexoMaintanceVersion(baseDir,'package.json');
    }).then(function(){
        return nodeInstall();
    });
}
