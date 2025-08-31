import React from 'react';
import { Box, Text, Button, Icon, useDisclosure, useColorModeValue } from '@chakra-ui/react';
import { FaRocket, FaCamera, FaGlobe, FaStar } from 'react-icons/fa';
import EnhancedImageUploaderModal from '../../modals/EnhancedImageUploaderModal';

const JourneyStarterSection = ({ countryId, onUploadSuccess }) => {
  const { isOpen: isImageUploaderOpen, onOpen: onImageUploaderOpen, onClose: onImageUploaderClose } = useDisclosure();

  // Theme-aware colors
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, blue.900, purple.900, pink.900)'
  );
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const headingColor = useColorModeValue('gray.900', 'white');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const titleGradient = useColorModeValue(
    'linear(to-r, blue.600, purple.600, pink.600, orange.500)',
    'linear(to-r, blue.400, purple.400, pink.400, orange.400)'
  );
  
  const subtitleGradient = useColorModeValue(
    'linear(to-r, purple.600, pink.600, orange.500)',
    'linear(to-r, purple.400, pink.400, orange.400)'
  );
  
  const buttonGradient = useColorModeValue(
    'linear(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #3B82F6)',
    'linear(135deg, #60A5FA, #A78BFA, #F472B6, #FBBF24, #60A5FA)'
  );

  return (
    <>
      <Box 
        textAlign="center" 
        py={16} 
        px={10} 
        bgGradient={bgGradient}
        borderRadius="3xl"
        border="3px solid"
        borderColor="transparent"
        backgroundClip="padding-box"
        position="relative"
        overflow="hidden"
        mb={8}
        className="hover-lift"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: useColorModeValue(
            'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))',
            'linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))'
          ),
          borderRadius: 'inherit',
          zIndex: 0
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          right: '-50%',
          bottom: '-50%',
          background: useColorModeValue(
            'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
            'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
          ),
          className: "pulse-bg",
          zIndex: 0
        }}
        boxShadow={useColorModeValue(
          "0 25px 50px rgba(59, 130, 246, 0.15), 0 12px 24px rgba(147, 51, 234, 0.1)",
          "0 25px 50px rgba(59, 130, 246, 0.3), 0 12px 24px rgba(147, 51, 234, 0.2)"
        )}
      >
        {/* Floating Elements */}
        <Box
          position="absolute"
          top="8%"
          right="12%"
          fontSize="5xl"
          opacity={useColorModeValue("0.3", "0.5")}
          className="floating-element"
          zIndex={1}
        >
          🚀
        </Box>
        <Box
          position="absolute"
          bottom="12%"
          left="8%"
          fontSize="4xl"
          opacity={useColorModeValue("0.4", "0.6")}
          className="floating-element-reverse"
          zIndex={1}
        >
          ⭐
        </Box>
        <Box
          position="absolute"
          top="55%"
          right="6%"
          fontSize="3xl"
          opacity={useColorModeValue("0.3", "0.5")}
          className="floating-element"
          zIndex={1}
        >
          🌟
        </Box>
        <Box
          position="absolute"
          top="25%"
          left="15%"
          fontSize="2xl"
          opacity={useColorModeValue("0.25", "0.45")}
          className="floating-element-reverse"
          zIndex={1}
        >
          🎯
        </Box>

        {/* Main Content */}
        <Box position="relative" zIndex={2}>
          {/* Main Title with Enhanced Styling */}
          <Box
            mb={8}
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: '-15px',
              left: '-25px',
              right: '-25px',
              bottom: '-15px',
              background: useColorModeValue(
                'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B)',
                'linear-gradient(135deg, #60A5FA, #A78BFA, #F472B6, #FBBF24)'
              ),
              borderRadius: '2xl',
              opacity: useColorModeValue('0.15', '0.25'),
              filter: 'blur(25px)',
              zIndex: -1
            }}
          >
            <Text 
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }} 
              fontWeight="black" 
              bgGradient={titleGradient}
              bgClip="text"
              mb={3}
              textShadow={useColorModeValue("0 4px 8px rgba(0,0,0,0.1)", "0 4px 8px rgba(0,0,0,0.3)")}
              letterSpacing="tight"
              lineHeight="0.9"
            >
              🌍 Your Global Adventure
            </Text>
            <Text 
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} 
              fontWeight="extrabold" 
              bgGradient={subtitleGradient}
              bgClip="text"
              mb={2}
              textShadow={useColorModeValue("0 2px 4px rgba(0,0,0,0.1)", "0 2px 4px rgba(0,0,0,0.3)")}
            >
              Begins Right Here!
            </Text>
          </Box>

          {/* Enhanced Subtitle */}
          <Text 
            fontSize={{ base: "xl", md: "2xl" }} 
            color={textColor}
            mb={8} 
            lineHeight="1.8"
            fontWeight="medium"
            maxW="700px"
            mx="auto"
            textShadow={useColorModeValue("0 1px 2px rgba(0,0,0,0.05)", "0 1px 2px rgba(0,0,0,0.2)")}
          >
            This incredible country is waiting for your unique story! 🌟
            <br />
            <Text as="span" color={accentColor} fontWeight="semibold">
              Capture breathtaking moments, discover hidden gems, and create memories that will last forever.
            </Text>
          </Text>

          {/* Enhanced Feature Highlights */}
          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            gap={5}
            mb={10}
            maxW="800px"
            mx="auto"
          >
            {[
              { icon: FaCamera, text: "Capture Memories", color: "blue", emoji: "📸" },
              { icon: FaGlobe, text: "Explore World", color: "purple", emoji: "🗺️" },
              { icon: FaStar, text: "Create Legacy", color: "pink", emoji: "💫" },
            ].map((feature, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap={3}
                px={6}
                py={3}
                bg={useColorModeValue(`${feature.color}.100`, `${feature.color}.800`)}
                borderRadius="full"
                border="2px solid"
                borderColor={useColorModeValue(`${feature.color}.200`, `${feature.color}.600`)}
                className="feature-badge"
                minW="160px"
                justifyContent="center"
                _hover={{
                  bg: useColorModeValue(`${feature.color}.200`, `${feature.color}.700`),
                  transform: "translateY(-2px)",
                  boxShadow: useColorModeValue(
                    `0 4px 12px rgba(59, 130, 246, 0.2)`,
                    `0 4px 12px rgba(59, 130, 246, 0.4)`
                  )
                }}
              >
                <Icon as={feature.icon} color={useColorModeValue(`${feature.color}.600`, `${feature.color}.300`)} boxSize={5} />
                <Text fontSize="md" fontWeight="bold" color={useColorModeValue(`${feature.color}.700`, `${feature.color}.200`)}>
                  {feature.text}
                </Text>
                <Text fontSize="lg">{feature.emoji}</Text>
              </Box>
            ))}
          </Box>

          {/* Enhanced Call to Action */}
          <Box
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              right: '-3px',
              bottom: '-3px',
              background: buttonGradient,
              borderRadius: '2xl',
              zIndex: -1,
              className: "gradient-border"
            }}
          >
            <Button
              size="lg"
              colorScheme="teal"
              leftIcon={<Icon as={FaRocket} boxSize={6} />}
              onClick={onImageUploaderOpen}
              px={10}
              py={8}
              fontSize="xl"
              fontWeight="bold"
              borderRadius="2xl"
              bg={cardBg}
              color={accentColor}
              border="3px solid"
              borderColor="transparent"
              className="cta-button"
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
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                ),
                transition: 'left 0.5s',
                zIndex: 1
              }}
              sx={{
                '&:hover::after': {
                  left: '100%'
                }
              }}
            >
              <Text position="relative" zIndex={2}>
                🎬 Start Your Journey
              </Text>
            </Button>
          </Box>

          {/* Enhanced Motivational Quote */}
          <Box
            mt={8}
            p={6}
            bg={cardBg}
            borderRadius="xl"
            border="2px solid"
            borderColor={borderColor}
            maxW="600px"
            mx="auto"
            opacity={useColorModeValue("0.9", "0.95")}
            className="quote-box"
            boxShadow={useColorModeValue("0 8px 25px rgba(0,0,0,0.1)", "0 8px 25px rgba(0,0,0,0.3)")}
          >
            <Text 
              fontSize="lg" 
              color={textColor}
              fontStyle="italic"
              textAlign="center"
              fontWeight="medium"
              lineHeight="1.6"
            >
              "Every photo tells a story. Every story begins with a single click. 
              <br />
              <Text as="span" color={accentColor} fontWeight="semibold">
                Your adventure is just one upload away!" ✨
              </Text>
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Enhanced Image Uploader Modal */}
      <EnhancedImageUploaderModal
        countryId={countryId}
        onUploadSuccess={onUploadSuccess}
        isOpen={isImageUploaderOpen}
        onClose={onImageUploaderClose}
      />
    </>
  );
};

export default JourneyStarterSection;
