import { Box, Flex, Heading, Text, IconButton, useColorModeValue, useDisclosure, Icon } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import countries from 'i18n-iso-countries';
import moment from 'moment-timezone';
import {
  FaClock,
  FaCity,
  FaThermometerHalf,
  FaSun,
  FaUsers,
  FaLanguage,
  FaCalendarAlt,
  FaDollarSign,
  FaChartLine,
  FaBalanceScale,
  FaHandHoldingUsd,
  FaHeartbeat,
  FaWifi,
  FaBook,
  FaPercent,
  FaPrayingHands,
  FaPlane,
  FaArrowRight
} from 'react-icons/fa';
import EnhancedFlag from './EnhancedFlag';
import InfoBox from './InfoBox';
import BaseModal from '../../modals/BaseModal';

const formatPopulation = (pop) => (typeof pop === 'number' ? pop.toLocaleString('en-US') : 'N/A');

// Function to extract main religion from factbook data
const getMainReligion = (factbookData) => {
  if (!factbookData?.religion) return null;
  
  const religionText = String(factbookData.religion);
  
  // Try to extract the first religion mentioned (usually the largest)
  // Common patterns: "Roman Catholic 50%, Protestant 20%..." -> "Roman Catholic"
  const firstReligion = religionText.split(',')[0]?.split('%')[0]?.trim();
  
  if (firstReligion && firstReligion.length > 0) {
    return firstReligion;
  }
  
  // If no percentage found, return the first part before any special characters
  const cleanReligion = religionText.split(/[,\-–—]/)[0]?.trim();
  return cleanReligion || religionText;
};

const HeroHeader = ({ countryId, countryInfo, weatherData, currentTime, exchangeRate, indicatorsData, factbookData, navigate }) => {
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Text colors for theme-aware country name
  const countryNameColor = useColorModeValue('gray.800', 'white');
  const countryNameTextShadow = useColorModeValue(
    '0 4px 8px rgba(0,0,0,0.1)',
    '0 4px 8px rgba(0,0,0,0.9)'
  );
  
  // Enhanced colors for better contrast
  const countryNameColorEnhanced = useColorModeValue('gray.900', 'gray.100');
  const nativeNameColor = useColorModeValue('gray.600', 'gray.300');

  // Modal control
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Box mb={4} position="relative">
      {/* Header: Nome do país */}
      <Box
        bg={useColorModeValue('rgba(255,255,255,0.9)', 'rgba(0,0,0,0.8)')}
        p={3}
        borderRadius="20px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        mb={4}
        position="relative"
        border={useColorModeValue('1px solid rgba(0,0,0,0.1)', '1px solid rgba(255,255,255,0.1)')}
        width="100%"
        maxW="1600px"
        mx="auto"
        minW="0"
      >
        {/* Back Button */}
        <Box position="absolute" top="50%" left="0.5rem" transform="translateY(-50%)" zIndex={35}>
          <IconButton
            aria-label="Go back"
            icon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            colorScheme="teal"
            bg={useColorModeValue('white', 'gray.700')}
            color={useColorModeValue('teal.500', 'teal.300')}
            borderColor={useColorModeValue('teal.200', 'teal.600')}
            borderRadius="20px"
            boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.15)", "none")}
            _hover={{
              transform: 'scale(1.05)',
              bg: useColorModeValue("teal.50", "teal.900"),
              borderColor: useColorModeValue("teal.300", "teal.400"),
              boxShadow: useColorModeValue("0 6px 20px rgba(0, 0, 0, 0.25)", "none")
            }}
            transition="all 0.2s"
          />
        </Box>
        
        {/* Nome do país, nome local e capital lado a lado */}
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="center"
          gap={3}
          textAlign="center"
          width="100%"
        >
          <Heading
            as="h1"
            size="lg"
            color={countryNameColorEnhanced}
            textShadow={countryNameTextShadow}
            fontWeight="bold"
            noOfLines={2}
            wordBreak="break-word"
            whiteSpace="normal"
            maxW="100%"
          >
            {countries.getName(countryId.toUpperCase(), 'en') || countryId.toUpperCase()}
          </Heading>
          
          {countryInfo?.nativeName && countryInfo.nativeName !== countries.getName(countryId.toUpperCase(), 'en') && (
            <Text
              fontSize="lg"
              color={nativeNameColor}
              textShadow={countryNameTextShadow}
              fontStyle="italic"
              opacity={0.9}
              fontFamily="serif"
              letterSpacing="wide"
              textAlign="center"
            >
              {countryInfo.nativeName}
            </Text>
          )}
          
          {countryInfo?.capital && (
            <Text
              fontSize="md"
              color={useColorModeValue('blue.600', 'blue.300')}
              textShadow={countryNameTextShadow}
              fontWeight="semibold"
              opacity={0.9}
              fontFamily="system-ui"
              letterSpacing="wide"
              textAlign="center"
              bg={useColorModeValue('blue.50', 'blue.900')}
              px={3}
              py={1}
              borderRadius="full"
              border="1px solid"
              borderColor={useColorModeValue('blue.200', 'blue.700')}
            >
              Capital: {countryInfo.capital}
            </Text>
          )}
        </Flex>
      </Box>

      {/* Layout principal: esquerda (bandeira) vs direita (infoboxes) */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={6}
        align="flex-start"
        maxW="1600px"
        mx="auto"
        minW="0"
      >
        {/* Lado Esquerdo: Bandeira */}
        <Box
          width={{ base: "100%", lg: "700px" }}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Box
            width="100%"
            height="380px"
            borderRadius="20px"
            overflow="hidden"
            boxShadow="0 20px 40px rgba(0, 0, 0, 0.3)"
            bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
            _dark={{
              bg: "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
            }}
            _hover={{
              transform: "scale(1.01)",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)"
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <EnhancedFlag countryCode={countryId.toUpperCase()} isHero={false} />
          </Box>
        </Box>
        
        {/* Lado Direito: Infoboxes (2 linhas com 4 cada) */}
        <Box
          flex="2"
          display="flex"
          flexDirection="column"
          gap={3}
          minW="0"
        >
          {/* Primeira linha: 4 infoboxes */}
          <Flex 
            wrap="wrap" 
            justify="flex-start" 
            align="center" 
            gap={3}
            minW="0"
          >
            <InfoBox icon={FaClock} label="Local Time" value={currentTime} colorScheme="blue" size="large" />
            <InfoBox icon={FaCalendarAlt} label="Local Date" value={weatherData?.timezone ? moment().utcOffset(weatherData.timezone / 60).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY')} colorScheme="teal" size="large" />
            <InfoBox icon={FaThermometerHalf} label="Temperature" value={weatherData?.temperature ? `${weatherData.temperature}°C` : undefined} colorScheme="red" size="large" />
            <InfoBox icon={FaLanguage} label="Language" value={countryInfo?.officialLanguage} colorScheme="orange" size="large" />
          </Flex>
          
          {/* Segunda linha: 4 infoboxes */}
          <Flex 
            wrap="wrap" 
            justify="flex-start" 
            align="center" 
            gap={3}
            minW="0"
          >
            <InfoBox icon={FaUsers} label="Population" value={countryInfo?.population ? formatPopulation(countryInfo.population) : undefined} colorScheme="green" size="large" />
            <InfoBox icon={FaPercent} label="Inflation Rate" value={indicatorsData?.inflationCPI ? `${indicatorsData.inflationCPI.value}%` : undefined} colorScheme="orange" size="large" />
            <InfoBox icon={FaChartLine} label="GDP Growth" value={indicatorsData?.gdpGrowth ? `${indicatorsData.gdpGrowth.value}%` : undefined} colorScheme="green" size="large" />
            <InfoBox icon={FaBook} label="See more" value="More indicators" colorScheme="teal" onClick={onOpen} size="large" />
          </Flex>
          
          {/* Check Flights & Accommodation Section */}
          <Flex
            mt={4}
            gap={3}
            direction={{ base: "column", md: "row" }}
          >
            {/* Check Flights */}
            <Box
              flex="1"
              p={4}
              bg={useColorModeValue('blue.50', 'blue.900')}
              borderRadius="16px"
              border="2px solid"
              borderColor={useColorModeValue('blue.200', 'blue.700')}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: useColorModeValue("0 8px 25px rgba(59, 130, 246, 0.15)", "0 8px 25px rgba(59, 130, 246, 0.3)")
              }}
              transition="all 0.3s ease"
              cursor="pointer"
              onClick={() => window.open(`https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(countries.getName(countryId.toUpperCase(), 'en'))}`, '_blank')}
            >
            <Flex align="center" justify="space-between">
              <Flex align="center" gap={3}>
                <Box
                  p={2}
                  borderRadius="full"
                  bg={useColorModeValue('blue.100', 'blue.800')}
                  color={useColorModeValue('blue.600', 'blue.200')}
                >
                  <Icon as={FaPlane} boxSize={5} />
                </Box>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('blue.800', 'blue.100')}>
                    Check Flights
                  </Text>
                  <Text fontSize="sm" color={useColorModeValue('blue.600', 'blue.300')}>
                    Find the best deals to {countries.getName(countryId.toUpperCase(), 'en')}
                  </Text>
                </Box>
              </Flex>
              <Icon 
                as={FaArrowRight} 
                boxSize={4} 
                color={useColorModeValue('blue.500', 'blue.300')}
                _groupHover={{ transform: "translateX(4px)" }}
                transition="transform 0.2s ease"
              />
            </Flex>
          </Box>

                      {/* Find Accommodation */}
            <Box
              flex="1"
              p={4}
              bg={useColorModeValue('green.50', 'green.900')}
              borderRadius="16px"
              border="2px solid"
              borderColor={useColorModeValue('green.200', 'green.700')}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: useColorModeValue("0 8px 25px rgba(34, 197, 94, 0.15)", "0 8px 25px rgba(34, 197, 94, 0.3)")
              }}
              transition="all 0.3s ease"
              cursor="pointer"
              onClick={() => window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(countries.getName(countryId.toUpperCase(), 'en'))}`, '_blank')}
            >
            <Flex align="center" justify="space-between">
              <Flex align="center" gap={3}>
                <Box
                  p={2}
                  borderRadius="full"
                  bg={useColorModeValue('green.100', 'green.800')}
                  color={useColorModeValue('green.600', 'green.200')}
                >
                  <Icon as={FaCity} boxSize={5} />
                </Box>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('green.800', 'green.100')}>
                    Find Accommodation
                  </Text>
                  <Text fontSize="sm" color={useColorModeValue('green.600', 'green.300')}>
                    Discover hotels in {countries.getName(countryId.toUpperCase(), 'en')}
                  </Text>
                </Box>
              </Flex>
              <Icon 
                as={FaArrowRight} 
                boxSize={4} 
                color={useColorModeValue('green.500', 'green.300')}
                _groupHover={{ transform: "translateX(4px)" }}
                transition="transform 0.2s ease"
              />
            </Flex>
          </Box>
            </Flex>
        </Box>
      </Flex>

      {/* Modal com os demais indicadores */}
      <BaseModal isOpen={isOpen} onClose={onClose} title="More Indicators">
        <Flex wrap="wrap" gap={3}>
          <InfoBox icon={FaSun} label="Weather" value={weatherData?.description ? weatherData.description : undefined} colorScheme="yellow" />
          <InfoBox icon={FaCity} label="Capital" value={countryInfo?.capital} colorScheme="purple" />
          <InfoBox icon={FaDollarSign} label="Exchange Rate" value={exchangeRate ? `1 USD = ${exchangeRate} ${countryInfo?.currencies?.[0] || 'USD'}` : undefined} colorScheme="yellow" />
          {indicatorsData?.debtToGDP && (
            <InfoBox icon={FaBalanceScale} label="Public Debt" value={`${indicatorsData.debtToGDP.value}%`} colorScheme="red" />
          )}
          {indicatorsData?.gdpPerCapitaCurrent && (
            <InfoBox icon={FaHandHoldingUsd} label="GDP Per Capita" value={`$${indicatorsData.gdpPerCapitaCurrent.value}`} colorScheme="purple" />
          )}
          {indicatorsData?.lifeExpectancy && (
            <InfoBox icon={FaHeartbeat} label="Life Expectancy" value={indicatorsData.lifeExpectancy.value} colorScheme="pink" />
          )}
          {indicatorsData?.internetUsers && (
            <InfoBox icon={FaWifi} label="Internet Users" value={`${indicatorsData.internetUsers.value}%`} colorScheme="blue" />
          )}
          {indicatorsData?.urbanPopulation && (
            <InfoBox icon={FaCity} label="Urban Population" value={`${indicatorsData.urbanPopulation.value}%`} colorScheme="green" />
          )}
          {indicatorsData?.education && (
            <InfoBox icon={FaBook} label="Literacy Rate" value={`${indicatorsData.education.value}%`} colorScheme="indigo" />
          )}
          {getMainReligion(factbookData) && (
            <InfoBox icon={FaPrayingHands} label="Main Religion" value={getMainReligion(factbookData)} colorScheme="purple" />
          )}
        </Flex>
      </BaseModal>
    </Box>
  );
};

export default HeroHeader;