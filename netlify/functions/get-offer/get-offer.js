import fetch from 'node-fetch'

const handler = async function (event, context) {
  if (!context.clientContext && !context.clientContext.identity) {
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({
        msg: 'No identity instance detected. Did you enable it?',
      }),
    }
  }
  const { identity, user } = context.clientContext
  try {
    const uuid = event.queryStringParameters.uuid;
    const collateral = event.queryStringParameters.collateral;
    const URL = process.env.REACT_APP_WALLET_DOMAIN + `/offer`;
    const response = await fetch(URL, { 
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        "uuid": uuid,
        "acceptCollateral": parseInt(collateral),
        "offerCollateral": 1000,
        "totalOutcomes": 100
      })
    })

    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText }
    }

    console.log(response);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ identity, user, msg: data }),
    }
  } catch (error) {
    // output to netlify function log
    console.error(error);
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ msg: error.message }),
    }
  }
}

module.exports = { handler }
