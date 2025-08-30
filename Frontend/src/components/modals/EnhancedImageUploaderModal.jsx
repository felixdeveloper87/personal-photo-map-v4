// Frontend/src/components/modals/EnhancedImageUploaderModal.jsx
import React, { useState, useContext } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  useToast,
  Divider,
  Badge,
  Icon,
  Collapse,
  useDisclosure,
  Select,
  Input
} from '@chakra-ui/react';
import { 
  FaCloudUploadAlt, 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import { CountriesContext } from '../../context/CountriesContext';
import { buildApiUrl } from '../../utils/apiConfig';
import * as EXIF from 'exif-js';

const EnhancedImageUploaderModal = ({ isOpen, onClose, onUploadSuccess, countryId }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadMode, setUploadMode] = useState('simple'); // 'simple' or 'detailed'
  const [isLoading, setIsLoading] = useState(false);
  const [photoMetadata, setPhotoMetadata] = useState({});
  const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure();
  const toast = useToast();
  const { refreshCountriesWithPhotos } = useContext(CountriesContext);

        // Generate available years (last 30 years)
   const currentYear = new Date().getFullYear();
   const availableYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

   // States for detailed mode
   const [selectedYear, setSelectedYear] = useState(null); // Changed from currentYear to null
   const [selectedCountry, setSelectedCountry] = useState('');
   const [customDescription, setCustomDescription] = useState('');

   // Function to get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    // Para FormData, NÃO incluir Content-Type - o browser define automaticamente
    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
      console.warn('Invalid token in getAuthHeaders');
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  };

  const extractPhotoMetadata = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const exifData = EXIF.readFromBinaryFile(e.target.result);
          
          if (exifData && exifData.DateTime) {
            const dateStr = exifData.DateTime;
            const year = dateStr.split(':')[0];
            
            resolve({
              year: parseInt(year),
              date: dateStr,
              hasGPS: !!(exifData.GPSLatitude && exifData.GPSLongitude),
              original: exifData
            });
                     } else {
             // Fallback: use file date
             const fileDate = new Date(file.lastModified);
             resolve({
               year: fileDate.getFullYear(),
               date: fileDate.toISOString(),
               hasGPS: false,
               original: null
             });
           }
         } catch (error) {
           // Fallback in case of error
           const fileDate = new Date(file.lastModified);
           resolve({
             year: fileDate.getFullYear(),
             date: fileDate.toISOString(),
             hasGPS: false,
             original: null
           });
         }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

         // Validate files
     const validFiles = files.filter(file => file.type.startsWith('image/'));
     if (validFiles.length !== files.length) {
             toast({
         title: "Invalid Files",
         description: "Some files are not valid images",
         status: "warning",
         duration: 3000,
         isClosable: true,
       });
    }

    if (validFiles.length === 0) return;

    setSelectedFiles(validFiles);
    setIsLoading(true);

         try {
       // Extract metadata from all photos
       const metadata = {};
       for (const file of validFiles) {
         const fileMetadata = await extractPhotoMetadata(file);
         metadata[file.name] = fileMetadata;
       }
      
      setPhotoMetadata(metadata);
      
             toast({
         title: "Photos Analyzed!",
         description: `${validFiles.length} photo(s) ready for upload`,
         status: "success",
         duration: 3000,
         isClosable: true,
       });
    } catch (error) {
             toast({
         title: "Analysis Error",
         description: "Could not analyze the photos",
         status: "error",
         duration: 3000,
         isClosable: true,
       });
    } finally {
      setIsLoading(false);
    }
  };

    const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    
    try {
      // Check if we have photos from different years
      const years = selectedFiles
        .map(file => photoMetadata[file.name]?.year)
        .filter(year => year != null);
      
      const uniqueYears = [...new Set(years)];
      const hasMultipleYears = uniqueYears.length > 1;
      
      // If user manually selected a year, use that for all photos
      if (selectedYear !== null && selectedYear !== undefined) {
        await uploadPhotosWithYear(selectedFiles, selectedYear);
      }
      // If photos are from different years, handle each year separately
      else if (hasMultipleYears) {
        await handleMultipleYearUpload(selectedFiles);
      }
      // Single year detected, upload normally
      else {
        const yearToUse = years.length > 0 ? years[0] : new Date().getFullYear();
        await uploadPhotosWithYear(selectedFiles, yearToUse);
      }

      await refreshCountriesWithPhotos();
      onUploadSuccess?.();
      
      toast({
        title: "Upload Complete!",
        description: `${selectedFiles.length} photo(s) uploaded successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Clear state
      setSelectedFiles([]);
      setPhotoMetadata({});
      setSelectedYear(null);
      onClose();
      
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error.message || "Try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to upload photos with a specific year
  const uploadPhotosWithYear = async (files, year) => {
    const formData = new FormData();
    
    // Add all photos
    files.forEach(file => {
      formData.append('images', file);
    });
    
    // Add year and countryId
    formData.append('year', year);
    
    if (countryId) {
      formData.append('countryId', countryId);
    } else {
      // Fallback: try to detect country from GPS or use a default
      const hasGPS = files.some(file => photoMetadata[file.name]?.hasGPS);
      if (hasGPS) {
        // TODO: Implement GPS to country detection
        formData.append('countryId', 'us'); // Default fallback
      } else {
        throw new Error('Country ID is required for upload. Please select a country or enable GPS detection.');
      }
    }

    // Upload photos
    const token = localStorage.getItem('token');
    const uploadUrl = buildApiUrl('/api/images/upload');
    
    // Verify token and URL
    if (!token) {
      throw new Error('Token not found. Please login again.');
    }
    
    if (token.trim() === '' || token === 'null' || token === 'undefined') {
      throw new Error('Invalid token. Please login again.');
    }
   
    // Log para debug
    console.log('Upload URL:', uploadUrl);
    console.log('Token exists:', !!token);
    console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('Headers being sent:', getAuthHeaders());
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
    }
    
    // Verify URL is correct
    if (!uploadUrl.includes('/api/')) {
      throw new Error('Invalid upload URL');
    }
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      
      // Tratamento específico para erro 403
      if (response.status === 403) {
        throw new Error('Access denied. Please check if you are logged in and try again.');
      }
      
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
  };

  // Helper function to handle uploads for multiple years
  const handleMultipleYearUpload = async (files) => {
    // Group files by year
    const filesByYear = {};
    
    files.forEach(file => {
      const year = photoMetadata[file.name]?.year || new Date().getFullYear();
      if (!filesByYear[year]) {
        filesByYear[year] = [];
      }
      filesByYear[year].push(file);
    });

    // Upload each year group separately
    const uploadPromises = Object.entries(filesByYear).map(async ([year, yearFiles]) => {
      console.log(`📅 Uploading ${yearFiles.length} photo(s) from year ${year}`);
      await uploadPhotosWithYear(yearFiles, parseInt(year));
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
    
    console.log(`✅ All ${Object.keys(filesByYear).length} year groups uploaded successfully`);
  };

     const getUploadButtonText = () => {
     if (uploadMode === 'simple') {
       return `Upload ${selectedFiles.length} Photo(s)`;
     } else {
       return `Upload ${selectedFiles.length} Photo(s) with Year Selection`;
     }
   };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
              title="Photo Upload"
      icon={FaCloudUploadAlt}
      size="xl"
    >
      <VStack spacing={6} align="stretch">
        
                 {/* Upload Mode Selection */}
         <Box textAlign="center">
           <Text fontSize="lg" fontWeight="bold" mb={3}>
             Choose upload type:
           </Text>
           
           <HStack spacing={4} justify="center">
             <Button
               variant={uploadMode === 'simple' ? 'solid' : 'outline'}
               colorScheme="blue"
               onClick={() => setUploadMode('simple')}
               leftIcon={<FaCloudUploadAlt />}
             >
               Simple Upload
             </Button>
             
             <Button
               variant={uploadMode === 'detailed' ? 'solid' : 'outline'}
               colorScheme="green"
               onClick={() => setUploadMode('detailed')}
               leftIcon={<FaCalendar />}
             >
               Upload with Year Selection
             </Button>
           </HStack>
         </Box>

        <Divider />

                 {/* File Selection */}
         <Box textAlign="center">
           <input
             type="file"
             accept="image/*"
             multiple
             onChange={handleFileSelect}
             style={{ display: 'none' }}
             id="photo-upload"
           />
           
           <Button
             as="label"
             htmlFor="photo-upload"
             colorScheme="blue"
             variant="outline"
             size="lg"
             leftIcon={<FaCloudUploadAlt />}
             isLoading={isLoading}
             w="full"
           >
             Select Photo(s)
           </Button>
           
           <Text fontSize="sm" color="gray.500" mt={2}>
             You can select multiple photos
           </Text>
         </Box>

                 {/* Selected Photos Preview */}
         {selectedFiles.length > 0 && (
           <Box>
             <Text fontWeight="semibold" mb={3}>
               Selected Photos ({selectedFiles.length}):
             </Text>
            
            <Box
              maxH="300px"
              overflowY="auto"
              borderWidth={1}
              borderRadius="md"
              p={3}
            >
              <VStack spacing={3}>
                {selectedFiles.map((file, index) => (
                  <HStack key={index} w="full" justify="space-between">
                    <HStack spacing={3}>
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        boxSize="60px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                          {file.name}
                        </Text>
                        
                        {photoMetadata[file.name] && (
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" size="sm">
                              {photoMetadata[file.name].year}
                            </Badge>
                            
                            {photoMetadata[file.name].hasGPS && (
                              <Badge colorScheme="green" size="sm">
                                GPS
                              </Badge>
                            )}
                          </HStack>
                        )}
                      </VStack>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </Box>
        )}

                 {/* Detailed Mode - Optional Attributes */}
         {uploadMode === 'detailed' && selectedFiles.length > 0 && (
           <Box
             p={4}
             borderWidth={1}
             borderRadius="md"
             bg="blue.50"
             borderColor="blue.200"
             _dark={{ bg: 'blue.900', borderColor: 'blue.700' }}
           >
             <VStack spacing={4} align="stretch">
               <HStack justify="space-between">
                 <Text fontWeight="semibold" color="blue.700" _dark={{ color: 'blue.200' }}>
                   📅 Edit Photo Year
                 </Text>
                 <Icon
                   as={isAdvancedOpen ? FaChevronUp : FaChevronDown}
                   cursor="pointer"
                   onClick={onAdvancedToggle}
                   color="blue.500"
                 />
               </HStack>

               <Text fontSize="sm" color="blue.600" _dark={{ color: 'blue.300' }}>
                 Click the arrow above to expand and edit the photo year manually
               </Text>

               <Collapse in={isAdvancedOpen}>
                 <VStack spacing={4} align="stretch">
                   {/* Specific Year */}
                   <Box>
                     <Text fontSize="sm" fontWeight="medium" mb={2}>
                       📅 Photo Year (if different from detected):
                     </Text>
                     <Text fontSize="xs" color="gray.600" mb={2}>
                       Currently detected: {(() => {
                         if (selectedFiles.length > 0) {
                           const years = selectedFiles
                             .map(file => photoMetadata[file.name]?.year)
                             .filter(year => year != null);
                           
                           if (years.length > 0) {
                             const yearCounts = years.reduce((acc, year) => {
                               acc[year] = (acc[year] || 0) + 1;
                               return acc;
                             }, {});
                             
                             const mostCommonYear = Object.entries(yearCounts)
                               .sort(([,a], [,b]) => b - a)[0][0];
                             
                             return `${mostCommonYear} (from EXIF data)`;
                           }
                         }
                         return 'No EXIF data available';
                       })()}
                     </Text>
                     <Select
                       value={selectedYear || ''}
                       onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                       placeholder="Keep automatically detected year"
                       bg="white"
                       _dark={{ bg: 'gray.800' }}
                     >
                       <option value="">✅ Keep automatically detected year</option>
                       <option value="" disabled>───────────</option>
                       <option value="" disabled>📅 Select a specific year:</option>
                       <option value="" disabled>───────────</option>
                       {/* Recent years (last 10 years) */}
                       {availableYears.slice(0, 10).map(year => (
                         <option key={year} value={year}>
                           {year}
                         </option>
                       ))}
                       <option value="" disabled>───────────</option>
                       {/* Decades for older photos */}
                       {[1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1910, 1900].map(year => (
                         <option key={year} value={year}>
                           {year}s
                         </option>
                       ))}
                       <option value="" disabled>───────────</option>
                       {/* Custom year input option */}
                       <option value="custom">📝 Enter custom year...</option>
                     </Select>
                   </Box>

                                        {/* Custom Year Input (only shown if "custom" is selected) */}
                     {selectedYear === 'custom' && (
                       <Box>
                         <Text fontSize="sm" fontWeight="medium" mb={2}>
                           Enter the specific year:
                         </Text>
                         <Input
                           type="number"
                           min="1900"
                           max={new Date().getFullYear()}
                           placeholder="e.g., 1995"
                           onChange={(e) => {
                             const value = e.target.value;
                             if (value && value >= 1900 && value <= new Date().getFullYear()) {
                               setSelectedYear(parseInt(value));
                             } else if (value === '') {
                               setSelectedYear('custom');
                             }
                           }}
                           bg="white"
                           _dark={{ bg: 'gray.800' }}
                         />
                         <Text fontSize="xs" color="gray.500" mt={1}>
                           Enter a year between 1900 and {new Date().getFullYear()}
                         </Text>
                       </Box>
                     )}
                 </VStack>
               </Collapse>
             </VStack>
           </Box>
         )}

                 {/* Year Indicator for Upload */}
         {selectedFiles.length > 0 && (
           <Box
             p={3}
             bg="green.50"
             borderRadius="md"
             borderWidth={1}
             borderColor="green.200"
             _dark={{ bg: 'green.900', borderColor: 'green.700' }}
           >
             <HStack spacing={2} justify="center">
               <Icon as={FaCalendar} color="green.500" />
               <Text fontSize="sm" color="green.700" _dark={{ color: 'green.200' }}>
                 <strong>Year for upload:</strong> {
                   (() => {
                     // Check if we have photos from different years
                     const years = selectedFiles
                       .map(file => photoMetadata[file.name]?.year)
                       .filter(year => year != null);
                     
                     const uniqueYears = [...new Set(years)];
                     const hasMultipleYears = uniqueYears.length > 1;
                     
                     // If user manually selected a year, use that for all photos
                     if (selectedYear !== null && selectedYear !== undefined) {
                       return selectedYear + ' (manually selected for all photos)';
                     }
                     // If photos are from different years, explain the strategy
                     else if (hasMultipleYears) {
                       const yearList = uniqueYears.sort((a, b) => b - a).join(', ');
                       return `${yearList} (photos will be grouped by year automatically)`;
                     }
                     // Single year detected
                     else if (years.length > 0) {
                       return years[0] + ' (automatically detected via EXIF)';
                     } else {
                       return new Date().getFullYear() + ' (current year - no EXIF data)';
                     }
                   })()
                 }
               </Text>
             </HStack>
             
             {/* Additional info for multiple years */}
             {(() => {
               const years = selectedFiles
                 .map(file => photoMetadata[file.name]?.year)
                 .filter(year => year != null);
               
               const uniqueYears = [...new Set(years)];
               const hasMultipleYears = uniqueYears.length > 1;
               
               if (hasMultipleYears && selectedYear === null) {
                 return (
                   <Text fontSize="xs" color="green.600" _dark={{ color: 'green.300' }} mt={2} textAlign="center">
                     💡 Each photo will be saved with its correct year automatically
                   </Text>
                 );
               }
               return null;
             })()}
           </Box>
         )}

                 {/* Upload Button */}
         {selectedFiles.length > 0 && (
           <Button
             colorScheme="green"
             size="lg"
             onClick={handleUpload}
             isLoading={isLoading}
             leftIcon={<FaCloudUploadAlt />}
             w="full"
           >
             {getUploadButtonText()}
           </Button>
         )}

                 {/* Additional Information */}
         <Box
           p={3}
           bg="blue.50"
           borderRadius="md"
           _dark={{ bg: 'blue.900' }}
         >
           <HStack spacing={2}>
             <Icon as={FaInfoCircle} color="blue.500" />
             <Text fontSize="sm" color="blue.700" _dark={{ color: 'blue.200' }}>
               <strong>Simple Upload:</strong> Just adds photos to your profile
               <br />
               <strong>Upload with Year Selection:</strong> Allows you to define a specific year for your photos
             </Text>
           </HStack>
         </Box>
      </VStack>
    </BaseModal>
  );
};

export default EnhancedImageUploaderModal;