
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!lslofkajhlsfkjahlsdkjfh");
});


Parse.Cloud.define("getAccounts", function(request, response) {
    Parse.Cloud.httpRequest({
      url: 'http://api.reimaginebanking.com/accounts',
      params: {
        key : 'd050a1874e89b27881665db1d0352daa'
      }
    }).then(function(httpResponse) {
      // success
      console.log(httpResponse.text);
    },function(httpResponse) {
      // error
      console.error('Request failed with response code ' + httpResponse.status);
    });
});

