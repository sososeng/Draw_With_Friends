window.onload = function() {


  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var current;
  var past;
  var mouse_down =false;
  var penColor = 'black';
  $('.openbtn').hide();

  var canvasjq = $('canvas');
  var h = canvasjq.height();
  var w = canvasjq.width();

  canvasjq.attr('height',h);
  canvasjq.attr('width',w);

  canvas.addEventListener('mousedown', function (event) {
    mouse_down = true;
  });
  canvas.addEventListener('mouseup', function (event) {
    mouse_down = false;
    past = null;
  });
  canvas.addEventListener('mousemove', function (event) {
    if (mouse_down) {
      current = [event.offsetX, event.offsetY];
      if (past) {
        //draw(past, current);
        server.emit('draw-line',{past:past,current:current, color : penColor});
      }
      past = [event.offsetX, event.offsetY];
    }
  });



  function draw(past,current,color) {

     ctx.strokeStyle = color;
     ctx.beginPath();
     ctx.moveTo(past[0], past[1]);
     ctx.lineTo(current[0], current[1]);
     ctx.stroke();
     ctx.closePath();
 }


  var server = io();

  server.on('connect',function(s){
    console.log('connected');
    server.emit('adduser', prompt("What's your name?"));
  });

  server.on('line-broadcast',function(msg){
    draw(msg.past, msg.current,msg.color);
  });

  server.on('updaterooms', function(user) {
    $('#users').append('<div>' + user + '</div>');

  });
  server.on('url', function(url) {
    $('.invite').text("Invite URL: ");
    $('.url').text(url);

  });
  server.on('updatechat', function (username, data) {
    $('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
  });


  $('#datasend').click( function() {
    var message = $('#data').val();
    $('#data').val('');
    // tell server to execute 'sendchat' and send along one parameter
    server.emit('sendchat', message);
  });

  $('.closebtn').click(function(){
    $('.chatBox').toggle( "slide" );
    $('.openbtn').fadeIn();
  });
  $('.openbtn').click(function(){
    $('.openbtn').fadeOut();
    $('.chatBox').toggle( "slide" );
  });

$chatPanel = $('.chatPanel');
$chatPanel[0].scrollTop = $chatPanel[0].scrollHeight;

  $('#data').keypress(function(e) {
    if(e.which == 13) {
      $chatPanel = $('.chatPanel');
      $(this).blur();
      $('#datasend').focus().click();
      $('#data').focus();
      $chatPanel.animate({ scrollTop: $chatPanel[0].scrollHeight }, "slow");
    }
  });





}
