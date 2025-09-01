import React, { memo, useMemo, useId, useCallback } from 'react';
import {
  Box,
  Text,
  Button,
  Icon,
  useDisclosure,
  useColorModeValue,
  useBreakpointValue,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import { FaRocket } from 'react-icons/fa';
import { motion } from 'framer-motion';
import EnhancedImageUploaderModal from '../../modals/EnhancedImageUploaderModal';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const JourneyStarterSection = ({ countryId, onUploadSuccess }) => {
  const {
    isOpen: isImageUploaderOpen,
    onOpen: onImageUploaderOpen,
    onClose: onImageUploaderClose,
  } = useDisclosure();

  // A11y ids
  const titleId = useId();
  const descId = useId();

  // Respects users who prefer reduced motion
  const prefersReducedMotion = usePrefersReducedMotion();

  // Theme-aware tokens (computed once per render)
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.100, teal.100, yellow.300)',
    'linear(to-br, blue.700, teal.800, gray.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const accentColor = useColorModeValue('teal.600', 'teal.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const titleGradient = useColorModeValue(
    'linear(to-r, blue.600, purple.600, pink.600, orange.500)',
    'linear(to-r, blue.300, purple.300, pink.300, orange.300)'
  );

  const subtitleGradient = useColorModeValue(
    'linear(to-r, purple.600, pink.600, orange.500)',
    'linear(to-r, purple.300, pink.300, orange.300)'
  );

  const buttonBorderGradient = useColorModeValue(
    'linear(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #3B82F6)',
    'linear(135deg, #60A5FA, #A78BFA, #F472B6, #FBBF24, #60A5FA)'
  );

  // Responsivo
  const containerPy = useBreakpointValue({ base: 10, md: 16 });
  const containerPx = useBreakpointValue({ base: 6, md: 10 });
  const titleSize = useBreakpointValue({ base: '4xl', md: '5xl', lg: '6xl' });
  const subtitleSize = useBreakpointValue({ base: 'xl', md: '2xl', lg: '3xl' });
  const ctaSize = useBreakpointValue({ base: 'md', md: 'lg' });

  // Variants centralizados
  const floatVariant = useMemo(
    () => ({
      animate: prefersReducedMotion
        ? {}
        : {
            y: [0, -10, 0],
            transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          },
    }),
    [prefersReducedMotion]
  );

  const shimmerHover = useMemo(
    () =>
      prefersReducedMotion
        ? {}
        : {
            '&:hover::after': { left: '100%' },
          },
    [prefersReducedMotion]
  );

  // A11y: abrir via teclado também
  const handleKeyOpen = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onImageUploaderOpen();
      }
    },
    [onImageUploaderOpen]
  );

  return (
    <>
      <Box
        role="region"
        aria-labelledby={titleId}
        aria-describedby={descId}
        textAlign="center"
        py={containerPy}
        px={containerPx}
        bgGradient={bgGradient}
        borderRadius="3xl"
        position="relative"
        overflow="hidden"
        mb={8}
        boxShadow={useColorModeValue(
          '0 25px 50px rgba(59,130,246,0.15), 0 12px 24px rgba(147,51,234,0.10)',
          '0 25px 50px rgba(59,130,246,0.30), 0 12px 24px rgba(147,51,234,0.20)'
        )}
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          background: useColorModeValue(
            'linear-gradient(45deg, rgba(59,130,246,.08), rgba(147,51,234,.08), rgba(236,72,153,.08))',
            'linear-gradient(45deg, rgba(59,130,246,.18), rgba(147,51,234,.18), rgba(236,72,153,.18))'
          ),
          borderRadius: 'inherit',
          zIndex: 0,
        }}
      >
        {/* Subtle floating accents (decorative) */}
        {!prefersReducedMotion && (
          <>
            <MotionBox
              aria-hidden="true"
              position="absolute"
              top={{ base: '6%', md: '8%' }}
              right={{ base: '8%', md: '12%' }}
              fontSize={{ base: '2xl', md: '4xl', lg: '5xl' }}
              opacity={useColorModeValue(0.25, 0.45)}
              zIndex={1}
              animate={floatVariant.animate}
            >
              🚀
            </MotionBox>
            <MotionBox
              aria-hidden="true"
              position="absolute"
              bottom={{ base: '8%', md: '12%' }}
              left={{ base: '6%', md: '10%' }}
              fontSize={{ base: 'xl', md: '3xl', lg: '4xl' }}
              opacity={useColorModeValue(0.3, 0.5)}
              zIndex={1}
              animate={floatVariant.animate}
              transition={{ delay: 0.6 }}
            >
              ⭐
            </MotionBox>
          </>
        )}

        {/* Main Content */}
        <Box position="relative" zIndex={2} maxW="900px" mx="auto">
          {/* Title */}
          <Box mb={6}>
            <Text
              id={titleId}
              as="h2"
              fontSize={titleSize}
              fontWeight="black"
              bgGradient={titleGradient}
              bgClip="text"
              lineHeight="0.95"
              letterSpacing="tight"
              textShadow={useColorModeValue(
                '0 4px 8px rgba(0,0,0,0.08)',
                '0 4px 8px rgba(0,0,0,0.30)'
              )}
            >
              🌍 Your Global Adventure
            </Text>
            <Text
              fontSize={subtitleSize}
              fontWeight="extrabold"
              bgGradient={subtitleGradient}
              bgClip="text"
              mt={1}
              textShadow={useColorModeValue(
                '0 2px 4px rgba(0,0,0,0.06)',
                '0 2px 4px rgba(0,0,0,0.24)'
              )}
            >
              Begins Right Here!
            </Text>
          </Box>

          {/* Description */}
          <Text
            id={descId}
            fontSize={{ base: 'md', md: 'lg' }}
            color={textColor}
            mb={8}
            lineHeight="1.8"
            fontWeight="medium"
            maxW="720px"
            mx="auto"
          >
            This incredible country is waiting for your unique story!{' '}
            <Text as="span" color={accentColor} fontWeight="semibold">
              Capture breathtaking moments, discover hidden gems, and create memories that will last forever.
            </Text>
          </Text>

          {/* CTA */}
          <Box
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              inset: '-3px',
              background: buttonBorderGradient,
              borderRadius: '2xl',
              zIndex: -1,
            }}
          >
            <MotionButton
              size={ctaSize}
              leftIcon={<Icon as={FaRocket} boxSize={{ base: 4, md: 5 }} aria-hidden="true" />}
              onClick={onImageUploaderOpen}
              onKeyDown={handleKeyOpen}
              px={{ base: 6, md: 8 }}
              py={{ base: 4, md: 6 }}
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="bold"
              borderRadius="2xl"
              bg={cardBg}
              color={accentColor}
              border="2px solid"
              borderColor={borderColor}
              role="button"
              aria-label="Start your journey by uploading your first photo"
              position="relative"
              overflow="hidden"
              _after={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: useColorModeValue(
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                ),
                transition: 'left 0.55s',
                zIndex: 1,
              }}
              sx={shimmerHover}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              🎬 Start Your Journey
            </MotionButton>
          </Box>

          {/* Quote */}
          <Box
            mt={8}
            p={{ base: 5, md: 6 }}
            bg={cardBg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            maxW="680px"
            mx="auto"
            boxShadow={useColorModeValue(
              '0 8px 24px rgba(0,0,0,0.08)',
              '0 8px 24px rgba(0,0,0,0.3)'
            )}
          >
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color={textColor}
              fontStyle="italic"
              textAlign="center"
              fontWeight="medium"
              lineHeight="1.7"
            >
              “Every photo tells a story. Every story begins with a single click.
              <Text as="span" color={accentColor} fontWeight="semibold"> Your adventure is just one upload away!” ✨</Text>
              ”
            </Text>
          </Box>
        </Box>
      </Box>

      <EnhancedImageUploaderModal
        countryId={countryId}
        onUploadSuccess={onUploadSuccess}
        isOpen={isImageUploaderOpen}
        onClose={onImageUploaderClose}
      />
    </>
  );
};

export default memo(JourneyStarterSection);
