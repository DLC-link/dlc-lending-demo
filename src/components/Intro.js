import React from "react";
import eventBus from "../EventBus";
import {
    Text,
    Box,
    Collapse,
    Flex
} from "@chakra-ui/react";

export default class Header extends React.Component {

    constructor() {
        super();
        this.state = {
            isConnected: false
        };
    }

    componentDidMount() {
        eventBus.on("account-connected", (data) =>
            this.setState({ isConnected: data.isConnected })
        );
    }

    render() {
        return (
            <Collapse in={!this.state.isConnected}>
                <Box width="full" height="auto" px="100px" py="50px" bgGradient="linear(to-r, background1, background2)">
                    <Box margin="60px" height="auto" width="auto" bgGradient="linear(to-r, primary1, primary2)" borderRadius="lg">
                    <Text margin="15px" fontSize="8xl" color="white" >Welcome to </Text>
                    <Text margin="15px" fontWeight="extrabold" fontSize="8xl" color="white" >DLC.Link </Text>
                    </Box>
                    <Box margin="60px" height="auto" width="auto">
                    <Text margin="15px" fontWeight="extrabold" fontSize="4xl" color="accent" bgGradient="linear(to-r, primary1, primary2)" bgClip='text'>Connect your wallet</Text>
                    </Box>
                </Box>
            </Collapse>
        )
    }
}