import { Box, Flex, Heading, Text, IconButton, useColorModeValue, useDisclosure, Icon, useBreakpointValue } from '@chakra-ui/react';
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
  
  // Responsive values
  const headerPadding = useBreakpointValue({ base: 2, sm: 3, md: 4, lg: 5 });
  const headerBorderRadius = useBreakpointValue({ base: "16px", sm: "18px", md: "20px", lg: "24px" });
  const countryNameSize = useBreakpointValue({ base: "xl", sm: "2xl", md: "3xl", lg: "4xl" });
  const nativeNameSize = useBreakpointValue({ base: "md", sm: "lg", md: "xl", lg: "2xl" });
  const capitalTextSize = useBreakpointValue({ base: "sm", sm: "md", md: "lg", lg: "xl" });
  const flagHeight = useBreakpointValue({ base: "200px", sm: "250px", md: "300px", lg: "350px", xl: "400px" });
  const flagBorderRadius = useBreakpointValue({ base: "12px", sm: "16px", md: "20px", lg: "24px" });
  const infoBoxGap = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });
  const sectionGap = useBreakpointValue({ base: 3, sm: 4, md: 5, lg: 6 });
  const buttonPadding = useBreakpointValue({ base: 2, sm: 3, md: 4, lg: 5 });
  const buttonTextSize = useBreakpointValue({ base: "sm", sm: "md", md: "lg", lg: "xl" });
  const buttonSubTextSize = useBreakpointValue({ base: "xs", sm: "sm", md: "md", lg: "lg" });
  
  return (
    <Box mb={4} position="relative">
      {/* Header: Nome do país, capital e botão de voltar alinhados */}
      <Box
        bg={useColorModeValue('rgba(255,255,255,0.9)', 'rgba(0,0,0,0.8)')}
        p={headerPadding}
        borderRadius={headerBorderRadius}
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        mb={4}
        position="relative"
        border={useColorModeValue('1px solid rgba(0,0,0,0.1)', '1px solid rgba(255,255,255,0.1)')}
        width="100%"
        maxW="1600px"
        mx="auto"
        minW="0"
      >
        {/* Back Button */}
        <IconButton
          aria-label="Go back"
          icon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="outline"
          size={{ base: "xs", sm: "sm", md: "md", lg: "lg" }}
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
        
        {/* Nome do país, nome local e capital centralizados */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={{ base: 1, sm: 2, md: 3, lg: 4 }}
          textAlign="center"
          flex="1"
          px={{ base: 2, sm: 4, md: 6, lg: 8 }}
        >
          <Heading
            as="h1"
            size={countryNameSize}
            color={countryNameColorEnhanced}
            textShadow={countryNameTextShadow}
            fontWeight="bold"
            noOfLines={{ base: 3, sm: 2, md: 2, lg: 1 }}
            wordBreak="break-word"
            whiteSpace="normal"
            maxW="100%"
            lineHeight={{ base: "1.2", sm: "1.3", md: "1.4", lg: "1.5" }}
          >
            {countries.getName(countryId.toUpperCase(), 'en') || countryId.toUpperCase()}
          </Heading>
          
          {countryInfo?.nativeName && countryInfo.nativeName !== countries.getName(countryId.toUpperCase(), 'en') && (
            <Text
              fontSize={nativeNameSize}
              color={nativeNameColor}
              textShadow={countryNameTextShadow}
              fontStyle="italic"
              opacity={0.9}
              fontFamily="serif"
              letterSpacing="wide"
              textAlign="center"
              noOfLines={{ base: 2, sm: 1, md: 1, lg: 1 }}
            >
              {countryInfo.nativeName}
            </Text>
          )}
          
          {countryInfo?.capital && (
            <Text
              fontSize={capitalTextSize}
              color={useColorModeValue('blue.600', 'blue.300')}
              textShadow={countryNameTextShadow}
              fontWeight="semibold"
              opacity={0.9}
              fontFamily="system-ui"
              letterSpacing="wide"
              textAlign="center"
              bg={useColorModeValue('blue.50', 'blue.900')}
              px={{ base: 2, sm: 3, md: 4, lg: 5 }}
              py={{ base: 1, sm: 1, md: 2, lg: 2 }}
              borderRadius="full"
              border="1px solid"
              borderColor={useColorModeValue('blue.200', 'blue.700')}
              noOfLines={1}
            >
              Capital: {countryInfo.capital}
            </Text>
          )}
        </Flex>

        {/* Espaçador invisível para manter o botão de voltar à esquerda */}
        <Box w={{ base: "40px", sm: "50px", md: "60px", lg: "70px" }} />
      </Box>

      {/* Layout principal: esquerda (bandeira 1/3) vs direita (infoboxes 2/3) */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={sectionGap}
        align="flex-start"
        maxW="1600px"
        mx="auto"
        minW="0"
      >
        {/* Lado Esquerdo: Bandeira (1/3 do espaço) */}
        <Box
          width={{ base: "100%", lg: "33.333%" }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          mb={{ base: 4, lg: 0 }}
        >
          <Box
            width="100%"
            height={flagHeight}
            borderRadius={flagBorderRadius}
            overflow="hidden"
            boxShadow={{ 
              base: "0 8px 16px rgba(0, 0, 0, 0.15)", 
              sm: "0 10px 20px rgba(0, 0, 0, 0.2)", 
              md: "0 15px 30px rgba(0, 0, 0, 0.25)", 
              lg: "0 20px 40px rgba(0, 0, 0, 0.3)" 
            }}
            bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
            _dark={{
              bg: "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
            }}
            _hover={{
              transform: { base: "scale(1.002)", sm: "scale(1.005)", md: "scale(1.01)", lg: "scale(1.015)" },
              boxShadow: { 
                base: "0 12px 24px rgba(0, 0, 0, 0.2)", 
                sm: "0 15px 30px rgba(0, 0, 0, 0.25)", 
                md: "0 20px 40px rgba(0, 0, 0, 0.3)", 
                lg: "0 25px 50px rgba(0, 0, 0, 0.4)" 
              }
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <EnhancedFlag countryCode={countryId.toUpperCase()} isHero={false} />
          </Box>
        </Box>
        
        {/* Lado Direito: Infoboxes e botões (2/3 do espaço) */}
        <Box
          flex="2"
          display="flex"
          flexDirection="column"
          gap={infoBoxGap}
          minW="0"
          w={{ base: "100%", lg: "66.667%" }}
        >
          {/* Grid dinâmico de infoboxes - organizados automaticamente */}
          <Box
            display="grid"
            gridTemplateColumns={{
              base: "repeat(2, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)"
            }}
            gap={infoBoxGap}
            w="full"
          >
            {/* Primeira linha: 4 infoboxes principais */}
            <InfoBox icon={FaClock} label="Local Time" value={currentTime} colorScheme="blue" size="large" />
            <InfoBox icon={FaCalendarAlt} label="Local Date" value={weatherData?.timezone ? moment().utcOffset(weatherData.timezone / 60).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY')} colorScheme="teal" size="large" />
            <InfoBox icon={FaThermometerHalf} label="Temperature" value={weatherData?.temperature ? `${weatherData.temperature}°C` : undefined} colorScheme="red" size="large" />
            <InfoBox icon={FaLanguage} label="Language" value={countryInfo?.officialLanguage} colorScheme="orange" size="large" />
            
            {/* Segunda linha: 4 infoboxes */}
            <InfoBox icon={FaUsers} label="Population" value={countryInfo?.population ? formatPopulation(countryInfo.population) : undefined} colorScheme="green" size="large" />
            <InfoBox icon={FaPercent} label="Inflation Rate" value={indicatorsData?.inflationCPI ? `${indicatorsData.inflationCPI.value}%` : undefined} colorScheme="orange" size="large" />
            <InfoBox icon={FaChartLine} label="GDP Growth" value={indicatorsData?.gdpGrowth ? `${indicatorsData.gdpGrowth.value}%` : undefined} colorScheme="green" size="large" />
            <InfoBox icon={FaBook} label="See more" value="More indicators" colorScheme="teal" onClick={onOpen} size="large" />
            
            {/* Terceira linha: 2 infoboxes adicionais */}
            <InfoBox icon={FaSun} label="Weather" value={weatherData?.description ? weatherData.description : undefined} colorScheme="yellow" size="large" />
            <InfoBox icon={FaUsers} label="Net Migration" value={indicatorsData?.netMigration ? `${indicatorsData.netMigration.value}` : undefined} colorScheme="cyan" size="large" />
            
            {/* Quarta linha: Check Flights & Accommodation */}
            <InfoBox 
              icon={FaPlane} 
              label="Check Flights" 
              value={`to ${countries.getName(countryId.toUpperCase(), 'en')}`} 
              colorScheme="blue" 
              size="large"
              onClick={() => window.open(`https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(countries.getName(countryId.toUpperCase(), 'en'))}`, '_blank')}
            />
            <InfoBox 
              icon={FaCity} 
              label="Find Hotels" 
              value={`in ${countries.getName(countryId.toUpperCase(), 'en')}`} 
              colorScheme="green" 
              size="large"
              onClick={() => window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(countries.getName(countryId.toUpperCase(), 'en'))}`, '_blank')}
            />
          </Box>
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