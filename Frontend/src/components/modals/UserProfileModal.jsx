import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CountriesContext } from '../../context/CountriesContext';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { motion } from 'framer-motion';
import {
  Box,
  Heading,
  Text,
  Avatar,
  Flex,
  Grid,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue,
  Progress,
  SimpleGrid,
  Circle,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  useBreakpointValue,
  Divider,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import {
  FaMapMarkerAlt,
  FaCamera,
  FaGlobe,
  FaCalendarAlt,
  FaMedal,
  FaHeart,
  FaFlag,
  FaRoute,
  FaTrophy,
  FaStar,
  FaFire,
  FaCompass,
  FaUser,
  FaEnvelope,
  FaCrown,
  FaEdit,
} from 'react-icons/fa';
import BaseModal from './BaseModal';

// Configuring the ISO country library to use English as the default locale
countries.registerLocale(en);

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const UserProfileModal = ({ isOpen, onClose }) => {
  const { isLoggedIn, fullname, email, isPremium } = useContext(AuthContext);
  const { countriesWithPhotos, photoCount, countryCount } = useContext(CountriesContext);
  const [userStats, setUserStats] = useState({
    totalPhotos: 0,
    countriesVisited: 0,
    joinDate: new Date().getFullYear(),
    favoriteContinent: 'Unknown',
    travelScore: 0
  });
  
  // Responsive values
  const gridColumns = useBreakpointValue({ base: 2, sm: 2, md: 4, lg: 4 });
  const countryGridColumns = useBreakpointValue({ base: 2, sm: 3, md: 4, lg: 6 });
  
  // Theme colors
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)");
  const cardBorder = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.1)");
  const textColor = useColorModeValue("gray.700", "gray.100");
  const headingColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const premiumGradient = "linear-gradient(135deg, #fbbf24, #f59e0b)";

  useEffect(() => {
    if (isLoggedIn) {
      setUserStats({
        totalPhotos: photoCount || 0,
        countriesVisited: countryCount || 0,
        joinDate: new Date().getFullYear(),
        favoriteContinent: getFavoriteContinent(),
        travelScore: calculateTravelScore()
      });
    }
  }, [isLoggedIn, photoCount, countryCount, countriesWithPhotos]);

  const getFavoriteContinent = () => {
    const continentMap = {
      'US': 'North America', 'CA': 'North America', 'MX': 'North America',
      'BR': 'South America', 'AR': 'South America', 'CL': 'South America',
      'FR': 'Europe', 'DE': 'Europe', 'IT': 'Europe', 'ES': 'Europe', 'UK': 'Europe',
      'JP': 'Asia', 'CN': 'Asia', 'IN': 'Asia', 'TH': 'Asia', 'KR': 'Asia',
      'AU': 'Oceania', 'NZ': 'Oceania',
      'EG': 'Africa', 'ZA': 'Africa', 'MA': 'Africa', 'KE': 'Africa'
    };
    
    if (!countriesWithPhotos || countriesWithPhotos.length === 0) return 'World Explorer';
    
    const continentCounts = {};
    countriesWithPhotos.forEach(item => {
      let countryCode = '';
      if (typeof item === 'object' && item !== null) {
        countryCode = String(item.id || '').toUpperCase();
      } else {
        countryCode = String(item || '').toUpperCase();
      }
      const continent = continentMap[countryCode] || 'Other';
      continentCounts[continent] = (continentCounts[continent] || 0) + 1;
    });
    
    return Object.keys(continentCounts).reduce((a, b) => 
      continentCounts[a] > continentCounts[b] ? a : b
    ) || 'World Explorer';
  };

  const calculateTravelScore = () => {
    const photosScore = Math.min((photoCount || 0) * 2, 200);
    const countriesScore = Math.min((countryCount || 0) * 10, 300);
    return photosScore + countriesScore;
  };

  const getTravelBadges = () => {
    const badges = [];
    if (countryCount >= 10) badges.push({ name: "Globe Trotter", icon: FaGlobe, color: "blue" });
    if (countryCount >= 25) badges.push({ name: "World Explorer", icon: FaCompass, color: "purple" });
    if (countryCount >= 50) badges.push({ name: "Travel Master", icon: FaTrophy, color: "gold" });
    if (photoCount >= 100) badges.push({ name: "Photo Enthusiast", icon: FaCamera, color: "green" });
    if (photoCount >= 500) badges.push({ name: "Memory Keeper", icon: FaHeart, color: "red" });
    if (isPremium) badges.push({ name: "Premium Explorer", icon: FaStar, color: "yellow" });
    
    return badges;
  };

  const countryNamesList = countriesWithPhotos?.map((item) => {
    if (typeof item === 'object' && item !== null) {
      return { 
        code: String(item.id || '').toUpperCase(), 
        name: item.name || String(item.id || '').toUpperCase() 
      };
    } else {
      const countryCode = String(item || '').toUpperCase();
      const countryName = countries.getName(countryCode, 'en');
      return { code: countryCode, name: countryName || countryCode };
    }
  }) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
      icon={FaUser}
      size="lg"
    >
      <VStack spacing={6} align="stretch">
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Header Section */}
          <MotionBox variants={itemVariants} mb={6}>
            <Box
              p={6}
              borderRadius="xl"
              bg={useColorModeValue("blue.50", "blue.900")}
              border="1px solid"
              borderColor={useColorModeValue("blue.200", "blue.700")}
              position="relative"
              overflow="hidden"
            >
              {/* Premium Background Pattern */}
              {isPremium && (
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  w="100px"
                  h="100px"
                  bg="linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))"
                  borderRadius="full"
                  transform="translate(30px, -30px)"
                />
              )}
              
              <Flex align="center" justify="space-between" position="relative">
                <HStack spacing={4}>
                  <Box position="relative">
                    <Avatar
                      size="xl"
                      name={fullname}
                      bg={isPremium ? premiumGradient : accentColor}
                      color="white"
                      ring="3px"
                      ringColor={isPremium ? "yellow.400" : accentColor}
                    />
                    {isPremium && (
                      <Circle
                        size="24px"
                        bg={premiumGradient}
                        position="absolute"
                        bottom="-2px"
                        right="-2px"
                        border="3px solid white"
                      >
                        <Icon as={FaCrown} color="white" w={3} h={3} />
                      </Circle>
                    )}
                  </Box>
                  
                  <VStack spacing={2} align="start">
                    <HStack spacing={3} align="center">
                      <Heading as="h2" size="lg" color={headingColor}>
                        {fullname}
                      </Heading>
                      {isPremium && (
                        <Badge
                          colorScheme="yellow"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="sm"
                          fontWeight="bold"
                          bg={premiumGradient}
                          color="white"
                        >
                          <Icon as={FaStar} mr={1} w={3} h={3} />
                          PREMIUM
                        </Badge>
                      )}
                    </HStack>
                    
                    <HStack spacing={2} align="center">
                      <Icon as={FaEnvelope} color={textColor} w={4} h={4} />
                      <Text color={textColor} fontSize="sm">
                        {email}
                      </Text>
                    </HStack>
                    
                    <HStack spacing={2} align="center">
                      <Icon as={FaMapMarkerAlt} color={textColor} w={4} h={4} />
                      <Text color={textColor} fontSize="sm">
                        {userStats.favoriteContinent}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
                
                <Tooltip label="Edit Profile" hasArrow>
                  <IconButton
                    aria-label="Edit Profile"
                    icon={<FaEdit />}
                    size="sm"
                    variant="ghost"
                    color={textColor}
                    _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  />
                </Tooltip>
              </Flex>
            </Box>
          </MotionBox>

          {/* Statistics Cards */}
          <MotionBox variants={itemVariants} mb={6}>
            <Heading as="h3" size="md" mb={4} color={headingColor}>
              <Icon as={FaTrophy} mr={2} color="yellow.400" />
              Travel Statistics
            </Heading>
            <SimpleGrid columns={gridColumns} spacing={4}>
              <Box
                bg={bgColor}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                p={4}
                textAlign="center"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                <Icon as={FaCamera} w={5} h={5} color="blue.400" mb={2} />
                <Stat>
                  <StatNumber fontSize="xl" color={headingColor}>{userStats.totalPhotos}</StatNumber>
                  <StatLabel color={textColor} fontSize="sm">Photos</StatLabel>
                </Stat>
              </Box>

              <Box
                bg={bgColor}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                p={4}
                textAlign="center"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                <Icon as={FaGlobe} w={5} h={5} color="green.400" mb={2} />
                <Stat>
                  <StatNumber fontSize="xl" color={headingColor}>{userStats.countriesVisited}</StatNumber>
                  <StatLabel color={textColor} fontSize="sm">Countries</StatLabel>
                  <StatHelpText fontSize="xs" lineHeight="1.2">
                    {((userStats.countriesVisited / 195) * 100).toFixed(1)}% of world
                  </StatHelpText>
                </Stat>
              </Box>

              <Box
                bg={bgColor}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                p={4}
                textAlign="center"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                <Icon as={FaFire} w={5} h={5} color="orange.400" mb={2} />
                <Stat>
                  <StatNumber fontSize="xl" color={headingColor}>{userStats.travelScore}</StatNumber>
                  <StatLabel color={textColor} fontSize="sm">Travel Score</StatLabel>
                </Stat>
              </Box>

              <Box
                bg={bgColor}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                p={4}
                textAlign="center"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                <Icon as={FaCalendarAlt} w={5} h={5} color="purple.400" mb={2} />
                <Stat>
                  <StatNumber fontSize="xl" color={headingColor}>{userStats.joinDate}</StatNumber>
                  <StatLabel color={textColor} fontSize="sm">Member Since</StatLabel>
                </Stat>
              </Box>
            </SimpleGrid>
          </MotionBox>

          {/* Travel Badges */}
          {getTravelBadges().length > 0 && (
            <MotionBox variants={itemVariants} mb={6}>
              <Heading as="h3" size="md" mb={4} color={headingColor}>
                <Icon as={FaMedal} mr={2} color="yellow.400" />
                Achievements
              </Heading>
              <Box
                p={4}
                borderRadius="lg"
                bg={bgColor}
                border="1px solid"
                borderColor={borderColor}
              >
                <SimpleGrid columns={3} spacing={3}>
                  {getTravelBadges().map((badge, index) => (
                    <MotionBox
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.2 }}
                      bg={`${badge.color}.100`}
                      color={`${badge.color}.800`}
                      p={3}
                      borderRadius="md"
                      textAlign="center"
                      border="1px solid"
                      borderColor={`${badge.color}.200`}
                      _hover={{ transform: "scale(1.02)" }}
                    >
                      <Icon as={badge.icon} w={5} h={5} mb={2} />
                      <Text fontWeight="bold" fontSize="sm">{badge.name}</Text>
                    </MotionBox>
                  ))}
                </SimpleGrid>
              </Box>
            </MotionBox>
          )}

          {/* Countries Section */}
          <MotionBox variants={itemVariants} mb={6}>
            <Heading as="h3" size="md" mb={4} color={headingColor}>
              <Icon as={FaFlag} mr={2} color="blue.400" />
              Countries Explored
            </Heading>
            <Box
              p={4}
              borderRadius="lg"
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
            >
              {countryNamesList.length > 0 ? (
                <>
                  <Progress
                    value={(countryNamesList.length / 195) * 100}
                    colorScheme="blue"
                    size="md"
                    borderRadius="full"
                    mb={4}
                  />
                  <Text textAlign="center" color={textColor} mb={4} fontSize="sm">
                    {countryNamesList.length} / 195 countries ({((countryNamesList.length / 195) * 100).toFixed(1)}%)
                  </Text>
                  <SimpleGrid columns={countryGridColumns} spacing={3}>
                    {countryNamesList.slice(0, 12).map((country, index) => (
                      <MotionBox
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        bg="linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
                        color={headingColor}
                        p={3}
                        borderRadius="md"
                        textAlign="center"
                        border="1px solid"
                        borderColor="rgba(59, 130, 246, 0.2)"
                        _hover={{ 
                          bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                          transform: 'scale(1.02)'
                        }}
                        cursor="pointer"
                        fontSize="sm"
                      >
                        <Text fontWeight="bold" noOfLines={1}>{country.name}</Text>
                        <Text opacity={0.7} fontSize="xs">{country.code}</Text>
                      </MotionBox>
                    ))}
                    {countryNamesList.length > 12 && (
                      <Box
                        bg="gray.100"
                        color="gray.600"
                        p={3}
                        borderRadius="md"
                        textAlign="center"
                        fontSize="sm"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        +{countryNamesList.length - 12} more
                      </Box>
                    )}
                  </SimpleGrid>
                </>
              ) : (
                <VStack spacing={3} py={6} textAlign="center">
                  <Icon as={FaRoute} w={10} h={10} color="gray.400" />
                  <Text color={textColor} fontSize="md">
                    Start uploading photos to see your countries! ✈️
                  </Text>
                </VStack>
              )}
            </Box>
          </MotionBox>

          {/* Action Buttons */}
          <Flex justify="center" gap={4}>
            <Button
              colorScheme="blue"
              size="md"
              onClick={onClose}
              leftIcon={<FaCompass />}
              _hover={{ transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              Continue Exploring
            </Button>
          </Flex>
        </MotionBox>
      </VStack>
    </BaseModal>
  );
};

export default UserProfileModal;
