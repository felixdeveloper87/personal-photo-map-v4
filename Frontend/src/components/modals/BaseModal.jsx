import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  useColorModeValue,
  Icon,
  Text
} from '@chakra-ui/react';

/**
 * Base Modal Component - Provides consistent styling for all modals
 * Follows the project's design system with professional appearance
 */
const BaseModal = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  size = "lg",
  maxHeight = "80vh",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  isCentered = true,
  motionPreset = "slideInBottom"
}) => {
  // Theme-aware colors
  const bgGradient = useColorModeValue(
    "linear(to-br, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.98))",
    "linear(to-br, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.98))"
  );
  
  const borderColor = useColorModeValue(
    "rgba(148, 163, 184, 0.2)",
    "rgba(148, 163, 184, 0.1)"
  );
  
  const shadowColor = useColorModeValue(
    "rgba(0, 0, 0, 0.1)",
    "rgba(0, 0, 0, 0.3)"
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      isCentered={isCentered}
      motionPreset={motionPreset}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
    >
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
        transition="all 0.2s ease"
      />
      
      <ModalContent
        bgGradient={bgGradient}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        shadow={`0 25px 50px -12px ${shadowColor}`}
        maxHeight={maxHeight}
        overflow="hidden"
        mx={4}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: "translateY(-2px)",
          shadow: `0 32px 64px -12px ${shadowColor}`
        }}
      >
        {/* Header */}
        <ModalHeader
          display="flex"
          alignItems="center"
          gap={3}
          fontSize="2xl"
          fontWeight="bold"
          color={useColorModeValue("gray.800", "gray.100")}
          borderBottom="1px solid"
          borderColor={borderColor}
          pb={4}
          pt={6}
          px={6}
        >
          {icon && (
            <Box
              p={2}
              borderRadius="lg"
              bg={useColorModeValue("blue.50", "blue.900")}
              color={useColorModeValue("blue.600", "blue.200")}
            >
              <Icon as={icon} boxSize={6} />
            </Box>
          )}
          <Text>{title}</Text>
        </ModalHeader>

        {/* Close Button */}
        {showCloseButton && (
          <ModalCloseButton
            size="lg"
            borderRadius="full"
            bg={useColorModeValue("gray.100", "gray.700")}
            color={useColorModeValue("gray.600", "gray.300")}
            _hover={{
              bg: useColorModeValue("gray.200", "gray.600"),
              color: useColorModeValue("gray.800", "gray.100")
            }}
            transition="all 0.2s ease"
            top={4}
            right={4}
          />
        )}

        {/* Body */}
        <ModalBody
          px={6}
          py={6}
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.05)'),
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: useColorModeValue('rgba(0,0,0,0.2)', 'rgba(255,255,255,0.2)'),
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: useColorModeValue('rgba(0,0,0,0.3)', 'rgba(255,255,255,0.3)'),
            },
          }}
        >
          {children}
        </ModalBody>

        {/* Footer */}
        {footer && (
          <ModalFooter
            borderTop="1px solid"
            borderColor={borderColor}
            pt={4}
            px={6}
            pb={6}
          >
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BaseModal;
