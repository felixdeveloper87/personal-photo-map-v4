import React from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Progress,
  useColorModeValue,
  Badge,
  Icon
} from "@chakra-ui/react";
import { FaCloud, FaUpload, FaDownload, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import BaseModal from "./BaseModal";
import ModalButton from "./ModalButton";

/**
 * Professional Photo Storage Modal
 * Shows storage usage and management options
 */
const PhotoStorageModal = ({ isOpen, onClose, storageInfo, onUpgrade }) => {
  const textColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");

  // Mock data - replace with actual props
  const storageData = storageInfo || {
    used: 2.5, // GB
    total: 5, // GB
    photos: 150,
    isPremium: false
  };

  const usagePercentage = (storageData.used / storageData.total) * 100;
  const isNearLimit = usagePercentage > 80;
  const isAtLimit = usagePercentage >= 100;

  const getStorageColor = () => {
    if (isAtLimit) return "red";
    if (isNearLimit) return "orange";
    return "green";
  };

  const footer = (
    <Box w="full">
      <VStack spacing={3}>
        {!storageData.isPremium && (
          <ModalButton
            variant="primary"
            onClick={onUpgrade}
            leftIcon={<FaCloud />}
            w="full"
          >
            Upgrade Storage
          </ModalButton>
        )}
        <ModalButton
          variant="secondary"
          onClick={onClose}
          w="full"
        >
          Close
        </ModalButton>
      </VStack>
    </Box>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Photo Storage"
      icon={FaCloud}
      footer={footer}
      size="md"
    >
      <VStack spacing={6} align="stretch">
        {/* Storage Overview */}
        <Box
          p={6}
          borderRadius="xl"
          bg={useColorModeValue("blue.50", "blue.900")}
          border="1px solid"
          borderColor={useColorModeValue("blue.200", "blue.700")}
          textAlign="center"
        >
          <Box
            p={3}
            borderRadius="full"
            bg={useColorModeValue("blue.500", "blue.400")}
            color="white"
            w="fit-content"
            mx="auto"
            mb={3}
          >
            <FaCloud size={24} />
          </Box>
          <Text fontSize="xl" fontWeight="bold" color={textColor} mb={2}>
            Storage Usage
          </Text>
          <Text fontSize="md" color={useColorModeValue("gray.600", "gray.300")}>
            {storageData.used} GB of {storageData.total} GB used
          </Text>
        </Box>

        {/* Storage Progress */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="semibold" color={textColor}>
              Storage Used
            </Text>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
              {usagePercentage.toFixed(1)}%
            </Text>
          </HStack>
          <Progress
            value={usagePercentage}
            colorScheme={getStorageColor()}
            size="lg"
            borderRadius="full"
            bg={useColorModeValue("gray.200", "gray.600")}
          />
          <HStack justify="space-between" mt={2}>
            <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
              {storageData.used} GB used
            </Text>
            <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
              {storageData.total - storageData.used} GB free
            </Text>
          </HStack>
        </Box>

        {/* Warning if near limit */}
        {(isNearLimit || isAtLimit) && (
          <Box
            p={4}
            borderRadius="lg"
            bg={useColorModeValue("orange.50", "orange.900")}
            border="1px solid"
            borderColor={useColorModeValue("orange.200", "orange.700")}
          >
            <HStack spacing={3}>
              <Icon as={FaExclamationTriangle} color="orange.500" />
              <Box>
                <Text fontWeight="bold" color={useColorModeValue("orange.700", "orange.200")}>
                  {isAtLimit ? "Storage Full!" : "Storage Almost Full"}
                </Text>
                <Text fontSize="sm" color={useColorModeValue("orange.600", "orange.300")}>
                  {isAtLimit 
                    ? "You cannot upload more photos. Please upgrade your storage plan."
                    : "Consider upgrading your storage plan to avoid interruptions."
                  }
                </Text>
              </Box>
            </HStack>
          </Box>
        )}

        {/* Storage Stats */}
        <VStack spacing={4} align="stretch">
          <Box
            p={4}
            borderRadius="lg"
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
          >
            <HStack spacing={3} mb={2}>
              <Box
                p={2}
                borderRadius="md"
                bg={useColorModeValue("purple.100", "purple.900")}
                color={useColorModeValue("purple.600", "purple.300")}
              >
                <FaUpload size={16} />
              </Box>
              <Text fontWeight="semibold" color={textColor}>
                Photos Stored
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              {storageData.photos}
            </Text>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
              Total photos in your collection
            </Text>
          </Box>

          {/* Storage Plans */}
          <Box
            p={4}
            borderRadius="lg"
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
          >
            <Text fontWeight="semibold" color={textColor} mb={3}>
              Storage Plans
            </Text>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between" p={3} borderRadius="md" bg="white" border="1px solid" borderColor={borderColor}>
                <Text fontSize="sm" color={textColor}>Free Plan</Text>
                <Badge colorScheme="gray" variant="subtle">5 GB</Badge>
              </HStack>
              <HStack justify="space-between" p={3} borderRadius="md" bg={useColorModeValue("yellow.50", "yellow.900")} border="1px solid" borderColor={useColorModeValue("yellow.200", "yellow.700")}>
                <Text fontSize="sm" color={textColor}>Premium Plan</Text>
                <Badge colorScheme="yellow" variant="solid">100 GB</Badge>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </VStack>
    </BaseModal>
  );
};

export default PhotoStorageModal;
