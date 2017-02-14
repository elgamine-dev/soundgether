let fs = require('fs')
let Youtube = require("youtube-node")
let path = require('path')

let youTube = new Youtube();

(function(){
    fs.readFile(path.join(__dirname, '..','.key'), 'utf8', (err, data)=>{
        youTube.setKey(data);
        console.log('key', data)
    })
})()



function picture(id){
    return 'https://img.youtube.com/vi/'+id+'/maxresdefault.jpg'
}

function getId(url){
    var ID = '';
  url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if(url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  }
  else {
    ID = url;
  }
    return ID;
}

function resolve(url, ids, cb, err){
    let id = getId(url)
    err = err || function(){}
    if(ids.indexOf(id) !== -1) {
        return err('morceau déjà dans la liste')
    }
    youTube.getById(id, function(error, result) {
    if (error) {
        console.log(error);
    }
    else {
        console.log(JSON.stringify(result, null, 2));
        ids.push(id)
        cb(result)
    }
    });
}

module.exports = resolve