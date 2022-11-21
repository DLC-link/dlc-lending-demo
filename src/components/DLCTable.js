import React from "react";
import eventBus from "../EventBus";
import { RepeatClockIcon } from "@chakra-ui/icons";
import {
  VStack,
  Text,
  HStack,
  Collapse,
  IconButton,
  SimpleGrid,
  ScaleFade,
} from "@chakra-ui/react";
import { customShiftValue, fixedTwoDecimalShift, hex2ascii } from "../utils";
import Card from "./Card";

export default class DLCTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: "",
      isConnected: this.props.isConnected,
      bitCoin: 0,
      formattedDLCArray: [],
      isLoading: true,
    };
  }

  componentDidMount() {
    this.setState({ address: this.props.address });
    this.setFormattedDLCArray()
      .then((formattedDLCArray) =>
        this.setState({ formattedDLCArray: formattedDLCArray })
      )
      .then(() => this.setState({ isLoading: false }));
  }

  componentDidUpdate(previousProps) {
    if (previousProps.isConnected !== this.props.isConnected) {
      this.setState({ isConnected: this.props.isConnected });
    }
  }

  openDepositModal() {
    eventBus.dispatch("is-deposit-modal-open", { isDepositOpen: true });
  }

  refreshDLCTable() {
    this.setState({ isLoading: true });
    this.setFormattedDLCArray()
      .then((formattedDLCArray) =>
        this.setState({ formattedDLCArray: formattedDLCArray })
      )
      .then(() => this.setState({ isLoading: false }));
  }

  async setFormattedDLCArray() {
    return this.formatAllDLC(await this.fetchAllDLC());
  }

  async fetchAllUUID() {
    let uuidArray = [];
    await fetch("/.netlify/functions/get-all-open-dlc", {
      headers: { accept: "Accept: application/json" },
    })
      .then((x) => x.json())
      .then(({ msg }) => {
        uuidArray = msg;
      });
    return uuidArray;
  }

  async fetchAllDLC() {
    const dlcArray = [];
    const uuidArray = await this.fetchAllUUID();
    for (const uuid of uuidArray) {
      await fetch("/.netlify/functions/get-dlc?uuid=" + uuid, {
        headers: { accept: "Accept: application/json" },
      })
        .then((x) => x.json())
        .then(({ msg }) => {
          if (msg.owner.value == this.state.address) {
            dlcArray.push(msg);
          }
        });
    }
    return dlcArray;
  }

  formatAllDLC(dlcArray) {
    const formattedDLCArray = [];
    for (const dlc of dlcArray) {
      const formattedDLC = this.formatDLC(dlc);
      formattedDLCArray.push(formattedDLC);
    }
    return formattedDLCArray;
  }

  formatDLC(dlc) {
    let formattedDLC = {
      dlcUUID: hex2ascii(dlc.dlc_uuid.value.value),
      status: dlc.status.value,
      owner: dlc.owner.value,
      liquidationFee: fixedTwoDecimalShift(dlc["liquidation-fee"].value) + " %",
      liquidationRatio:
        fixedTwoDecimalShift(dlc["liquidation-ratio"].value) + " %",
      vaultCollateral:
        customShiftValue(dlc["vault-collateral"].value, 8, true) + " BTC",
      vaultLoan: "$ " + fixedTwoDecimalShift(dlc["vault-loan"].value),
      closingPrice: "$ " + fixedTwoDecimalShift(dlc["closing-price"].value),
    };
    return formattedDLC;
  }

  render() {
    return (
      <>
        <Collapse in={this.state.isConnected}>
          <VStack margin={25} alignContent="center" justifyContent="center">
            <HStack spacing={15}>
              <Text fontSize={[25, 50]} fontWeight="extrabold" color="white">
                Loans
              </Text>
              <IconButton
                _hover={{
                  background: "secondary1",
                }}
                isLoading={this.state.isLoading}
                variant="outline"
                onClick={() => this.refreshDLCTable()}
                color="white"
                borderRadius="full"
                width={[25, 35]}
                height={[25, 35]}
              >
                <RepeatClockIcon color="accent"></RepeatClockIcon>
              </IconButton>
            </HStack>
            <SimpleGrid columns={[1, 4]} spacing={[0, 15]}>
              {this.state.formattedDLCArray?.map((dlc) => (
                <ScaleFade in={!this.state.isLoading} key={dlc.dlcUUID}>
                  <Card
                    status={dlc.status}
                    dlcUUID={dlc.dlcUUID}
                    owner={dlc.owner}
                    vaultCollateral={dlc.vaultCollateral}
                    vaultLoan={dlc.vaultLoan}
                    liquidationFee={dlc.liquidationFee}
                    liquidationRatio={dlc.liquidationRatio}
                    closingPrice={dlc.closingPrice}
                  ></Card>
                </ScaleFade>
              ))}
            </SimpleGrid>
          </VStack>
        </Collapse>
      </>
    );
  }
}
