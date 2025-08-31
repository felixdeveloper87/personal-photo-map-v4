import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Divider,
  Badge,
  VStack,
  HStack,
  Collapse,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import {
  FaDollarSign,
  FaChartLine,
  FaBalanceScale,
  FaHandHoldingUsd,
  FaPercent,
  FaUsers,
  FaHeartbeat,
  FaWifi,
  FaCity,
  FaBook,
  FaPrayingHands,
  FaSun,
  FaThermometerHalf,
  FaBolt,
  FaHospital,
  FaBaby,
  FaGraduationCap,
  FaLeaf,
  FaGlobe,
  FaMapMarkedAlt,
  FaClock,
  FaCar,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import InfoBox from './InfoBox';

const IndicatorsModal = ({ 
  indicatorsData, 
  weatherData, 
  exchangeRate, 
  countryInfo, 
  factbookData 
}) => {
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const dividerColor = useColorModeValue('gray.200', 'gray.600');
  const buttonBg = useColorModeValue('gray.50', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.100', 'gray.600');

  // Controles de colapso para cada categoria
  const economicDisclosure = useDisclosure({ defaultIsOpen: true });
  const demographicsDisclosure = useDisclosure({ defaultIsOpen: true });
  const infrastructureDisclosure = useDisclosure({ defaultIsOpen: true });
  const weatherDisclosure = useDisclosure({ defaultIsOpen: true });
  const cultureDisclosure = useDisclosure({ defaultIsOpen: true });



  // Função para formatar coordenadas
  const formatCoordinates = (coord) => {
    if (!coord?.lat || !coord?.lon) return undefined;
    return `${coord.lat.toFixed(2)}, ${coord.lon.toFixed(2)}`;
  };

  // Função para formatar área
  const formatArea = (area) => {
    if (!area) return undefined;
    if (area >= 1000000) {
      return `${(area / 1000000).toFixed(1)}M km²`;
    }
    if (area >= 1000) {
      return `${(area / 1000).toFixed(1)}K km²`;
    }
    return `${area} km²`;
  };

  // Componente de cabeçalho colapsável reutilizável
  const CollapsibleHeader = ({ 
    icon, 
    title, 
    badgeText, 
    colorScheme, 
    disclosure, 
    isExpanded 
  }) => (
    <Button
      onClick={disclosure.onToggle}
      variant="ghost"
      w="full"
      h="auto"
      p={4}
      bg={buttonBg}
      _hover={{ bg: buttonHoverBg }}
      _active={{ bg: buttonHoverBg }}
      borderRadius="lg"
      border="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      transition="all 0.2s"
      mb={2}
    >
      <Flex w="full" align="center" justify="space-between">
        <Flex align="center" gap={3}>
          <Icon as={icon} color={`${colorScheme}.500`} boxSize={5} />
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            {title}
          </Text>
          <Badge colorScheme={colorScheme} variant="subtle" borderRadius="full">
            {badgeText}
          </Badge>
        </Flex>
        <Icon 
          as={isExpanded ? FaChevronUp : FaChevronDown} 
          color={`${colorScheme}.500`} 
          boxSize={4}
          transition="transform 0.2s"
          transform={isExpanded ? "rotate(0deg)" : "rotate(0deg)"}
        />
      </Flex>
    </Button>
  );

  return (
    <Box>
      {/* Categoria: Economia */}
      <Box mb={6}>
        <CollapsibleHeader
          icon={FaDollarSign}
          title="Economic Indicators"
          badgeText="8 indicators"
          colorScheme="green"
          disclosure={economicDisclosure}
          isExpanded={economicDisclosure.isOpen}
        />
        
        <Collapse in={economicDisclosure.isOpen} animateOpacity>
          <Box
            p={4}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="lg"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
              <InfoBox 
                icon={FaChartLine} 
                label="GDP Growth" 
                value={indicatorsData?.gdpGrowth ? `${indicatorsData.gdpGrowth.value}%` : undefined} 
                colorScheme="green" 
              />
              <InfoBox 
                icon={FaBalanceScale} 
                label="Public Debt" 
                value={indicatorsData?.debtToGDP ? `${indicatorsData.debtToGDP.value}%` : undefined} 
                colorScheme="red" 
              />
              <InfoBox 
                icon={FaHandHoldingUsd} 
                label="GDP Per Capita" 
                value={indicatorsData?.gdpPerCapitaCurrent ? `$${indicatorsData.gdpPerCapitaCurrent.value}` : undefined} 
                colorScheme="purple" 
              />
              <InfoBox 
                icon={FaDollarSign} 
                label="Exchange Rate" 
                value={exchangeRate ? `1 GBP = ${exchangeRate} ${countryInfo?.currencies?.[0] || 'USD'}` : undefined} 
                colorScheme="yellow" 
              />
              <InfoBox 
                icon={FaPercent} 
                label="Inflation Rate" 
                value={indicatorsData?.inflationCPI ? `${indicatorsData.inflationCPI.value}%` : undefined} 
                colorScheme="orange" 
              />
              {indicatorsData?.gdp && (
                <InfoBox 
                  icon={FaChartLine} 
                  label="Total GDP" 
                  value={indicatorsData.gdp.value} 
                  colorScheme="teal" 
                />
              )}
              {indicatorsData?.gniPerCapita && (
                <InfoBox 
                  icon={FaHandHoldingUsd} 
                  label="GNI Per Capita" 
                  value={indicatorsData.gniPerCapita.value} 
                  colorScheme="cyan" 
                />
              )}
              {indicatorsData?.unemployment && (
                <InfoBox 
                  icon={FaUsers} 
                  label="Unemployment" 
                  value={indicatorsData.unemployment.value} 
                  colorScheme="red" 
                />
              )}
            </SimpleGrid>
          </Box>
        </Collapse>
      </Box>

      <Divider mb={6} borderColor={dividerColor} />

      {/* Categoria: Demografia */}
      <Box mb={6}>
        <CollapsibleHeader
          icon={FaUsers}
          title="Demographics & Society"
          badgeText="6 indicators"
          colorScheme="blue"
          disclosure={demographicsDisclosure}
          isExpanded={demographicsDisclosure.isOpen}
        />
        
        <Collapse in={demographicsDisclosure.isOpen} animateOpacity>
          <Box
            p={4}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="lg"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
              <InfoBox 
                icon={FaHeartbeat} 
                label="Life Expectancy" 
                value={indicatorsData?.lifeExpectancy ? indicatorsData.lifeExpectancy.value : undefined} 
                colorScheme="pink" 
              />
              <InfoBox 
                icon={FaWifi} 
                label="Internet Users" 
                value={indicatorsData?.internetUsers ? `${indicatorsData.internetUsers.value}%` : undefined} 
                colorScheme="blue" 
              />
              <InfoBox 
                icon={FaCity} 
                label="Urban Population" 
                value={indicatorsData?.urbanPopulation ? `${indicatorsData.urbanPopulation.value}%` : undefined} 
                colorScheme="green" 
              />
              <InfoBox 
                icon={FaBook} 
                label="Literacy Rate" 
                value={indicatorsData?.education ? `${indicatorsData.education.value}%` : undefined} 
                colorScheme="indigo" 
              />
              <InfoBox 
                icon={FaUsers} 
                label="Net Migration" 
                value={indicatorsData?.netMigration ? indicatorsData.netMigration.value : undefined} 
                colorScheme="cyan" 
              />
              {indicatorsData?.fertilityRate && (
                <InfoBox 
                  icon={FaBaby} 
                  label="Fertility Rate" 
                  value={indicatorsData.fertilityRate.value} 
                  colorScheme="purple" 
                />
              )}
            </SimpleGrid>
          </Box>
        </Collapse>
      </Box>

      <Divider mb={6} borderColor={dividerColor} />

      {/* Categoria: Infraestrutura e Tecnologia */}
      <Box mb={6}>
        <CollapsibleHeader
          icon={FaBolt}
          title="Infrastructure & Technology"
          badgeText="3 indicators"
          colorScheme="teal"
          disclosure={infrastructureDisclosure}
          isExpanded={infrastructureDisclosure.isOpen}
        />
        
        <Collapse in={infrastructureDisclosure.isOpen} animateOpacity>
          <Box
            p={4}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="lg"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
              {indicatorsData?.accessToEletricity && (
                <InfoBox 
                  icon={FaBolt} 
                  label="Electricity Access" 
                  value={indicatorsData.accessToEletricity.value} 
                  colorScheme="yellow" 
                />
              )}
              {indicatorsData?.healthExpenses && (
                <InfoBox 
                  icon={FaHospital} 
                  label="Health Expenses" 
                  value={indicatorsData.healthExpenses.value} 
                  colorScheme="red" 
                />
              )}
              <InfoBox 
                icon={FaWifi} 
                label="Internet Users" 
                value={indicatorsData?.internetUsers ? `${indicatorsData.internetUsers.value}%` : undefined} 
                colorScheme="blue" 
              />
            </SimpleGrid>
          </Box>
        </Collapse>
      </Box>

      <Divider mb={6} borderColor={dividerColor} />

      {/* Categoria: Clima e Ambiente */}
      <Box mb={6}>
        <CollapsibleHeader
          icon={FaSun}
          title="Weather & Environment"
          badgeText="3 indicators"
          colorScheme="orange"
          disclosure={weatherDisclosure}
          isExpanded={weatherDisclosure.isOpen}
        />
        
        <Collapse in={weatherDisclosure.isOpen} animateOpacity>
          <Box
            p={4}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="lg"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
              <InfoBox 
                icon={FaSun} 
                label="Weather" 
                value={weatherData?.description ? weatherData.description : undefined} 
                colorScheme="yellow" 
              />
              <InfoBox 
                icon={FaThermometerHalf} 
                label="Temperature" 
                value={weatherData?.temperature ? `${weatherData.temperature}°C` : undefined} 
                colorScheme="red" 
              />
              {weatherData?.coord && (
                <InfoBox 
                  icon={FaMapMarkedAlt} 
                  label="Coordinates" 
                  value={formatCoordinates(weatherData.coord)} 
                  colorScheme="green" 
                />
              )}
            </SimpleGrid>
          </Box>
        </Collapse>
      </Box>

      <Divider mb={6} borderColor={dividerColor} />

      {/* Categoria: Cultura e Religião */}
      <Box mb={6}>
        <CollapsibleHeader
          icon={FaBook}
          title="Culture & Religion"
          badgeText="4 indicators"
          colorScheme="purple"
          disclosure={cultureDisclosure}
          isExpanded={cultureDisclosure.isOpen}
        />
        
        <Collapse in={cultureDisclosure.isOpen} animateOpacity>
          <Box
            p={4}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="lg"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
              {factbookData?.religion && factbookData.religion !== 'N/A' && (
                <InfoBox 
                  icon={FaPrayingHands} 
                  label="Main Religion" 
                  value={factbookData.religion} 
                  colorScheme="purple" 
                />
              )}
              {factbookData?.culture && factbookData.culture !== 'N/A' && (
                <InfoBox 
                  icon={FaBook} 
                  label="Cultural Heritage" 
                  value={factbookData.culture} 
                  colorScheme="orange" 
                />
              )}
              <InfoBox 
                icon={FaBook} 
                label="Language" 
                value={countryInfo?.officialLanguage} 
                colorScheme="blue" 
              />
              <InfoBox 
                icon={FaCity} 
                label="Capital" 
                value={countryInfo?.capital} 
                colorScheme="teal" 
              />
            </SimpleGrid>
          </Box>
        </Collapse>
      </Box>

      {/* Footer com informações adicionais */}
      <Box mt={8} p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
        <VStack spacing={2} align="center">
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')} textAlign="center">
            Data sources: World Bank, OpenWeatherMap, RestCountries, Wikipedia, Exchange Rate API
          </Text>
          <HStack spacing={4} fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
            <Text>Last updated: {new Date().toLocaleDateString()}</Text>
            <Text>•</Text>
            <Text>Total indicators: 25+</Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default IndicatorsModal;
