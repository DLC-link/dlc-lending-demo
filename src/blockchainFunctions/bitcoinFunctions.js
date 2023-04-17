/*global chrome*/

const sendOfferForSigning = async (offer) => {
    const extensionIDs = process.env.REACT_APP_ADDITIONAL_EXTENSION_IDS.split(',');

    for (let i = 0; i < extensionIDs.length; i++) {
        chrome.runtime.sendMessage(
            extensionIDs[i],
            {
                action: 'dlc.offerRequest',
                data: {
                    offer: offer,
                    counterpartyWalletUrl: process.env.REACT_APP_WALLET_DOMAIN,
                },
            },
            {},
            function () {
                if (chrome.runtime.lastError) {
                    console.log('Failure: ' + chrome.runtime.lastError.message);
                } else {
                    console.log('Success: Found receiving end.');
                }
            }
        );
    }
};

export const lockBTC = async (vaultContract) => {
    const URL = process.env.REACT_APP_WALLET_DOMAIN + `/offer`;
    console.log(vaultContract)
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uuid: vaultContract.uuid,
                acceptCollateral: parseInt(vaultContract.vaultCollateral),
                offerCollateral: 0,
                totalOutcomes: 100,
            }),
        });
        const responseStream = await response.json();
        if (!response.ok) {
            console.error(responseStream.errors[0].message);
        }
        sendOfferForSigning(responseStream);
    } catch (error) {
        console.error(error);
    }
};
