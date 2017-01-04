'use strict';

var pathFn = require('path');
var fs = require('hexo-fs');
var log = require('hexo-log')({debug : false,silent:false});


exports.updateRestoreHexoMaintanceVersion = function (baseDir,file){
    var currentHexoMaintanceVersion = require('../package.json').version;
    var hexoPackageJsonPath = pathFn.join(baseDir,file);
    var packageJson = require(hexoPackageJsonPath);
    var versionStr = packageJson.dependencies['hexo-maintance'];
    if(versionStr == null){
        packageJson.dependencies['hexo-maintance'] = '^' + currentHexoMaintanceVersion;
        console.log(packageJson);
    }else{
        packageJson.dependencies['hexo-maintance'] = '^' + currentHexoMaintanceVersion;
    }
    return fs.writeFileSync(hexoPackageJsonPath,JSON.stringify(packageJson,null,'\t'));
}

 exports.copyCloneDirToBaseDir = function (file,sourceDir,dstDir) {
    var filePath = pathFn.join(sourceDir,file);
    var fileStat = fs.lstatSync(filePath);
    if(fileStat.isDirectory()){
        var destDirPath = pathFn.join(dstDir,file);
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
        var destFilePath = pathFn.join(dstDir,file);
        var exist = fs.existsSync(destFilePath);
        var data = fs.readFileSync(filePath);
        fs.writeFileSync(destFilePath,data);
        return;
    }
}

exports.removeGitDir = _removeGitDir;

function _removeGitDir(target){
    var gitDir = pathFn.join(target, '.git');
    return fs.stat(gitDir).catch(function(err) {
        if (err.cause && err.cause.code === 'ENOENT') return;
        throw err;
    }).then(function(stats) {
        if (stats) {
            if (stats.isDirectory()) 
                return fs.rmdir(gitDir);
            return fs.unlink(gitDir);
        }
    }).then(function() {
        return fs.readdir(target);
    }).map(function(path) {
        return pathFn.join(target, path);
    }).filter(function(path) {
        return fs.stat(path).then(function(stats) {
            return stats.isDirectory();
        });
    }).each(_removeGitDir)
}