'use strict';

hexo.on('deployAfter',require('./lib/backup.js'));

hexo.extend.console.register('restore',require('./lib/restore.js'))