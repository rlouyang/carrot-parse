// richard's customer id 56241a13de4bf40b1711224d 
// richard's account id 56241a14de4bf40b17112f02
// richard's merchant id 56241a13de4bf40b17112337

function getAverage(price_list) {
  var total = 0;
  for(var i = 0; i < price_list.length; i++) {
    total += price_list[i];
  }
  var avg = total / price_list.length;
  return avg;
}

Parse.Cloud.define("processPurchases", function(request, response) {
  var account_id = request.params.account_id;

  var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases";
  Parse.Cloud.httpRequest({
    url: apiUrl,
    params: {
      key : nessieKey
    },
    success: function(httpResponse) {
      var transactions = httpResponse.data;
      var transactionDict = {};
      var transactionPrices = {};
      for (var i = 0; i < transactions.length; i++) {
        var description = transactions[i].description;
        if (description in transactionDict) {
          transactionDict[description] += 1;
          transactionPrices[description].push(transactions[i].amount);
        }
        else {
          transactionDict[description] = 1;
          transactionPrices[description] = [transactions[i].amount];
        }
      };
      console.log(transactionDict);
      keysSorted = Object.keys(transactionDict).sort(function(a,b){return transactionDict[b]-transactionDict[a]});

      topThree = {};
      for (var i = 0; i < 3; i++) {
        topThree[transactionDict[keysSorted[i]]] = getAverage(transactionPrices[keysSorted[i]]);
      }

      response.success(topThree);
    },
    error: function(httpResponse) {
      // error
      console.error('Request failed with response code ' + httpResponse.status);
      response.error(status);
    }
  });

});
