import React, { useState } from 'react';
import { Box, Button, Icon, useDisclosure, useColorModeValue, Text } from '@chakra-ui/react';
import { FaRocket, FaPlay, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedImageUploaderModal from '../../modals/EnhancedImageUploaderModal';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const JourneyStarterSection = ({ countryId, onUploadSuccess }) => {
  const { isOpen: isImageUploaderOpen, onOpen: onImageUploaderOpen, onClose: onImageUploaderClose } = useDisclosure();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Theme-aware colors
  const bgGradient = useColorModeValue(
    'linear(135deg, #667eea 0%, #764ba2 100%)',
    'linear(135deg, #4facfe 0%, #00f2fe 100%)'
  );
  
  const buttonBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const shadowColor = useColorModeValue('rgba(102, 126, 234, 0.4)', 'rgba(79, 172, 254, 0.4)');

  return (
    <>
      {/* Ultra-Modern Journey Starter Button */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        py={20}
        px={6}
        position="relative"
        overflow="hidden"
      >
        {/* Animated Background Elements */}
        <AnimatePresence>
          {isHovered && (
            <MotionBox
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              width="400px"
              height="400px"
              borderRadius="full"
              bgGradient={bgGradient}
              opacity={0.1}
              filter="blur(40px)"
              zIndex={0}
            />
          )}
        </AnimatePresence>

        {/* Floating Particles */}
        <Box
          position="absolute"
          top="20%"
          left="15%"
          width="4px"
          height="4px"
          bg="blue.400"
          borderRadius="full"
          className="floating-particle"
          animation="float 6s ease-in-out infinite"
        />
        <Box
          position="absolute"
          top="60%"
          right="20%"
          width="6px"
          height="6px"
          bg="purple.400"
          borderRadius="full"
          className="floating-particle"
          animation="float 8s ease-in-out infinite reverse"
        />
        <Box
          position="absolute"
          bottom="30%"
          left="25%"
          width="3px"
          height="3px"
          bg="pink.400"
          borderRadius="full"
          className="floating-particle"
          animation="float 7s ease-in-out infinite"
        />

        {/* Main Button Container */}
        <MotionBox
          position="relative"
          zIndex={1}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Button with Modern Design */}
          <MotionButton
            size="lg"
            onClick={onImageUploaderOpen}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            px={12}
            py={8}
            fontSize="2xl"
            fontWeight="bold"
            borderRadius="2xl"
            bg={buttonBg}
            color={textColor}
            border="2px solid"
            borderColor="transparent"
            position="relative"
            overflow="hidden"
            boxShadow={`0 20px 40px ${shadowColor}`}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            whileTap={{ 
              scale: 0.95,
              y: 0,
              transition: { duration: 0.1, ease: "easeOut" }
            }}
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: bgGradient,
              borderRadius: 'inherit',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              zIndex: -1
            }}
            _hover={{
              _before: { opacity: 0.1 },
              boxShadow: `0 25px 50px ${shadowColor}`,
              transform: 'translateY(-5px)'
            }}
            _active={{
              transform: 'translateY(0px) scale(0.98)'
            }}
          >
            {/* Button Content */}
            <Box
              display="flex"
              alignItems="center"
              gap={4}
              position="relative"
              zIndex={2}
            >
              {/* Animated Icon */}
              <MotionBox
                animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <Icon as={FaRocket} boxSize={8} color="blue.500" />
              </MotionBox>

              {/* Text Content */}
              <Box textAlign="left">
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  bgGradient={bgGradient}
                  bgClip="text"
                  lineHeight="1.2"
                >
                  Start Your Journey
                </Text>
                <Text
                  fontSize="sm"
                  color="gray.500"
                  fontWeight="medium"
                  mt={1}
                >
                  in this amazing country
                </Text>
              </Box>

              {/* Animated Arrow */}
              <MotionBox
                animate={isHovered ? { x: 10 } : { x: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Icon as={FaArrowRight} boxSize={6} color="blue.500" />
              </MotionBox>
            </Box>

            {/* Shimmer Effect */}
            <MotionBox
              position="absolute"
              top={0}
              left="-100%"
              width="100%"
              height="100%"
              background="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
              animate={isHovered ? { left: "100%" } : { left: "-100%" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              zIndex={1}
            />
          </MotionButton>

          {/* Subtle Glow Effect */}
          <MotionBox
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width="120%"
            height="120%"
            borderRadius="2xl"
            bgGradient={bgGradient}
            opacity={0}
            filter="blur(20px)"
            zIndex={-1}
            animate={isHovered ? { opacity: 0.3 } : { opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </MotionBox>
      </Box>

      {/* Enhanced Image Uploader Modal */}
      <EnhancedImageUploaderModal
        countryId={countryId}
        onUploadSuccess={onUploadSuccess}
        isOpen={isImageUploaderOpen}
        onClose={onImageUploaderClose}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(-10px) rotate(240deg); }
        }
        
        .floating-particle {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default JourneyStarterSection;
