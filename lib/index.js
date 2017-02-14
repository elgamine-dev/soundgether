let express = require('express')
let path = require('path')
let port = process.env.PORT || 3333
let app = express()
let server = require('http').Server(app);


let io = require('socket.io')(server)
let tracks = []
let ids = []

let yt = require('./yt')
let vote = require('./vote')

app.use(express.static(path.join(__dirname,'..','public')))

io.on('connection', (socket)=>{
    socket.emit('hello', tracks)
    socket.on('new song', function(url){
        yt(url, ids, (data)=>{
            io.emit('new song', data)
            tracks.push(data)
        }, (err)=>{
            socket.emit('err', err)
        })
        
    })

    socket.on('upvote', function(pos){
        let ip = socket.request.connection.remoteAddress
        console.log(ip)
    })
})



server.listen(port)
