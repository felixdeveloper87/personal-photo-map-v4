import React, { useContext, lazy, Suspense, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  Spinner,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  Collapse,
  Heading,
  useBreakpointValue,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CountriesContext } from '../../context/CountriesContext';
import { AuthContext } from '../../context/AuthContext';
import ConversionModal from '../modals/ConversionModal';
import { FaGlobe } from 'react-icons/fa';

// Lazy loading of PhotoGallery
const LazyPhotoGallery = lazy(() => import('./photos/PhotoGallery'));

import { buildApiUrl } from '../../utils/apiConfig';

// Fetch photos with error handling
const fetchAllPictures = async (year) => {
  let url = buildApiUrl('/api/images/allPictures');
  if (year) url += `?year=${year}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch photos: ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data.map((image) => ({
    url: image.filePath.includes('s3.') ? image.filePath : `${import.meta.env.VITE_BACKEND_URL}${image.filePath}`,
    id: image.id,
    year: image.year,
    countryId: image.countryId,
  }));
};

const Timeline = ({ selectedYear }) => {
  const navigate = useNavigate();
  const { refreshCountriesWithPhotos } = useContext(CountriesContext);
  const { isLoggedIn } = useContext(AuthContext);
  const [collapsedYears, setCollapsedYears] = useState({});
  const conversionModal = useDisclosure();

  // Responsive values
  const fontSize = useBreakpointValue({ base: 'lg', md: 'xl', lg: '2xl' });
  const padding = useBreakpointValue({ base: 4, md: 6, lg: 8 });

  // Color scheme
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.100, teal.100)',
    'linear(to-r, gray.700, gray.800)'
  );
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const cardBg = useColorModeValue('white', 'gray.900');


  // Fetch photos with React Query
  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ['allPictures', selectedYear],
    queryFn: () => fetchAllPictures(selectedYear),
    staleTime: 5 * 60 * 1000,
    onSuccess: () => refreshCountriesWithPhotos?.(),
    enabled: isLoggedIn, // Only fetch when user is logged in
  });

  // Memoize grouped images to prevent unnecessary re-renders
  const groupedByYear = useMemo(() => {
    const sortedImages = [...images].sort((a, b) => b.year - a.year);
    return sortedImages.reduce((acc, image) => {
      if (!acc[image.year]) acc[image.year] = [];
      acc[image.year].push(image);
      return acc;
    }, {});
  }, [images]);

  // Sort years in descending order (most recent to oldest)
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  // Toggle year collapse state
  const toggleYear = (year) => {
    setCollapsedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  // Loading state - only show when logged in and actually loading
  if (isLoggedIn && isLoading) {
    return (
      <Box
        minH="100vh"
        bgGradient={bgGradient}
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={padding}
      >
        <Spinner size="xl" color={accentColor} thickness="4px" />
      </Box>
    );
  }

  // Error state - only show when logged in and there's an error
  if (isLoggedIn && error) {
    return (
      <Box
        minH="100vh"
        bgGradient={bgGradient}
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={padding}
      >
        <Text color="red.500" fontSize="lg" fontWeight="medium">
          Error: {error.message}
        </Text>
      </Box>
    );
  }

  // Don't render timeline content if user is not logged in
  if (!isLoggedIn) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} p={padding}>
        <VStack spacing={6} align="stretch" maxW="1200px" mx="auto">
          <Heading
            as="h1"
            size={fontSize}
            textAlign="center"
            color={textColor}
            fontWeight="bold"
            letterSpacing="tight"
            mb={4}
          >
            Your Photo Timeline
          </Heading>
          <Text color={textColor} fontSize="lg" textAlign="center" mt={8}>
            Please log in to view your photo timeline and organize your travel memories.
          </Text>
          
          <Button
            size="lg"
            colorScheme="blue"
            onClick={conversionModal.onOpen}
            leftIcon={<FaGlobe />}
            mx="auto"
            px={8}
            py={6}
            fontSize="lg"
            fontWeight="bold"
            borderRadius="xl"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'xl'
            }}
            transition="all 0.3s ease"
          >
            Learn More About Timeline Features
          </Button>
        </VStack>
        
        {/* Authentication Modals - Must be rendered even when not logged in */}
        <ConversionModal
          isOpen={conversionModal.isOpen}
          onClose={conversionModal.onClose}
        />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient} p={padding}>
      <VStack spacing={6} align="stretch" maxW="1200px" mx="auto">
        <Heading
          as="h1"
          size={fontSize}
          textAlign="center"
          color={textColor}
          fontWeight="bold"
          letterSpacing="tight"
          mb={4}
        >
          {selectedYear ? `Timeline for ${selectedYear}` : 'Your Photo Timeline'}
        </Heading>

        {sortedYears.length > 0 ? (
          <VStack spacing={3} align="stretch">
            <AnimatePresence>
              {sortedYears.map((year) => (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    bg={cardBg}
                    borderRadius="lg"
                    boxShadow="md"
                    p={4}
                    position="relative"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      left: '20px',
                      top: '50px',
                      bottom: '20px',
                      width: '4px',
                      bg: accentColor,
                      borderRadius: 'full',
                      display: { base: 'none', md: 'block' },
                    }}
                  >
                    <HStack justify="space-between" align="center" cursor="pointer" onClick={() => toggleYear(year)}>
                      <Text
                        fontSize="xl"
                        fontWeight="semibold"
                        color={textColor}
                        _hover={{ color: accentColor }}
                        transition="color 0.2s ease"
                      >
                        {year}
                      </Text>
                      <IconButton
                        aria-label={`Toggle photos for ${year}`}
                        icon={collapsedYears[year] ? <ChevronDownIcon /> : <ChevronUpIcon />}
                        size="sm"
                        variant="ghost"
                        color={textColor}
                        _hover={{ color: accentColor, bg: 'transparent' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleYear(year);
                        }}
                      />
                    </HStack>
                    <Collapse in={!collapsedYears[year]} animateOpacity>
                      <Box mt={2} pl={{ base: 0, md: 8 }}>
                        <Suspense fallback={<Spinner size="md" color={accentColor} />}>
                          <LazyPhotoGallery images={groupedByYear[year] || []} />
                        </Suspense>
                      </Box>
                    </Collapse>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </VStack>
        ) : (
          <Text color={textColor} fontSize="lg" textAlign="center" mt={8}>
            No photos to display yet. Start capturing your journey!
          </Text>
        )}
      </VStack>

      {/* Authentication Modals */}
      <ConversionModal
        isOpen={conversionModal.isOpen}
        onClose={conversionModal.onClose}
      />
    </Box>
  );
};

export default Timeline;