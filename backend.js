var express = require('express');
var io = require('socket.io');

var app = express();
var PORT = process.env.PORT || 8000;
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.set('view engine', 'ejs');
app.use(express.static('public'));
var redis = require('redis');
var redisClient = redis.createClient({host : 'localhost', port : 6379});
redisClient.on('ready',function() {
 console.log("Redis is ready");
});

redisClient.on('error',function() {
 console.log("Error in Redis");
});

var userParam;

app.get('/', function (request, response){
  userParam = "undefined";
  response.render('index.ejs');
});

app.get('/join', function (request, response) {
  userParam = request.query.room;
  if(io.sockets.adapter.rooms[userParam]){
    console.log("test",userParam);
    response.render('index.ejs');
  }else{
    response.status(404)        // HTTP status 404: NotFound
   .send('Not found');
  }

});


io.on('connection', function(client){

  console.log('CONNECTED', client.id);
  if(userParam === "undefined"){
    client.inRoom = false;
    client.room = makeid();
  }else{
    client.inRoom = true;
    client.room = userParam;
  }

  if(client.inRoom===false){
    io.to(client.id).emit('url', "draw-with-friends-2017.herokuapp.com/join?room="+client.room);
  }

  client.on('adduser', function(username){
    // store the username in the socket session for this client
    if(username ===null){
      client.username = "anonymous";
    }else{
      client.username = username;
    }

    // store the room name in the socket session for this client


    client.join(client.room);
    // echo to client they've connected
    //io.to(client.room).emit('updatechat', 'SERVER', 'you have connected to' + client.room);
    // echo to room 1 that a person has connected to their room
    io.to(client.room).emit('updatechat', 'SERVER:', client.username + ' has Joined');
    io.to(client.room).emit('updaterooms', client.username);
  });


  client.on('draw-line',function(msg){
    console.log(msg);
    io.to(client.room).emit('line-broadcast',msg);

  });

  client.on('sendchat', function (data) {
    // we tell the client to execute 'updatechat' with 2 parameters
    io.to(client.room).emit('updatechat', client.username, data);
  });

  client.on('disconnect', function () {
    console.log('EXITED');
    io.to(client.room).emit('updatechat', 'SERVER:', client.username + ' left');
    client.leave(client.room);
  });



});

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


http.listen(PORT,function(){
  console.log('Listenning on port' + PORT);
});
