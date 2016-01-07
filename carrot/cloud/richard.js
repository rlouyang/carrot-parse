// richard's customer id 56241a13de4bf40b1711224d 
// richard's account id 56241a14de4bf40b17112f02
// richard's merchant id 56241a13de4bf40b17112337

Parse.Cloud.job("processPurchases", function(request, response) {
  var transactions = getPurchasesForAccount(request.account_id);
  var transactionDict = {};
  for (var i = 0; i < transactions.length; i++) {
    var description = transactions[i].description;
    if (description in transactionDict) {
      transactionDict[description] += 1;
      transactionDict[description + "price"].push(transactions[i].amount);
    }
    else {
      transactionDict[description] = 1;
      transactionDict[description + "price"] = [transactions[i].amount];
    }
  };

  keysSorted = Object.keys(transactionDict).sort(function(a,b){return transactionDict[b]-transactionDict[a]});

  topThree = {};

  for (var i = 0; i < 3; i++) {
    topThree[transactionDict[keysSorted[i]]] = getAverage(transactionDict[keysSorted[i] + "price"]);
  }

  return topThree;

});

Parse.Cloud.job("getMerchantNameById", function(request, response) {
  Parse.Cloud.httpRequest({
    url: 'http://api.reimaginebanking.com/merchants/' + request.merchant_id,
    params: {
      key : 'd050a1874e89b27881665db1d0352daa'
    }
  }).then(function(httpResponse) {
    // success
    console.log(httpResponse.text);
    return httpResponse.name;
  },function(httpResponse) {
    // error
    console.error('Request failed with response code ' + httpResponse.status);
  });

});

function getAverage(price_list) {
  var total = 0;
  for(var i = 0; i < grades.length; i++) {
    total += grades[i];
  }
  var avg = total / grades.length;
  return avg;
}
