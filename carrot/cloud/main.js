//customer_id = 56241a13de4bf40b1711222c
//account_id = 56241a14de4bf40b17112eae
var nessieKey = 'd050a1874e89b27881665db1d0352daa';


// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.job("hello", function(request, response) {
  console.log("Hello world!lslofkajhlsfkjahlsdkjfh");
});

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

Parse.Cloud.define("getPurchasesforAccount", function(request, response) {
    var account_id = request.params.account_id;
    var apiUrl = 'http://api.reimaginebanking.com/accounts/' + account_id + "/purchases"
    Parse.Cloud.httpRequest({
      url: apiUrl,
      params: {
        key : nessieKey
      }
    }).then(function(httpResponse) {
      // success
      console.log(httpResponse.text);
      return httpResponse.body;
    },function(httpResponse) {
      // error
      console.error('Request failed with response code ' + httpResponse.status);
      return httpResponse.status;
    });
});

Parse.Cloud.job("getTotalSpareChange", function(request, response) {
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
        response.success(total);
      },
      error: function(httpResponse) {
        // error
        console.error('Request failed with response code ' + httpResponse.status);
        response.error(status);
      }
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
