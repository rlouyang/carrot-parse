//customer_id = 56241a13de4bf40b1711222c
//account_id = 56241a14de4bf40b17112eae



// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.job("hello", function(request, response) {
  console.log("Hello world!lslofkajhlsfkjahlsdkjfh");
});


Parse.Cloud.job("getAccounts", function(request, response) {
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

