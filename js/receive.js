angular.module('receiveModule', [])
  .controller('receiveModuleController', function($http) {
    var receiveModule = this;

    receiveModule.publicToken = getPublicToken();
    receiveModule.receivedMessages = [];
    receiveModule.sentMessages = [];

    /**
     * initializes the page
     */
    receiveModule.initialize = function() {
        receiveModule.loadMessages();
        receiveModule.receiveMessage();
    };

    /**
     * receives the message
     */
    receiveModule.receiveMessage = function() {
      var linkUrl = "https://httprelay.io/link/"+ receiveModule.publicToken;
      $http.get(linkUrl)
          .then(function(response) {
              var conversationID = initializeConversation(response.data);
              receiveModule.receivedMessages.push({
                    msg: response.data.msg,
                    convID : conversationID
              });
              receiveModule.receiveMessage();
      });
    };

    /**
     * loads all the messages from the local storage.
     */
    receiveModule.loadMessages = function() {
       var receivedConvList = JSON.parse(localStorage.getItem('receivedConvList'));
       if(angular.isDefined(receivedConvList) && receivedConvList !== null) {
           receivedConvList.forEach(function(conversationID){
                       var conversation = JSON.parse(localStorage.getItem(conversationID));

                       receiveModule.receivedMessages.push({
                           msg: conversation.subject,
                           convID: conversationID
                       });
           });
       }

       var sentConvList = JSON.parse(localStorage.getItem('sentConvList'));
       if(angular.isDefined(sentConvList) && sentConvList !== null) {
           sentConvList.forEach(function(conversationID){
                var conversation = JSON.parse(localStorage.getItem(conversationID));
                receiveModule.sentMessages.push({
                   msg: conversation.subject,
                   convID: conversationID
                });
           });
       }
    };

    /**
     * get the public token for the user from local storage or initialize it.
     */
    function getPublicToken() {
        var storedToken = localStorage.getItem('publicToken');
        if(angular.isUndefined(storedToken) || storedToken === null) {
            storedToken = Math.random().toString(36).substr(4);
            localStorage.setItem('publicToken', storedToken);
        }
        return storedToken;
    };

    /**
     * initialize a new conversation from thte given message.
     */
    function initializeConversation(message) {
        var receiverPrivateConvToken = Math.random().toString(36).substr(4);
        var conversation = {
            sendToConvToken : message.senderPrivateConvToken,
            receiveOnConvToken : receiverPrivateConvToken,
            otherSidePublicToken : "Unknown!!",
            subject: message.msg,
            messages : [
                {
                    sender:"they",
                    msg: message.msg,
                }
            ]
        };
        var convStorageToken = "conv-recv-"+receiverPrivateConvToken;
        localStorage.setItem(convStorageToken, JSON.stringify(conversation));

        var receivedConvList = JSON.parse(localStorage.getItem('receivedConvList'));
        if(angular.isUndefined(receivedConvList) || receivedConvList === null) {
            receivedConvList = [];
        }
        receivedConvList.push(convStorageToken);
        localStorage.setItem('receivedConvList', JSON.stringify(receivedConvList));

        return convStorageToken;
    };

    receiveModule.initialize();
  });