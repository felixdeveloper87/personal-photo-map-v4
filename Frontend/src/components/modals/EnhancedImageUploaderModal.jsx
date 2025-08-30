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
   const [selectedYear, setSelectedYear] = useState(currentYear);
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
      const formData = new FormData();
      
             // Add all photos
       selectedFiles.forEach(file => {
         formData.append('images', file);
       });

       // Add year (required for backend)
      let yearToUse = null;
      
             // 1. Priority: year manually selected by user
       if (selectedYear) {
         yearToUse = selectedYear;
       }
       // 2. Priority: year automatically detected via EXIF
       else if (selectedFiles.length > 0) {
         // If there are multiple photos, use the most common year or the first available
         const years = selectedFiles
           .map(file => photoMetadata[file.name]?.year)
           .filter(year => year != null);
         
         if (years.length > 0) {
           // Use the most frequent year, or the first if all are different
           const yearCounts = years.reduce((acc, year) => {
             acc[year] = (acc[year] || 0) + 1;
             return acc;
           }, {});
           
           const mostCommonYear = Object.entries(yearCounts)
             .sort(([,a], [,b]) => b - a)[0][0];
           
           yearToUse = parseInt(mostCommonYear);
         } else {
           yearToUse = new Date().getFullYear();
         }
       }
       // 3. Fallback: current year (only if we can't detect anything)
       else {
         yearToUse = new Date().getFullYear();
       }
      
      formData.append('year', yearToUse);

             // If detailed mode, add additional attributes
       if (uploadMode === 'detailed') {
         if (selectedCountry) formData.append('country', selectedCountry);
         if (customDescription) formData.append('description', customDescription);
       }

               // Upload photos
        const token = localStorage.getItem('token');
        const uploadUrl = buildApiUrl('/api/images/upload');
        
        // Verify token and URL
        if (!token) {
          throw new Error('Token not found. Please login again.');
        }
        
        // Verificar se o token não está vazio ou malformado
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
      
      if (response.ok) {
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
         setSelectedYear(currentYear);
         setSelectedCountry('');
         setCustomDescription('');
        onClose();
             } else {
         const errorText = await response.text();
         console.error('Upload failed:', response.status, errorText);
         
         // Tratamento específico para erro 403
         if (response.status === 403) {
           throw new Error('Access denied. Please check if you are logged in and try again.');
         }
         
         throw new Error(`Upload failed: ${response.status} - ${errorText}`);
       }
    } catch (error) {
             toast({
         title: "Upload Error",
         description: "Try again",
         status: "error",
         duration: 3000,
         isClosable: true,
       });
    } finally {
      setIsLoading(false);
    }
  };

     const getUploadButtonText = () => {
     if (uploadMode === 'simple') {
       return `Upload ${selectedFiles.length} Photo(s)`;
     } else {
       return `Upload ${selectedFiles.length} Photo(s) with Attributes`;
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
               Upload with Attributes
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
           <Collapse in={isAdvancedOpen}>
             <Box
               p={4}
               borderWidth={1}
               borderRadius="md"
               bg="gray.50"
               _dark={{ bg: 'gray.700' }}
             >
               <VStack spacing={4} align="stretch">
                 <HStack justify="space-between">
                   <Text fontWeight="semibold">
                     Photo Attributes (Optional)
                   </Text>
                   <Icon
                     as={isAdvancedOpen ? FaChevronUp : FaChevronDown}
                     cursor="pointer"
                     onClick={onAdvancedToggle}
                   />
                 </HStack>

                 <Collapse in={isAdvancedOpen}>
                   <VStack spacing={4} align="stretch">
                     {/* Specific Year */}
                     <Box>
                       <Text fontSize="sm" fontWeight="medium" mb={2}>
                         Photo Year (if different from detected):
                       </Text>
                       <Select
                         value={selectedYear}
                         onChange={(e) => setSelectedYear(e.target.value)}
                         placeholder="Keep automatically detected year"
                       >
                         {availableYears.map(year => (
                           <option key={year} value={year}>
                             {year}
                           </option>
                         ))}
                       </Select>
                     </Box>

                     {/* Country */}
                     <Box>
                       <Text fontSize="sm" fontWeight="medium" mb={2}>
                         Country (if known):
                       </Text>
                       <Select
                         value={selectedCountry}
                         onChange={(e) => setSelectedCountry(e.target.value)}
                         placeholder="Detect automatically via GPS"
                       >
                         <option value="br">Brazil</option>
                         <option value="us">United States</option>
                         <option value="gb">United Kingdom</option>
                         {/* Add more countries as needed */}
                       </Select>
                     </Box>

                     {/* Custom Description */}
                     <Box>
                       <Text fontSize="sm" fontWeight="medium" mb={2}>
                         Description (optional):
                       </Text>
                       <Input
                         value={customDescription}
                         onChange={(e) => setCustomDescription(e.target.value)}
                         placeholder="Ex: Trip to Paris, Birthday, etc."
                       />
                     </Box>
                   </VStack>
                 </Collapse>
               </VStack>
             </Box>
           </Collapse>
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
                   selectedYear || 
                   (selectedFiles.length > 0 && photoMetadata[selectedFiles[0].name]?.year) || 
                   new Date().getFullYear()
                 }
                 {selectedYear ? ' (manually selected)' : ' (automatically detected via EXIF)'}
               </Text>
             </HStack>
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
               <strong>Upload with Attributes:</strong> Allows you to define specific year, country and description
             </Text>
           </HStack>
         </Box>
      </VStack>
    </BaseModal>
  );
};

export default EnhancedImageUploaderModal;