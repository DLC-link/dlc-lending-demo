import { Link, Flex, VStack, HStack, Text } from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";

export default function CustomToast({ explorerAddress, message, success }) {

  return (
    <Link
      href={explorerAddress}
      isExternal
      _hover={{
        textDecoration: "none",
      }}
    >
      <Flex
        color="white"
        opacity="75%"
        bgGradient="linear(to-r, primary1, primary2)"
        borderRadius="2xl"
        boxShadow="dark-lg"
        height={100}
        width={500}
        justifyContent="center"
        alignItems="center"
        _hover={{
          opacity: "100%",
          bg: "secondary1",
        }}
      >
        <VStack spacing={1.5}>
          <HStack spacing={1.5}>
            {success === true ? (
              <CheckCircleIcon color="green"></CheckCircleIcon>
            ) : (
              <WarningIcon color="red"></WarningIcon>
            )}
            <Text fontSize={18} fontWeight="extrabold">
              {message}
            </Text>
          </HStack>
          {success && (
            <Text fontSize={12} fontWeight="bold">
              Click to show transaction in the explorer!
            </Text>
          )}
        </VStack>
      </Flex>
    </Link>
  );
}
