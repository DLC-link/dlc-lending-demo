import fetch from 'node-fetch';

const handler = async function () {
  const URLAPI = "http://stx-btc1.dlc.link:3999/extended/v1/tokens/nft/holdings?asset_identifiers=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlc-manager-loan-v0::open-dlc&principal=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlc-manager-loan-v0";

  let data = null;

  function setData(currentData) {
      data = currentData;
  }

  function extractUUID(data) {
      return data.value.repr;
  }

  function hex2ascii(hexx) {
      var hex = hexx.toString(); //force conversion
      var str = "";
      for (var i = 2; i < hex.length; i += 2)
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str;
  }

  try {
    const response = await fetch(URLAPI, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText }
    }
    const uuidArray = [];
    setData(await response.json());
    data.results.map((result) => uuidArray.push(hex2ascii(extractUUID(result))));

    return {
      statusCode: 200,
      body: JSON.stringify({ msg: uuidArray }),
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
