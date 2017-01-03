var marked = require('marked');

marked.Renderer.prototype.code = function(code,lang,escaped){
    return lang;
}

var markdownString = '```js\n console.log("hello"); \n```';

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

console.log(marked(markdownString));