process.env.GOOGLE_APPLICATION_CREDENTIALS = "meanwhile-bot-8f3a66001f51.json";
var express = require('express');
var router = express.Router();
const projectId = 'meanwhile-bot'; 
const sessionId = 'quickstart-session-id';
const languageCode = 'th-TH';

const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

router.post('/check', function(req, res, next) {
const query = req.body.input;
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
    console.log(`  parameters: ${result.parameters}`);
    if (result.intent) {
      res.send(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
});

router.post('/check-multi', function(req, res, next) {
const query = req.body.input;
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
      res.send(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
});

module.exports = router;
