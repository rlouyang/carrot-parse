//customer_id = 56241a13de4bf40b1711222c
//account_id = 56241a14de4bf40b17112eae
var nessieKey = 'd050a1874e89b27881665db1d0352daa';
var nessieKey2 = '93da98350c71eb1daca8329c990c50e0';


// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

Parse.Cloud.job("getAccountsForCustomer", function(request, response) {
    var customer_id = request.params.customer_id;
    var apiUrl = 'http://api.reimaginebanking.com/customers/' + customer_id + "/accounts"
    Parse.Cloud.httpRequest({
      url: apiUrl,
      params: {
        key : nessieKey
      }
    }).then(function(httpResponse) {
      // success
      console.log(httpResponse.text);
    },function(httpResponse) {
      // error
      console.error('Request failed with response code ' + httpResponse.status);
    });
});

Parse.Cloud.define("getPurchasesForAccount", function(request, response) {
  // var account_id = request.params.account_id;
  // var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases"
  // Parse.Cloud.httpRequest({
  //   url: apiUrl,
  //   params: {
  //     key : nessieKey
  //   }
  // }).then(function(httpResponse) {
  //   // success
  //   console.log(httpResponse.text);
  //   response.success(httpResponse.data);
  // },function(httpResponse) {
  //   // error
  //   console.error('Request failed with response code ' + httpResponse.status);
  //   response.error(httpResponse.status);
  // });
  var account_id = request.params.account_id;

  var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases";
  Parse.Cloud.httpRequest({
    url: apiUrl,
    params: {
      key : nessieKey
    },
    success: function(httpResponse) {
      console.log(httpResponse.text);
      response.success(httpResponse.data);
    },
    error: function(httpResponse) {
      // error
      console.error('Request failed with response code ' + httpResponse.status);
      response.error(status);
    }
  });
});

Parse.Cloud.define("getTotalSpareChange", function(request, response) {
  var account_id = request.params.account_id;

  var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases";
  Parse.Cloud.httpRequest({
    url: apiUrl,
    params: {
      key : nessieKey
    },
    success: function(httpResponse) {
      var purchases = httpResponse.data;
      var total = 0;
      for (var i = 0; i < purchases.length; i++) {
        total += (Math.ceil(purchases[i]["amount"]) - purchases[i]["amount"]);
      }
      console.log(total);
      response.success(roundToTwo(total));
    },
    error: function(httpResponse) {
      // error
      console.error('Request failed with response code ' + httpResponse.status);
      response.error(status);
    }
  });
});


function custom_sort(a, b) {
    return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
}


Parse.Cloud.define("getMostRecentSpareChange", function(request, response) {
  var account_id = request.params.account_id;

  var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases";
  Parse.Cloud.httpRequest({
    url: apiUrl,
    params: {
      key : nessieKey
    },
    success: function(httpResponse) {
      var purchases = httpResponse.data;

      purchases.sort(custom_sort);
      console.log(purchases);
      var change = (Math.ceil(purchases[0]["amount"]) - purchases[0]["amount"])
      response.success(purchases[0]);
    },
    error: function(httpResponse) {
      // error
      console.error('Request failed with response code ' + httpResponse.status);
      response.error(status);
    }
  });
});


function getAverage(price_list) {
  var total = 0;
  for(var i = 0; i < price_list.length; i++) {
    total += price_list[i];
  }
  var avg = roundToTwo(total / price_list.length);
  return avg;
}


Parse.Cloud.define("processPurchases", function(request, response) {
  var account_id = request.params.account_id;

  var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases";
  Parse.Cloud.httpRequest({
    url: apiUrl,
    params: {
      key : nessieKey2
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
      

      keysSorted = Object.keys(transactionDict).sort(function(a,b){return transactionDict[b]-transactionDict[a]});
      console.log(transactionDict);
      topThree = {};
      for (var i = 0; i < Math.min(3, Object.keys(transactionDict).length); i++) {
        console.log(keysSorted[i]);
        topThree[keysSorted[i]] = getAverage(transactionPrices[keysSorted[i]]);
        console.log("top three" + i + ": " + topThree);      
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



Parse.Cloud.job("getMerchantNameById", function(request, response) {
  Parse.Cloud.httpRequest({
    url: 'http://api.reimaginebanking.com/merchants/' + request.merchant_id,
    params: {
      key : 'd050a1874e89b27881665db1d0352daa'
    }
  }).then(function(httpResponse) {
    // success
    console.log(httpResponse.text);
    response.success(httpResponse.data["amount"]);

    return httpResponse.name;
  },function(httpResponse) {
    // error
    console.error('Request failed with response code ' + httpResponse.status);
  });

});

















Parse.Cloud.job("getMostRecentSpareChange", function(request, response) {
    var account_id = request.params.account_id;
    var purchases = getPurchasesforAccount(account_id);
    var total = 0;
    for (var i = 0; i < purchases.length; i++) {
      if(purchases[i].status == "executed" && purchases[i].medium == "balance"){
        total += (Math.ceil(purchases[i].amount) - purchases[i].amount);
      }
    }
    console.log(total);
    return total;
});



function getPurchasesforAccount(account_id){
    var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases";
    var response = null;
    return Parse.Cloud.httpRequest({
      url: apiUrl,
      params: {
        key : nessieKey
      },
      success: function(httpResponse) {
        httpResponse.success(httpResponse.text);
      },
      error: function(httpResponse) {
        // error
        console.error('Request failed with response code ' + httpResponse.status);
        return httpResponse.status;
      }
    });
    // return Parse.Cloud.httpRequest({
    //   url: apiUrl,
    //   params: {
    //     key : nessieKey
    //   }
    // }).then(function(httpResponse) {
    //   // success
    //   httpResponse.success(httpResponse.text);
    // },function(httpResponse) {
    //   // error
    //   console.error('Request failed with response code ' + httpResponse.status);
    //   return httpResponse.status;
    // });
}

function roundToTwo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
}
