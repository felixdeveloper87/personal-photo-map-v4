import { useState, useCallback, useMemo } from 'react';
import { Box, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import Flag from 'react-world-flags';
import { FaGlobe } from 'react-icons/fa';
import { getCachedFlag, normalizeCountryCode } from '../../../utils/flagNormalizer';

const EnhancedFlag = ({ countryCode, isHero = false }) => {
  const [flagError, setFlagError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Color mode values - hooks devem estar no topo
  const fallbackBg = useColorModeValue('gray.100', 'gray.700');
  const fallbackBorder = useColorModeValue('gray.300', 'gray.600');
  const fallbackText = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.200', 'gray.600');
  const hoverBorder = useColorModeValue('gray.400', 'gray.500');

  // Cores memoizadas para evitar recálculos
  const colors = useMemo(() => ({
    fallbackBg,
    fallbackBorder,
    fallbackText,
    hoverBg,
    hoverBorder
  }), [fallbackBg, fallbackBorder, fallbackText, hoverBg, hoverBorder]);

  // Usa o utilitário de normalização - memoizado
  const correctedCode = useMemo(() => normalizeCountryCode(countryCode), [countryCode]);

  // Sistema de fallback inteligente usando o utilitário - memoizado com useCallback
  const handleFlagError = useCallback(async () => {
    if (flagError) return; // Evita múltiplas chamadas
    
    setFlagError(true);
    setIsLoading(true);
    
    try {
      const altFlag = await getCachedFlag(countryCode, {
        preferFormat: 'png',
        maxRetries: 2, // Reduzido de 3 para 2
        timeout: 3000  // Reduzido de 5000 para 3000
      });
      
      if (altFlag) {
        setFallbackImage(altFlag);
        setFlagError(false);
      }
    } catch (error) {
      console.debug('Flag fallback failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [countryCode, flagError]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Estilos comuns memoizados
  const commonStyles = useMemo(() => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s ease' // Reduzido de 0.3s para 0.2s
  }), []);

  const imageStyles = useMemo(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    borderRadius: '20px',
    transition: 'opacity 0.2s ease' // Reduzido de 0.3s para 0.2s
  }), []);

  // Fallback com imagem alternativa
  if (fallbackImage) {
    return (
      <Box {...commonStyles} opacity={0.8}>
        <img
          src={fallbackImage}
          alt={`Flag of ${countryCode}`}
          onError={() => setFallbackImage(null)}
          onLoad={handleImageLoad}
          style={imageStyles}
        />
        {isLoading && (
          <Box
            position="absolute"
            inset="0"
            bg="rgba(0, 0, 0, 0.6)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={10}
            borderRadius="20px"
            animation="pulse 1s ease-in-out infinite" // Reduzido de 1.5s para 1s
          >
            <Icon as={FaGlobe} boxSize={8} color="white" />
          </Box>
        )}
      </Box>
    );
  }

  // Fallback UI quando não há bandeira
  if (flagError) {
    return (
      <Box
        bg={colors.fallbackBg}
        border="2px dashed"
        borderColor={colors.fallbackBorder}
        borderRadius="20px"
        transition="all 0.2s ease" // Reduzido de 0.3s para 0.2s
        opacity={0.7}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        width="100%"
        height="100%"
        _hover={{
          bg: colors.hoverBg,
          borderColor: colors.hoverBorder,
          opacity: 0.9
        }}
      >
        <Icon as={FaGlobe} boxSize={16} color={colors.fallbackText} mb={3} />
        <Text fontSize="lg" color={colors.fallbackText} textAlign="center" fontWeight="semibold">
          {countryCode}
        </Text>
        <Text fontSize="sm" color={colors.fallbackText} textAlign="center">
          Flag not available
        </Text>
      </Box>
    );
  }

  // Bandeira SVG normal
  return (
    <Box {...commonStyles} opacity={0.9}>
      <Flag
        code={correctedCode}
        onError={handleFlagError}
        onLoad={handleImageLoad}
        style={imageStyles}
      />
      {isLoading && (
        <Box
          position="absolute"
          inset="0"
          bg="rgba(0, 0, 0, 0.6)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={10}
          borderRadius="20px"
          animation="pulse 1s ease-in-out infinite" // Reduzido de 1.5s para 1s
        >
          <Icon as={FaGlobe} boxSize={8} color="white" />
        </Box>
      )}
    </Box>
  );
};

export default EnhancedFlag;
