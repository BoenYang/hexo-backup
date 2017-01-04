'use strict';

var pathFn = require('path');
var fs = require('hexo-fs');
var spawn = require('hexo-util/lib/spawn');
var logger = require('hexo-log');

module.exports = function(){
    var baseDir = this.base_dir;
    var gitDir = pathFn.join(baseDir,'.git');
    var themeDir = pathFn.join(baseDir,'themes');
    var repo = this.config.backup;
    var log = new logger({debug : false,silent:false});

    log.info('Start backup source to ' + repo.repo + ':' + repo.branch);

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

    function removeGitDir(target) {
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
        }).each(removeGitDir);
    }

    return fs.exists(gitDir).then(function(exist){
        if(exist){
            return;
        }else{
            log.info('init git repo');
            git('init');
        }
    }).then(function(){
        log.info('remove theme git dir');
        return removeGitDir(themeDir);
    }).then(function(){
        return git('add','-A')
    }).then(function(){
        return git('commit','-m','backup').catch(function(){});
    }).then(function(){
        return git('push', '-u', repo.repo, 'HEAD:' + repo.branch, '--force');
    }).then(function(){
         log.info('Backup source to ' + repo.repo + ':' + repo.branch + ' success');
    });
}