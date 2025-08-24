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
} from 'react-icons/fa';
import BaseModal from './BaseModal';

// Configuring the ISO country library to use English as the default locale
countries.registerLocale(en);

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const UserStatisticsModal = ({ isOpen, onClose }) => {
  const { isLoggedIn, fullname, email, isPremium } = useContext(AuthContext);
  const { countriesWithPhotos, photoCount, countryCount } = useContext(CountriesContext);
  const [userStats, setUserStats] = useState({
    totalPhotos: 0,
    countriesVisited: 0,
    joinDate: new Date().getFullYear(),
    favoriteContinent: 'Unknown',
    travelScore: 0
  });
  
  // Theme colors
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)");
  const cardBorder = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.1)");
  const textColor = useColorModeValue("gray.700", "gray.100");
  const headingColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("blue.500", "blue.300");

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
      title="Travel Statistics"
      icon={FaTrophy}
      size="6xl"
      maxHeight="90vh"
    >
      <Box>
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <MotionBox variants={itemVariants} mb={6}>
            <Flex
              align="center"
              justify="center"
              bg={cardBg}
              backdropFilter="blur(20px)"
              borderRadius="xl"
              border="1px solid"
              borderColor={cardBorder}
              p={4}
              boxShadow="0 5px 15px rgba(0, 0, 0, 0.1)"
            >
              <HStack spacing={4} w="full" justify="center">
                <Box position="relative">
                  <Avatar
                    size="lg"
                    name={fullname}
                    bg={isPremium ? "linear-gradient(135deg, #fbbf24, #f59e0b)" : accentColor}
                    color="white"
                    ring="3px"
                    ringColor={isPremium ? "yellow.400" : accentColor}
                    filter="drop-shadow(0 3px 10px rgba(0,0,0,0.2))"
                  />
                  {isPremium && (
                    <Circle
                      size="24px"
                      bg="linear-gradient(135deg, #fbbf24, #f59e0b)"
                      position="absolute"
                      bottom="-2px"
                      right="-2px"
                      border="2px solid white"
                    >
                      <Icon as={FaTrophy} color="white" w={3} h={3} />
                    </Circle>
                  )}
                </Box>
                
                <VStack spacing={1} align="start">
                  <Heading as="h2" size="md" color={headingColor}>
                    {fullname}
                  </Heading>
                  <HStack spacing={2}>
                    <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="xs">
                      <Icon as={FaMapMarkerAlt} mr={1} w={3} h={3} />
                      {userStats.favoriteContinent}
                    </Badge>
                    {isPremium && (
                      <Badge colorScheme="yellow" px={2} py={1} borderRadius="full" fontSize="xs">
                        <Icon as={FaStar} mr={1} w={3} h={3} />
                        Premium
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </Flex>
          </MotionBox>

          {/* Statistics Cards */}
          <MotionBox variants={itemVariants} mb={6}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
              <MotionBox
                bg={cardBg}
                backdropFilter="blur(20px)"
                borderRadius="lg"
                border="1px solid"
                borderColor={cardBorder}
                p={3}
                textAlign="center"
                boxShadow="0 3px 10px rgba(0, 0, 0, 0.08)"
                whileHover={{ transform: "translateY(-1px)", transition: { duration: 0.2 } }}
              >
                <Icon as={FaCamera} w={5} h={5} color="blue.400" mb={1} />
                <Stat>
                  <StatNumber fontSize="lg" color={headingColor}>{userStats.totalPhotos}</StatNumber>
                  <StatLabel color={textColor} fontSize="xs">Photos</StatLabel>
                </Stat>
              </MotionBox>

              <MotionBox
                bg={cardBg}
                backdropFilter="blur(20px)"
                borderRadius="lg"
                border="1px solid"
                borderColor={cardBorder}
                p={3}
                textAlign="center"
                boxShadow="0 3px 10px rgba(0, 0, 0, 0.08)"
                whileHover={{ transform: "translateY(-1px)", transition: { duration: 0.2 } }}
              >
                <Icon as={FaGlobe} w={5} h={5} color="green.400" mb={1} />
                <Stat>
                  <StatNumber fontSize="lg" color={headingColor}>{userStats.countriesVisited}</StatNumber>
                  <StatLabel color={textColor} fontSize="xs">Countries</StatLabel>
                  <StatHelpText fontSize="2xs" lineHeight="1.2">
                    {((userStats.countriesVisited / 195) * 100).toFixed(1)}%
                  </StatHelpText>
                </Stat>
              </MotionBox>

              <MotionBox
                bg={cardBg}
                backdropFilter="blur(20px)"
                borderRadius="lg"
                border="1px solid"
                borderColor={cardBorder}
                p={3}
                textAlign="center"
                boxShadow="0 3px 10px rgba(0, 0, 0, 0.08)"
                whileHover={{ transform: "translateY(-1px)", transition: { duration: 0.2 } }}
              >
                <Icon as={FaFire} w={5} h={5} color="orange.400" mb={1} />
                <Stat>
                  <StatNumber fontSize="lg" color={headingColor}>{userStats.travelScore}</StatNumber>
                  <StatLabel color={textColor} fontSize="xs">Score</StatLabel>
                </Stat>
              </MotionBox>

              <MotionBox
                bg={cardBg}
                backdropFilter="blur(20px)"
                borderRadius="lg"
                border="1px solid"
                borderColor={cardBorder}
                p={3}
                textAlign="center"
                boxShadow="0 3px 10px rgba(0, 0, 0, 0.08)"
                whileHover={{ transform: "translateY(-1px)", transition: { duration: 0.2 } }}
              >
                <Icon as={FaCalendarAlt} w={5} h={5} color="purple.400" mb={1} />
                <Stat>
                  <StatNumber fontSize="lg" color={headingColor}>{userStats.joinDate}</StatNumber>
                  <StatLabel color={textColor} fontSize="xs">Since</StatLabel>
                </Stat>
              </MotionBox>
            </SimpleGrid>
          </MotionBox>

          {/* Travel Badges */}
          {getTravelBadges().length > 0 && (
            <MotionBox variants={itemVariants} mb={8}>
              <Box
                bg={cardBg}
                backdropFilter="blur(20px)"
                borderRadius="xl"
                border="1px solid"
                borderColor={cardBorder}
                p={6}
                boxShadow="0 5px 15px rgba(0, 0, 0, 0.1)"
              >
                <Heading as="h3" size="md" mb={4} textAlign="center" color={headingColor}>
                  <Icon as={FaMedal} mr={2} color="yellow.400" />
                  Achievements
                </Heading>
                <Grid templateColumns="repeat(auto-fit, minmax(140px, 1fr))" gap={3}>
                  {getTravelBadges().map((badge, index) => (
                    <MotionBox
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.2 }}
                      bg={`${badge.color}.100`}
                      color={`${badge.color}.800`}
                      p={3}
                      borderRadius="lg"
                      textAlign="center"
                      border="1px solid"
                      borderColor={`${badge.color}.200`}
                      _hover={{ transform: "scale(1.02)" }}
                    >
                      <Icon as={badge.icon} w={5} h={5} mb={1} />
                      <Text fontWeight="bold" fontSize="sm">{badge.name}</Text>
                    </MotionBox>
                  ))}
                </Grid>
              </Box>
            </MotionBox>
          )}

          {/* Countries Section */}
          <MotionBox variants={itemVariants} mb={6}>
            <Box
              bg={cardBg}
              backdropFilter="blur(20px)"
              borderRadius="xl"
              border="1px solid"
              borderColor={cardBorder}
              p={6}
              boxShadow="0 5px 15px rgba(0, 0, 0, 0.1)"
            >
              <Heading as="h3" size="md" mb={4} textAlign="center" color={headingColor}>
                <Icon as={FaFlag} mr={2} color="blue.400" />
                Countries Explored
              </Heading>

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
                  <Grid templateColumns="repeat(auto-fit, minmax(140px, 1fr))" gap={2}>
                    {countryNamesList.slice(0, 12).map((country, index) => (
                      <MotionBox
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        bg="linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
                        color={headingColor}
                        p={2}
                        borderRadius="md"
                        textAlign="center"
                        border="1px solid"
                        borderColor="rgba(59, 130, 246, 0.2)"
                        _hover={{ 
                          bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                          transform: 'scale(1.02)'
                        }}
                        cursor="pointer"
                        fontSize="xs"
                      >
                        <Text fontWeight="bold">{country.name}</Text>
                        <Text opacity={0.7}>{country.code}</Text>
                      </MotionBox>
                    ))}
                    {countryNamesList.length > 12 && (
                      <Box
                        bg="gray.100"
                        color="gray.600"
                        p={2}
                        borderRadius="md"
                        textAlign="center"
                        fontSize="xs"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        +{countryNamesList.length - 12} more
                      </Box>
                    )}
                  </Grid>
                </>
              ) : (
                <VStack spacing={3} py={6} textAlign="center">
                  <Icon as={FaRoute} w={12} h={12} color="gray.400" />
                  <Text color={textColor}>
                    Start uploading photos to see your countries! ✈️
                  </Text>
                </VStack>
              )}
            </Box>
          </MotionBox>

          {/* Close Button */}
          <Flex justify="center">
            <Button
              colorScheme="blue"
              size="lg"
              onClick={onClose}
              leftIcon={<FaCompass />}
              _hover={{ transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              Continue Exploring
            </Button>
          </Flex>
        </MotionBox>
      </Box>
    </BaseModal>
  );
};

export default UserStatisticsModal;
