// richard's customer id 56241a13de4bf40b1711224d 
// richard's account id 56241a14de4bf40b17112f02
// richard's merchant id 56241a13de4bf40b17112337

Parse.Cloud.job("processPurchases", function(request, response) {
    var transactions = getPurchasesForAccount(request.account_id);

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