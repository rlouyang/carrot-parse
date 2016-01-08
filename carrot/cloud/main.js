//customer_id = 56241a13de4bf40b1711222c
//account_id = 56241a14de4bf40b17112eae
var nessieKey = '93da98350c71eb1daca8329c990c50e0';
var carrotMasterId = '568f15e43921211200ef2143';

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
          purchases.sort(dateSort);
          var data = [];
          for(var i = 0; i < purchases.length; i++){
            if(purchases[i]["description"] != "string" && purchases[i]["description"] != "Carrot Savings Charge"){
              var change = (Math.ceil(purchases[i]["amount"]) - purchases[i]["amount"]);
              purchases[i]["change"] = change;
              data.push(purchases[i]);
            }
            
          }
          console.log(data);
          response.success(JSON.stringify(data));
        },
        error: function(httpResponse) {
          // error
          console.error('Request failed with response code ' + httpResponse.status);
          response.error(httpRequest.status);
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
            if(purchases[i]["description"] != "string" && purchases[i]["description"] != "Carrot Savings Charge"){
              totalSpending += purchases[i]["amount"];
              totalChange += (Math.ceil(purchases[i]["amount"]) - purchases[i]["amount"]);
            }
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
          response.error(httpResponse.status);
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
          response.error(httpResponse.status);
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
          
          delete transactionDict["Carrot Savings Charge"];
          delete transactionPrices["Carrot Savings Charge"];

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
          response.error(httpResponse.status);
        }
      });
    },
    error: function() {
      response.error("Account lookup failed");
    }
  });

});
/*
Parse.Cloud.define("addToCarrot", function(request, response) {
  var query = new Parse.Query("User");
  var amount = request.params.amount;
  var change = roundToTwo(Math.ceil(amount) - amount);
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
          "transaction_date": "2016-01-09",
          "status": "pending",
          "amount": 100 * change, // needs to be in cents because of Nessie API. Keep watch for a fix
          "description": "Carrot Savings Deposit"
        },
        success: function(httpResponse) {
          console.log("success! deposited change into carrot!");
          response.success("hooray! deposited into carrot!");
        },
        error: function(httpResponse) {
          // error
          console.error('Request failed with response code ' + httpResponse.status);
          response.error(httpResponse.status);
        }
      });
    },
    error: function() {
      response.error("Account lookup failed");
    }
  });

});
*/

// pass in amount and object_id
Parse.Cloud.define("processNewPurchase", function(request, response) {
  var query = new Parse.Query("User");    
  var amount = request.params.amount;
  var change = roundToTwo(Math.ceil(amount) - amount);
  var merchant_id = "56241a13de4bf40b17112337";
  var description = "ice cream";

  query.equalTo("objectId", request.params.object_id);
  query.find({
    success: function(results) {
      var account_id = results[0].get("account_id");
      var carrot_id = results[0].get("carrot_id");

      var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases?key=" + nessieKey;

      // charge (normal) amount to card
      Parse.Cloud.httpRequest({
        method: "POST",
        url: apiUrl,
        // params: {
        //   key : nessieKey
        // },
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          "merchant_id": merchant_id,
          "medium": "balance",
          "purchase_date": "2016-01-09",
          "amount": amount, 
          "status": "pending",
          "description": description 
        },
        success: function(httpResponse) {
          console.log(httpResponse.text);
          console.log("success! charge amount to account!");
          // charge change to card
          Parse.Cloud.httpRequest({
            method: "POST",
            url: apiUrl,
            // params: {
            //   key : nessieKey
            // },
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              "merchant_id": carrotMasterId,
              "medium": "balance",
              "purchase_date": "2016-01-09",
              "amount": change, 
              "status": "pending",
              "description": "Carrot Savings Charge"
            },
            success: function(httpResponse) {
              console.log(httpResponse.text);
              console.log("success! charge change to account!");
              
              // add to carrot savings

              var carrotDepositUrl = 'http://api.reimaginebanking.com/accounts/' + carrot_id + "/deposits?key=" + nessieKey;

              Parse.Cloud.httpRequest({
                method: "POST",
                url: carrotDepositUrl,
                // params: {
                //   key : nessieKey
                // },
                headers: {
                  'Content-Type': 'application/json',
                },
                body: {
                  "medium": "balance",
                  "transaction_date": "2016-01-09",
                  "status": "pending",
                  "amount": 100 * change, // needs to be in cents because of Nessie API. Keep watch for a fix
                  "description": "Carrot Savings Deposit"
                },
                success: function(httpResponse) {
                  console.log(httpResponse.text);
                  console.log("success! deposited change into carrot!");
                  response.success("hooray! new purchase processed!");
                },
                error: function(httpResponse) {
                  // error
                  console.log(httpResponse.text);

                  console.error('inner Request failed with response code ' + httpResponse.status);
                  response.error(httpResponse.status);
                }
              });

            },
            error: function(httpResponse) {
              // error
              console.log(httpResponse.text);
              console.error('middle Request failed with response code ' + httpResponse.status);
              response.error(httpResponse.status);
            }
          });

        },
        error: function(httpResponse) {
          // error
          console.log(httpResponse.text);

          console.error('outer Request failed with response code ' + httpResponse.status + httpResponse.text);
          response.error(httpResponse.status);
        }
      });

    },
    error: function() {
      response.error("Account lookup failed");
    }
  });

});


Parse.Cloud.define("getCustomerFromObjectId", function(request, response) {
  var query = new Parse.Query("User");
  query.equalTo("objectId", request.params.object_id);
  query.find({
    success: function(results) {
      var customer_id = results[0].get("customer_id");

      var apiUrl = 'http://api.reimaginebanking.com/customers/' + customer_id;

      Parse.Cloud.httpRequest({
        url: apiUrl,
        params: {
          key : nessieKey
        },
        success: function(httpResponse) {
          var customer = httpResponse.data;
          response.success(JSON.stringify(customer));
        },
        error: function(httpResponse) {
          // error
          console.error('Request failed with response code ' + httpResponse.status);
          response.error(httpRequest.status);
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

// Parse.Cloud.define("getMerchantNameById", function(request, response) {

//   Parse.Cloud.httpRequest({
//     url: 'http://api.reimaginebanking.com/merchants/' + request.merchant_id,
//     params: {
//       key : 'd050a1874e89b27881665db1d0352daa'
//     }, 
//     success: function(httpResponse) {
//       response.success(JSON.stringify({"name": httpResponse.name}));
//     },
//     error: function(httpResponse) {
//       console.error('Request failed with response code ' + httpResponse.status);
//       // response.error(httpRequest.status);
//     }
//   });

// });

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
