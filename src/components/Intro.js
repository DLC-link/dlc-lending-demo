import React from "react";
import eventBus from "../EventBus";
import {
    Text,
    Box,
    Collapse
} from "@chakra-ui/react";

export default class Header extends React.Component {

    constructor() {
        super();
        this.state = {
            isConnected: false
        };
    }

    componentDidUpdate(previousProps) {
        if (previousProps.isConnected !== this.props.isConnected) {
            this.setState({ isConnected: this.props.isConnected })
        }
    }

    render() {
        return (
            <Collapse in={!this.state.isConnected}>
                <Box
                    width="auto"
                    margin={25}
                >
                    <Box
                        bgGradient="linear(to-r, primary1, primary2)"
                        borderRadius="lg">
                        <Text
                            padding={[1, 15]}
                            fontSize={[25, 100]}
                            color="white"
                        >Welcome to
                        </Text>
                        <Text
                            padding={[1, 15]}
                            fontWeight="extrabold"
                            fontSize={[25, 100]}
                            color="white"
                        >DLC.Link </Text>
                    </Box>
                    <Box>
                        <Text 
                        padding={[1, 15]}
                        fontWeight="extrabold" 
                        fontSize={[25, 50]}
                        color="accent" 
                        bgGradient="linear(to-r, primary1, primary2)" 
                        bgClip='text'
                        >Connect your wallet</Text>
                    </Box>
                </Box>
            </Collapse>
        )
    }
}