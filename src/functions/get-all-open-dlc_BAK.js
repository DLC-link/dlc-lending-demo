

const URLAPI = `http://stx-btc1.dlc.link:3999/extended/v1/tokens/nft/holdings?asset_identifiers=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlc-manager-loan-v0::open-dlc&principal=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlc-manager-loan-v0`;

let data = null;

function setData(dt) {
    data = dt;
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

export default async function() {
    const uuidArray = [];
    await fetch(URLAPI)
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => console.error(error))
        .finally(() => {
            data.results.map((res) => uuidArray.push(hex2ascii(extractUUID(res))));
        });
    return uuidArray;
}

