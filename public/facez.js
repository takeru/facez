
function start()
{
  getUserMedia({audio:true,video:true}, gotStream, gotStreamFailed);
}

function gotStream(stream){
  attachMediaStream($('#video')[0], stream);
  connect(stream);
}

function gotStreamFailed()
{
  alert("failed to got stream.");
}

function connect(stream)
{
  var peer = new Peer({key: 's5wz0sjhipfirudi'});
  peer.on('open', function(peer_id) {
    console.log('peer:open', peer_id);
    $.ajax({
      url: '/peer/list.json?peer_id=' + peer_id,
      success:function(resp){
        console.log(resp);
        if(resp.result=='OK'){
          connectToPeers(peer, peer_id, resp.peers, stream);
        }
      }
    });
  });
  peer.on('connection', function(conn){
    console.log("peer:connection", conn);
    setupConnection(conn);
  });
  peer.on('close', function(){
    console.log("peer:close");
  });
  peer.on('error', function(err){
    console.log("peer:error", err);
    var m = err.message.match("Could not connect to peer (.+)");
    if(m){
      var id = m[1];
      $.ajax({
        method: 'DELETE',
        url: '/peer/'+id+'.json',
        success: function(x){
          console.log(x)
        }
      });
    }
  });
  peer.on('call', function(call){
    console.log("peer:call", call);
    setupCalling(call);

    call.answer(stream);
  });
}

// outgoing connection
function connectToPeers(peer, peer_id, peers, stream)
{
  for(var i=0; i<peers.length; i++){
    var info = peers[i];
    if(peer_id != info.peer_id){
      console.log("connecting i="+i + " peer_id="+info.peer_id);
      var conn = peer.connect(info.peer_id);
      setupConnection(conn);

      var call = peer.call(info.peer_id, stream);
      setupCalling(call);
    }
  }
}

// incomming connection
function setupConnection(conn)
{
  conn.on('open', function(){
    console.log("conn:open");
    onOpen(conn);
  });
  conn.on('data', function(data){
    console.log('conn:data', data);
  }); 
  conn.on('close', function(data){
    console.log('conn:close');
  }); 
  conn.on('error', function(err){
    console.log('conn:error', err);
  }); 
}

function setupCalling(call)
{
  call.on('stream', function(stream) {
    console.log('call:stream', stream);

    var elem = $("<video autoplay width=240 height=240></video>");
    $('#videos').append(elem);
    attachMediaStream(elem[0], stream);

    // `stream` is the MediaStream of the remote peer.
    // Here you'd add it to an HTML video/canvas element.
  });
}

function onOpen(conn)
{
  conn.send('Hello!');
}

$(start);
