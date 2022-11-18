import fetch from 'node-fetch'

const WALLET_DOMAIN = "https://dev-oracle.dlc.link/wallet";

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
    const URL = WALLET_DOMAIN + `/offer`;
    const response = await fetch(URL, { 
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        "uuid": uuid,
        "acceptCollateral": parseInt(collateral),
        "totalOutcomes": 1
      })
    })
     
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText }
    }
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ identity, user, msg: data }),
    }
  } catch (error) {
    // output to netlify function log
    console.log(error)
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ msg: error.message }),
    }
  }
}

module.exports = { handler }
