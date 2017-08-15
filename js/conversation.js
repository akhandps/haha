angular.module('conversationModule', [])
  .config(function($locationProvider){
    $locationProvider.html5Mode(true)
  })
  .controller('conversationModuleController', function($http, $location) {
    var conversationModule = this;
    conversationModule.id = $location.search()['id'];
    conversationModule.conversation = getStoredConversation();

    conversationModule.initialize = function() {
        conversationModule.conversation = getStoredConversation();
        conversationModule.receiveMessage();
    };

    conversationModule.send = function() {
          var linkUrl = "http://httprelay.io/link/"+ conversationModule.conversation.sendToConvToken;
          var messageObject = {
            msg: conversationModule.myMessage,
            senderPrivateConvToken : conversationModule.conversation.receiveOnConvToken
          };
          updateConversation(conversationModule.myMessage, "me");
          $http.post(linkUrl, messageObject);
    };

    conversationModule.receiveMessage = function() {
        var linkUrl = "http://httprelay.io/link/"+ conversationModule.conversation.receiveOnConvToken;
        $http.get(linkUrl)
          .then(function(response) {
              updateConversation(response.data.msg, "they", response.data.senderPrivateConvToken);
              conversationModule.receiveMessage();
        });
    }

    function getStoredConversation() {
        return JSON.parse(localStorage.getItem(conversationModule.id));
    }

    function updateConversation(message, sender, sendToConvToken) {
        conversationModule.conversation.messages.push({
            msg: message,
            sender: sender
        });

        if(angular.isDefined(sendToConvToken) && sendToConvToken !== null) {
            conversationModule.conversation.sendToConvToken = sendToConvToken;
        }

        localStorage.setItem(conversationModule.id, JSON.stringify(conversationModule.conversation));
    }

    conversationModule.initialize();
});