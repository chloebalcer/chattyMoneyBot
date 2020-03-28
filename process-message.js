const Dialogflow = require('dialogflow');
const Pusher = require('pusher');
const getCurrencyInfo = require('./alpha');

const projectId = 'chatty-bot-cktkyv';
const sessionId = '58324812974';
const languageCode = 'en-US';

const config = {
    credentials: {
        private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
        client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
    },
};

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    useTLS: true,
});

const sessionClient = new Dialogflow.SessionsClient(config);

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const processMessage = message => {
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode,
            },
        },
    };

    sessionClient
        .detectIntent(request)
        .then(responses => {
            const result = responses[0].queryResult;

            // If the intent matches 'currency-rate'
            if (result.intent.displayName === 'currency-rate') {
                var indexfrom = result.parameters.fields['currencyFrom'].stringValue;
                const moneyValue = result.parameters.fields['number'].numberValue;
                if (indexfrom === "$" || indexfrom === "dollars" || indexfrom === "dollar") {
                    indexfrom = "USD";
                }
                if (indexfrom === "pounds" || indexfrom === "Pounds") {
                    indexfrom = "GBP";
                }
                // fetch the exchange rate from the alphavantage API
                return getCurrencyInfo(indexfrom).then(exchangeRate => {
                    const resultMoney = parseFloat(exchangeRate) * moneyValue;
                    console.log(exchangeRate)
                    return pusher.trigger('bot', 'bot-response', {

                        message: `You'll get ${resultMoney} Euro. `,
                    });
                });
            }

            return pusher.trigger('bot', 'bot-response', {
                message: result.fulfillmentText,
            });
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
}

module.exports = processMessage;