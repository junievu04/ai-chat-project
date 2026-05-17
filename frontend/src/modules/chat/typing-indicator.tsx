import { Box, Flex } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react/dist/iconify.cjs";

export default function TypingIndicator() {
  return (
    <Flex gap="3" alignItems="flex-start" animation="fadeSlide">
      <Flex
        alignItems="center"
        justifyContent="center"
        w="8"
        h="8"
        borderRadius="full"
        flexShrink={0}
        bg="brand"
        color="white"
      >
        <Icon icon="solar:stars-bold" width={14} />
      </Flex>

      <Flex
        alignItems="center"
        gap="1.5"
        px="4"
        py="3.5"
        borderRadius="xl"
        borderBottomLeftRadius="sm"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border"
      >
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
    </Flex>
  );
}
