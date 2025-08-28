// components/modals/UserProfileModal.jsx
import React from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Avatar,
  useColorModeValue,
  Divider
} from "@chakra-ui/react";
import { FaUser, FaEnvelope, FaCamera, FaGlobe, FaCrown } from "react-icons/fa";
import BaseModal from "./BaseModal";
import ModalButton from "./ModalButton";

const UserProfileModal = ({ isOpen, onClose, fullname, email, photoCount, countryCount, isPremium = false }) => {
  const textColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");

  const footer = (
    <HStack spacing={3} w="full">
      <ModalButton
        variant="secondary"
        onClick={onClose}
        w="full"
      >
        Close
      </ModalButton>
      {!isPremium && (
        <ModalButton
          variant="outline"
          onClick={() => {
            // TODO: Implement upgrade to premium
          }}
          w="full"
        >
          Upgrade to Premium
        </ModalButton>
      )}
    </HStack>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="My Profile"
      icon={FaUser}
      footer={footer}
      size="md"
    >
      <VStack spacing={6} align="stretch">
        {/* Profile Header */}
        <Box
          textAlign="center"
          p={6}
          borderRadius="xl"
          bg={useColorModeValue("blue.50", "blue.900")}
          border="1px solid"
          borderColor={useColorModeValue("blue.200", "blue.700")}
        >
          <Avatar
            size="xl"
            name={fullname}
            bg={useColorModeValue("blue.500", "blue.400")}
            color="white"
            mb={3}
          />
          <Text fontSize="xl" fontWeight="bold" color={textColor} mb={2}>
            {fullname}
          </Text>
          {isPremium && (
            <Badge
              colorScheme="yellow"
              variant="solid"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="sm"
              display="flex"
              alignItems="center"
              gap={2}
              w="fit-content"
              mx="auto"
            >
              <FaCrown />
              Premium Member
            </Badge>
          )}
        </Box>

        {/* Profile Information */}
        <VStack spacing={4} align="stretch">
          {/* Email */}
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
                bg={useColorModeValue("green.100", "green.900")}
                color={useColorModeValue("green.600", "green.300")}
              >
                <FaEnvelope size={16} />
              </Box>
              <Text fontWeight="semibold" color={textColor}>
                Email Address
              </Text>
            </HStack>
            <Text color={textColor} fontSize="md">
              {email}
            </Text>
          </Box>

          <Divider />

          {/* Stats Grid */}
          <HStack spacing={4} justify="space-between">
            {/* Photo Count */}
            <Box
              flex={1}
              p={4}
              borderRadius="lg"
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
              textAlign="center"
            >
              <Box
                p={2}
                borderRadius="md"
                bg={useColorModeValue("purple.100", "purple.900")}
                color={useColorModeValue("purple.600", "purple.300")}
                w="fit-content"
                mx="auto"
                mb={2}
              >
                <FaCamera size={16} />
              </Box>
              <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                {photoCount}
              </Text>
              <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                Photos
              </Text>
            </Box>

            {/* Country Count */}
            <Box
              flex={1}
              p={4}
              borderRadius="lg"
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
              textAlign="center"
            >
              <Box
                p={2}
                borderRadius="md"
                bg={useColorModeValue("teal.100", "teal.900")}
                color={useColorModeValue("teal.600", "teal.300")}
                w="fit-content"
                mx="auto"
                mb={2}
              >
                <FaGlobe size={16} />
              </Box>
              <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                {countryCount}
              </Text>
              <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                Countries
              </Text>
            </Box>
          </HStack>
        </VStack>
      </VStack>
    </BaseModal>
  );
};

export default UserProfileModal;