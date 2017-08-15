angular.module('sendModule', [])
  .config(function($locationProvider){
    $locationProvider.html5Mode(true)
  })
  .controller('sendModuleController', function($http, $location) {
    var sendModule = this;
    sendModule.toToken = $location.search()['token'];

    /**
     * Basic send function to sen the given message, and initialize the conversation.
     */
    sendModule.send = function() {
      var linkUrl = "https://httprelay.io/link/"+ sendModule.toToken;
      var senderPrivateConvToken = initializeConversation(sendModule.message, sendModule.toToken);

      var messageObject = {
        msg: sendModule.message,
        senderPrivateConvToken : senderPrivateConvToken
      };

      $http.post(linkUrl, messageObject);
    };

    /**
     * initializes a new conversation for the given message.
     */
    function initializeConversation(message, toToken) {
        var senderPrivateConvToken = Math.random().toString(36).substr(4);
        var conversation = {
            receiveOnConvToken : senderPrivateConvToken,
            sendToConvToken : "",
            otherSidePublicToken : toToken,
            subject: message,
            messages : [
                {
                    sender:"me",
                    msg: message,
                }
            ]
        };
        var convStorageToken = "conv-sent-"+senderPrivateConvToken;
        localStorage.setItem(convStorageToken, JSON.stringify(conversation));

        var sentConvList = JSON.parse(localStorage.getItem('sentConvList'));
        if(angular.isUndefined(sentConvList) || sentConvList === null) {
            sentConvList = [];
        }

        sentConvList.push(convStorageToken);
        localStorage.setItem('sentConvList', JSON.stringify(sentConvList));

        return senderPrivateConvToken;
    }
});