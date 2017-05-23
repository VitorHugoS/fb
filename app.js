//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');


//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

var messages = [];
var sockets = [];

var _estados = [];


router.get('/webhook', function (req, res) {

  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'minhasenha123') {
    console.log('Validação ok!');
    res.status(200).send(req.query['hub.challenge']);
  }
  else {
    console.log('Validação falhou!');
    res.sendStatus(403);
  }

});



router.post('/webhook', function (req, res) {

  var data = req.body;

  if (data && data.object === 'page') {

    //PERCORRER TODAS AS ENTRADAS ENTRY
    data.entry.forEach(function (entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      //PERCORRER TODAS AS MENSAGENS
      entry.messaging.forEach(function (event) {
        if (event.message) {
          trataMensagem(event);
        } else {
          if (event.postback && event.postback.payload) {
            switch (event.postback.payload) {
              case 'clicou_comecar':
                sendTextMessage(event.sender.id, 'Como eu posso te ajudar? Veja as opções disponíveis abaixo:');
                sendFirstMenu(event.sender.id);
                break;
                
              case 'clicou_preco':
                sendTextMessage(event.sender.id, 'Confira nossas promoções:');
                sendPromocao(event.sender.id);
                break;
                
              case 'clicou_banda':
                sendTextMessage(event.sender.id, 'Pessoa X: telefone');
                sendTextMessage(event.sender.id, 'Pessoa Y: telefone');
                showOptionsMenu(event.sender.id);
                break;
                
              case 'clicou_lista':
                sendTextMessage(event.sender.id, 'Digite seu email, para ingressar no newsletter.');
                _estados[event.sender.id] = 'entrada_nome';
                
              
              default:
                // code
            }
          }
        }
      })

    })

    res.sendStatus(200);
  }

});
router.get('/config', function(req, res) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=EAAaeqt89HLIBAMOFAZBuZBVfM38OJCRBeHzhV4u2NYkt3HKbfZAdWQQvZB9PConCxo9qRGPR0wUs3YrXt4u0gchkSOaNAD0bK3EPRWPsGhLRK0cC3fhBlRRgepHbTfTjAdywvNCTkDhw0XPcelMJGijLavICGhEZBOWJ9sZAZAsKwZDZD',
    method: 'POST',
    json: {setting_type: "greeting", greeting: { text: "Bem vindo ao auto atendimento. Para começar clique no botão abaixo!" }}}, function (error, response, body) {
      //res.send("ala");
  });   

});


router.get('/config2', function(req, res) {
 request({
    uri: 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=EAAaeqt89HLIBAMOFAZBuZBVfM38OJCRBeHzhV4u2NYkt3HKbfZAdWQQvZB9PConCxo9qRGPR0wUs3YrXt4u0gchkSOaNAD0bK3EPRWPsGhLRK0cC3fhBlRRgepHbTfTjAdywvNCTkDhw0XPcelMJGijLavICGhEZBOWJ9sZAZAsKwZDZD',
    method: 'POST',
    json: {setting_type: "call_to_actions", thread_state: "new_thread", call_to_actions: [{ payload: "clicou_comecar" }]}}, function (error, response, body) {
     // res.send("ala");
  });  

});

function trataMensagem (event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Mensagem recebida do usuário %d pela página %d", senderID, recipientID);

  var messageID = message.mid;
  var messageText = message.text;
  var attachments = message.attachments;

  if (messageText) {
    
    if (_estados[senderID]) {
      
      switch (_estados[senderID]) {
        case 'options_menu':
          
          
          
          switch (messageText) {
            case 'sim':
              console.log('Tenho que enviar o menu para essa pessoa');
              sendFirstMenu(senderID);
              break;
              
            case 'não':
              sendTextMessage(senderID, 'Obrigado por acessar nosso chat! Curta nossa página no Facebook. Até mais!');
              break;
            
            default:
              // code
          }
          
          
          
          
          break;
          
          
        case 'entrada_nome':
          console.log('O nome do cliente é ', messageText);
          sendTextMessage(senderID, 'Obrigado! Seu email foi inserido em nosso newsletter!.');
          _estados[senderID] = null;
          break;
        
        default:
          // code
      }
      
    }
    else {
      
      
      switch (messageText) {

        case 'oi':
          //RESPONDER COM OUTRO OI
          sendTextMessage(senderID, 'Oi, tudo bem com você?');
          break;
  
        case 'tchau':
          //RESPONDER COM UM TCHAU
          sendTextMessage(senderID, 'Tchau! Volte sempre!');
          break;
  
        default:
          //ENVIAR UMA MENSAGEM PADRÃO (TIPO, NÃO ENTENDI)
         sendFirstMenu(senderID);


    }
      
      
    }

    

  } else if (attachments) {
    //TRATAMENTO DOS ANEXOS
    console.log('Olha que legal, me enviaram anexos!');
  }

}



function sendTextMessage (recipientId, messageText) {

  var messageData = {
    recipient: {
      id: recipientId
    },

    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);

}


function sendFirstMenu (recipientId) {
  
  var messageData = {
    recipient: {
      id: recipientId
    },

    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "O que você procura?",
          buttons: [
          
            {
              type: 'postback',
              title: 'Promoções',
              payload: 'clicou_preco'
            },
            
            {
              type: 'postback',
              title: 'Fale Conosco',
              payload: 'clicou_banda'
            },
            
            {
              type: 'postback',
              title: 'Newsletter',
              payload: 'clicou_lista'
            }
            
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendPromocao (recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Promoçao Venture",
            subtitle: "Venture Fiat",
            item_url: "http://venture.com/outlet",               
            image_url: "http://venturefiat.com/wp-content/uploads/2017/05/banner-outlet.jpg",
            buttons: [{
              type: "web_url",
              url: "http://venture.com/outlet",
              title: "Veja Mais"
            }, {
              type: "postback",
              title: "Voltar ao Menu",
              payload: "clicou_comecar",
            }],
    
          }]
        }
      }
    }
  };  
 
  callSendAPI(messageData);
}

function showOptionsMenu (recipientId) {
  
  setTimeout(function () {
    
    sendTextMessage(recipientId, 'Posso te ajudar com mais alguma coisa?');
    _estados[recipientId] = 'options_menu';
    
  }, 2500);
  

}




function callSendAPI (messageData) {

  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAAaeqt89HLIBAMOFAZBuZBVfM38OJCRBeHzhV4u2NYkt3HKbfZAdWQQvZB9PConCxo9qRGPR0wUs3YrXt4u0gchkSOaNAD0bK3EPRWPsGhLRK0cC3fhBlRRgepHbTfTjAdywvNCTkDhw0XPcelMJGijLavICGhEZBOWJ9sZAZAsKwZDZD' },
    method: 'POST',
    json: messageData
  }, function (error, response, body) {

   if (!error && response.statusCode == 200) {
     console.log('Mensagem enviada com sucesso!');
     var recipientID = body.recipient_id;
     var messageID = body.message_id;

   } else {
     console.log('Não foi possível enviar a mensagem!');
     console.log(error);
   }

  })

}










io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
