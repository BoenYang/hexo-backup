# hexo-maintance

A Hexo plugin for maintance your blog.

# Features
- Auto backup after deploy
- Restore backuped blog use one command

# Installation
```
npm install hexo-maintance --save
```

# Configuration
```
backup:
  repo: https://github.com/xxx/xxx.git
  branch: backup_repo_branch
```

# Usage

## Auto backup
> After configuration and deploy auto backup your blog

## Restore
```
1. hexo init MyBlog
2. cd MyBlog
3. npm install hexo-maintance --save
4. //Configurate your backup repo and branch
5. hexo Restore
```

# TODO
1. Hexo auto upgrade tools;
