const fetch = require('node-fetch');

const { ALPHA_API_KEY } = process.env;

const getCurrencyInfo = (indexfrom) =>
    fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${indexfrom}&to_currency=EUR&apikey=${ALPHA_API_KEY}`
    )
        .then(response => response.json())
        .then(data => {
            const changeRate = data['Realtime Currency Exchange Rate']['5. Exchange Rate'];
            console.log(changeRate);
            return changeRate;
        })
        .catch(error => console.log(error));

module.exports = getCurrencyInfo;