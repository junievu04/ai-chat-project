import { Box, Flex } from "@/vendors/styled-system/jsx";

export default function TypingIndicator() {
  return (
    <Flex alignItems="center" gap="1.5" py={1}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          w="2"
          h="2"
          borderRadius="full"
          bg="text.muted"
          animation="typingBounce 1.2s ease infinite"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </Flex>
  );
}
