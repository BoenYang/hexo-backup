'use strict';

var pathFn = require('path');
var fs = require('hexo-fs');
var internalFs = require('fs');
var spawn = require('hexo-util/lib/spawn');
var logger = require('hexo-log');

module.exports = function(args){
    var repo = this.config.backup;
    var baseDir = this.base_dir;
    var cloneDir = pathFn.join(baseDir,'.clone');
    var log = new logger({debug : false,silent:false});

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

    return fs.exists(cloneDir,function(exist){
        if(exist){
            console.log('exist')
            return fs.rmdirSync(cloneDir);
        }
    }).then(function(){
        return git('clone','-b',repo.branch,repo.repo,cloneDir);
    }).then(function(){
        return internalFs.readdirSync(cloneDir);
    }).each(function(file){
        var filePath = pathFn.join(cloneDir,file);
        var fileStat = internalFs.lstatSync(filePath);
        if(fileStat.isDirectory()){
            var destDirPath = pathFn.join(baseDir,file);
            var exist = fs.existsSync(destDirPath);
            if(exist){
                fs.rmdirSync(destDirPath,false);
                log.info('remove ' + destDirPath);
            }
            log.info('create directory ' + destDirPath);
            fs.mkdirsSync(destDirPath);
            log.info('copy ' + filePath + ' to ' + destDirPath);
            return fs.copyDir(filePath,destDirPath,function(){
                return;
            });
        }else{
            var destFilePath = pathFn.join(baseDir,file);
            var exist = fs.existsSync(destFilePath);
            var data = fs.readFileSync(filePath);
            fs.writeFileSync(destFilePath,data);
            return;
        };
    }).then(function(){
        return fs.rmdir(cloneDir);
    });
}