process.env.GOOGLE_APPLICATION_CREDENTIALS = "meanwhile-bot-8f3a66001f51.json";
var express = require('express');
var router = express.Router();
const projectId = 'meanwhile-bot'; 
const sessionId = 'quickstart-session-id';
const languageCode = 'th-TH';
const botModel = require('./../models/bot.model')
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

const sessionPath = sessionClient.sessionPath(projectId, sessionId);
var waiting_acc = 0;
function hasNumber(myString) {
  return /\d/.test(myString);
}
router.post('/check', function(req, res, next) {
  const query = req.body.input;
  
  if(query !== ""){
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };
    sessionClient
      .detectIntent(request)
      .then(responses => {
        console.log('Detected intent');
        const result = responses[0].queryResult;
        console.log(`  Query: ${result.queryText}`);
        console.log(`  Response: ${result.fulfillmentText}`);
        console.log(`  Intent: ${result.intent.displayName}`);
        console.log(JSON.stringify(result.parameters));
        if (result.intent) {
          res.send(JSON.stringify(result));
        } else {
          console.log(`  No intent matched.`);
        }
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
  } else {
      res.send("Error");
  }
});

router.post('/check-multi', function(req, res, next) {
  var query = req.body.input;
  var user_id = req.body.user_id;

  var responseData = "";

  if(waiting_acc == 1) {
    if(hasNumber(query)){
      var Checknumb = query.match(/\d/g);
          Checknumb = Checknumb.join("");
      var balance;
      var sql_w_acc = 'SELECT * FROM kbtg_dataset.sa_transaction st join ip_sa_mapper ism on st.sa_id = ism.sa_id where st.sa_id = ' + connection.escape(Checknumb) + ' and ism.u_id = ' + connection.escape(user_id) + ' order by txn_dt DESC ,txn_tm DESC limit 1';
      connection.query(sql_w_acc, function (error, results, fields) {
        var result = JSON.parse(JSON.stringify(results));
          if (results.length > 0){
            balance = JSON.stringify(results[0].crn_bal);
            responseData = "มียอดเงินคงเหลือ " + balance.toLocaleString() + " บาท";
          } else {
            responseData = "ไม่พบบัญชีที่ต้องการ";
          }
      });
      waiting_acc = 0;
    } else {
      responseData = "กรุณาระบุบัญชีของท่าน";
      waiting_acc = 1; 
    }
    res.send(JSON.stringify({"query":query,"status": 200, "response": responseData}));
    query = "";
  }

  if(query !== ""){
    console.log("gi");
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };
    sessionClient
      .detectIntent(request)
      .then(responses => {
        console.log('Detected intent');
        const result = responses[0].queryResult;
        console.log(`  Query: ${result.queryText}`);
        console.log(`  Response: ${result.fulfillmentText}`);
        console.log(`  Intent: ${result.intent.displayName}`);
        console.log(JSON.stringify(result.parameters));
        switch(result.intent.displayName) {
            case "check_balance_w_acc":
                var data_input = result.parameters.fields.sa_id.stringValue;
                if(hasNumber(data_input)){
                  var numb = data_input.match(/\d/g);
                      numb = numb.join("");
                  var balance;
                  var sql = 'SELECT * FROM kbtg_dataset.sa_transaction st join ip_sa_mapper ism on st.sa_id = ism.sa_id where st.sa_id = ' + connection.escape(numb) + ' and ism.u_id = ' + connection.escape(user_id) + ' order by txn_dt DESC ,txn_tm DESC limit 1';
                  connection.query(sql, function (error, results, fields) {
                    var result = JSON.parse(JSON.stringify(results));
                    if (error) 
                        console(error);
                    else
                      if (results.length > 0){
                        balance = JSON.stringify(results[0].crn_bal);
                        responseData = "มียอดเงินคงเหลือ " + balance.toLocaleString() + " บาท";
                      } else {
                        responseData = "ไม่พบบัญชีที่ต้องการ";
                      }

                    res.send(JSON.stringify({"query":query,"status": 200, "response": responseData}));
                  });
                }
                else{
                  responseData = "กรุณาระบุบัญชีของท่าน";
                  res.send(JSON.stringify({"query":query,"status": 200, "response": responseData}));
                }
                break;
            case "check_balance_wo_acc":
                var sql_wo = 'SELECT * FROM ip_sa_mapper where u_id = ' + connection.escape(user_id);
                  connection.query(sql_wo, function (error, results, fields) {
                    var result = JSON.parse(JSON.stringify(results));
                    if (error) 
                        console(error);
                    else
                      if (result.length > 0){
                        responseData = "พบบัญชีของท่านทั้งหมด " + result.length + " บัญชี <br>";
                        for(var i = 0 ; i < result.length ; i++ ){
                          if(i+1 != result.length){
                            responseData += result[i].sa_id + " , ";
                          } else {
                            responseData += result[i].sa_id;  
                          }
                        }
                      } else {
                        responseData = "ไม่พบบัญชีที่ท่านต้องการ";
                      }
                    res.send(JSON.stringify({"query":query,"status": 200, "response": responseData}));
                  });
                break;
            case "check_cc_limit":
                var sql_cc = 'SELECT * FROM ip_cc_mapper icm join cc_information ci on icm.cc_cst_no = ci.main_cc_cst_no where icm.u_id = ' + connection.escape(user_id);
                  console.log(sql_cc);
                  connection.query(sql_cc, function (error, results, fields) {
                    var result = JSON.parse(JSON.stringify(results));
                    if (error) 
                        console(error);
                    else
                      if (result.length > 0){
                        responseData = "พบบัตรเครดิตของท่านทั้งหมด " + result.length + " บัตร คือ <br> มีวงเงินคงเหลือ คือ <br>";
                        for(var i = 0 ; i < result.length ; i++ ){
                          if(i+1 != result.length){
                            responseData += result[i].cc_cst_no + " เหลือ " + result[i].cr_lmt_amt + " , <br>";
                          } else {
                            responseData += result[i].cc_cst_no + " เหลือ " +  result[i].cr_lmt_amt;  
                          }
                        }
                      } else {
                        responseData = "ไม่พบบัญชีที่ท่านต้องการ";
                      }
                    res.send(JSON.stringify({"query":query,"status": 200, "response": responseData}));
                  });
                break;
            case "Default Welcome Intent":
                responseData = result.fulfillmentText;
                res.send(JSON.stringify({"query":query,"status": 200, "response": responseData}));
                break;
            case "Promo":
                var sql_pm = 'SELECT mcc,count(*) as freq from (SELECT mcc FROM kbtg_dataset.ip_cc_mapper icm join cc_information ci on icm.cc_cst_no = ci.main_cc_cst_no join cc_transaction ct on ci.card_no_encpt = ct.card_no_encpt where icm.u_id = ' + connection.escape(user_id) + ' and mcc >= 742 and ct.txn_amt != 0 limit 30) as t1 group by mcc order by freq desc';
                  connection.query(sql_pm, function (error, results, fields) {
                    var result = JSON.parse(JSON.stringify(results));
                    if (error) 
                        console(error);
                    else
                      if (result.length > 0){
                        responseData = "โปรโมชั่น";

                      } else {
                        responseData = "ตอนนี้ยังไม่มีสิทธิ์พิเศษสำหรับท่าน";
                      }
                    res.send(JSON.stringify({"query":query,"status": 200, "response": responseData}));
                  });
                break;
            case "Default Fallback Intent":
                responseData = result.fulfillmentText;
                res.send(JSON.stringify({"query":query,"status": 200, "response": responseData}));
                break;
            case "User_want_to_exit":
                responseData = "ออกจากระบบ";
                res.send(JSON.stringify({"query":query,"status": 200, "response": responseData}));
                break;
            default:
                break;
        }
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
  } else {
      res.send(JSON.stringify({"query":query,"status": 200, "response": responseData}));
  }

});

router.post('/login', function(req, res, next) {
  const user_id = req.body.user_id;
      connection.query('SELECT * from ip_id where u_id = ' + connection.escape(user_id), function (error, results, fields) {
        if(results.length >= 1){
          console.log(user_id);
          res.send(JSON.stringify({"status": 200, "response": user_id}));
        } else {
          res.send(JSON.stringify({"status": 500, "response": null}));
        }
    });
});

module.exports = router;
