//customer_id = 56241a13de4bf40b1711222c
//account_id = 56241a14de4bf40b17112eae
var nessieKey = '93da98350c71eb1daca8329c990c50e0';


// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
/*
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
*/


Parse.Cloud.define("getPurchasesForUser", function(request, response) {
  var query = new Parse.Query("User");
  query.equalTo("objectId", request.params.object_id);
  query.find({
    success: function(results) {
      var account_id = results[0].get("account_id");

      var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases";
      Parse.Cloud.httpRequest({
        url: apiUrl,
        params: {
          key : nessieKey
        },
        success: function(httpResponse) {
          console.log(httpResponse.text);
          var purchases = httpResponse.data
          for(var i = 0; i < purchases.length; i++){
            var change = (Math.ceil(purchases[i]["amount"]) - purchases[i]["amount"]);
            purchases[i]["change"] = change;
          }
          console.log(purchases);
          response.success(JSON.stringify(purchases));
        },
        error: function(httpResponse) {
          // error
          console.error('Request failed with response code ' + httpResponse.status);
          response.error(status);
        }
      });
    },
    error: function() {
      response.error("Account lookup failed");
    }
  });

});




Parse.Cloud.define("getTotalSpendingChange", function(request, response) {
  var query = new Parse.Query("User");
  query.equalTo("objectId", request.params.object_id);
  query.find({
    success: function(results) {
      var account_id = results[0].get("account_id");

      var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases";
      Parse.Cloud.httpRequest({
        url: apiUrl,
        params: {
          key : nessieKey
        },
        success: function(httpResponse) {
          var purchases = httpResponse.data;
          var totalSpending = 0;
          var totalChange = 0;
          for (var i = 0; i < purchases.length; i++) {
            totalSpending += purchases[i]["amount"];
            totalChange += (Math.ceil(purchases[i]["amount"]) - purchases[i]["amount"]);
          }
          var data = {};
          data["total_spending"] = roundToTwo(totalSpending);
          data["total_change"] = roundToTwo(totalChange);
          console.log(data);
          response.success(JSON.stringify(data));
        },
        error: function(httpResponse) {
          // error
          console.error('Request failed with response code ' + httpResponse.status);
          response.error(status);
        }
      });
    },
    error: function() {
      response.error("Account lookup failed");
    }
  });

});

Parse.Cloud.define("getMostRecentSpareChange", function(request, response) {
  var query = new Parse.Query("User");
  query.equalTo("objectId", request.params.object_id);
  query.find({
    success: function(results) {
      var account_id = results[0].get("account_id");

      var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases";
      Parse.Cloud.httpRequest({
        url: apiUrl,
        params: {
          key : nessieKey
        },
        success: function(httpResponse) {
          var purchases = httpResponse.data;

          purchases.sort(dateSort);
          console.log(purchases);
          var change = (Math.ceil(purchases[0]["amount"]) - purchases[0]["amount"])
          var data = {};
          data["recent_change"] = roundToTwo(change);
          response.success(JSON.stringify(data));
        },
        error: function(httpResponse) {
          // error
          console.error('Request failed with response code ' + httpResponse.status);
          response.error(status);
        }
      });

    },
    error: function() {
      response.error("Account lookup failed");
    }
  });
  
});

Parse.Cloud.define("processPurchases", function(request, response) {

  var query = new Parse.Query("User");
  query.equalTo("objectId", request.params.object_id);
  query.find({
    success: function(results) {
      var account_id = results[0].get("account_id");

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
          

          keysSorted = Object.keys(transactionDict).sort(function(a,b){return transactionDict[b]-transactionDict[a]});
          console.log(transactionDict);
          topThree = {};
          for (var i = 0; i < Math.min(3, Object.keys(transactionDict).length); i++) {
            console.log(keysSorted[i]);
            topThree[keysSorted[i]] = getAverage(transactionPrices[keysSorted[i]]);
            console.log("top three" + i + ": " + topThree);      
          }
          response.success(JSON.stringify(topThree));
        },
        error: function(httpResponse) {
          // error
          console.error('Request failed with response code ' + httpResponse.status);
          response.error(status);
        }
      });
    },
    error: function() {
      response.error("Account lookup failed");
    }
  });

});


Parse.Cloud.define("addToCarrot", function(request, response) {

  var query = new Parse.Query("User");
  query.equalTo("objectId", request.params.object_id);
  query.find({
    success: function(results) {
      var carrot_id = results[0].get("carrot_id");

      var apiUrl = 'http://api.reimaginebanking.com/accounts/' + carrot_id + "/deposits";
      console.log(carrot_id);
      Parse.Cloud.httpRequest({
        url: apiUrl,
        params: {
          key : nessieKey
        },
        body: {
          "medium": "balance",
          "transaction_date": "2016-01-08",
          "status": "pending",
          "amount": 80, // needs to be in cents
          "description": "free money"
        },
        success: function(httpResponse) {
          console.log("success! deposited change into carrot!");
          response.success("hooray!");
        },
        error: function(httpResponse) {
          // error
          console.error('Request failed with response code ' + httpResponse.status);
          response.error(status);
        }
      });
    },
    error: function() {
      response.error("Account lookup failed");
    }
  });

});


Parse.Cloud.define("getAccountByObjectId", function(request, response) {
  var query = new Parse.Query("User");
  query.equalTo("objectId", request.params.object_id);
  query.find({
    success: function(results) {
      var account_id = results[0].get("account_id");

      response.success(account_id);
    },
    error: function() {
      response.error("Account lookup failed");
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

// helper functions

function dateSort(a, b) {
    return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
}

function getAverage(price_list) {
  var total = 0;
  for(var i = 0; i < price_list.length; i++) {
    total += price_list[i];
  }
  var avg = roundToTwo(total / price_list.length);
  return avg;
}

function roundToTwo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
}
