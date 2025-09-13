import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  SimpleGrid,
  Image,
  useColorModeValue,
  Card,
  CardBody,
  Divider,
} from '@chakra-ui/react';
import { FaUpload, FaEye, FaCalendar, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';
import { 
  extractMetadataFromFiles, 
  groupPhotosByYear, 
  isValidImageFile,
  createImagePreview 
} from '../../utils/photoMetadataExtractor';

const PhotoMetadataDemo = () => {
  const [files, setFiles] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState({});

  // Cores do tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(isValidImageFile);

    if (validFiles.length !== selectedFiles.length) {
      alert('Alguns arquivos foram ignorados. Apenas imagens são aceitas.');
    }

    if (validFiles.length === 0) return;

    setFiles(validFiles);
    setIsProcessing(true);
    setProgress(0);
    setMetadata([]);
    setPreviews({});

    try {
      // Extrair metadados com callback de progresso
      const results = await extractMetadataFromFiles(validFiles, (progressInfo) => {
        setProgress(progressInfo.percentage);
      });

      // Criar previews das imagens
      const previewPromises = validFiles.map(async (file, index) => {
        try {
          const preview = await createImagePreview(file, 150);
          return { index, preview };
        } catch (error) {
          console.error('Erro ao criar preview:', error);
          return { index, preview: null };
        }
      });

      const previewResults = await Promise.all(previewPromises);
      const previewMap = {};
      previewResults.forEach(({ index, preview }) => {
        if (preview) {
          previewMap[index] = preview;
        }
      });

      setMetadata(results);
      setPreviews(previewMap);
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const groupedByYear = groupPhotosByYear(metadata);
  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" border={`1px solid ${borderColor}`}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="xl" fontWeight="bold" color={textColor}>
          Demonstração: Detector Automático de Metadados
        </Text>

        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Como funciona:</AlertTitle>
            <AlertDescription>
              Este sistema lê automaticamente os metadados EXIF das suas fotos para detectar o ano,
              coordenadas GPS, configurações da câmera e outras informações úteis.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Upload de arquivos */}
        <Box>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="file-input"
          />
          <Button
            as="label"
            htmlFor="file-input"
            leftIcon={<FaUpload />}
            colorScheme="blue"
            size="lg"
            cursor="pointer"
            w="100%"
          >
            Selecionar Fotos para Analisar
          </Button>
        </Box>

        {/* Progresso */}
        {isProcessing && (
          <VStack spacing={3}>
            <Text>Analisando metadados... {progress}%</Text>
            <Progress value={progress} colorScheme="blue" size="lg" borderRadius="md" />
          </VStack>
        )}

        {/* Resultados agrupados por ano */}
        {years.length > 0 && (
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Fotos organizadas por ano:
            </Text>

            {years.map(year => (
              <Card key={year} bg={bgColor} border={`1px solid ${borderColor}`}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <HStack>
                        <FaCalendar color="blue" />
                        <Text fontSize="lg" fontWeight="bold">
                          {year}
                        </Text>
                      </HStack>
                      <Badge colorScheme="blue" variant="solid">
                        {groupedByYear[year].length} fotos
                      </Badge>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      {groupedByYear[year].map((photo, index) => (
                        <Card key={index} size="sm" border={`1px solid ${borderColor}`}>
                          <CardBody p={3}>
                            <VStack spacing={3}>
                              {/* Preview da imagem */}
                              {previews[metadata.indexOf(photo)] && (
                                <Image
                                  src={previews[metadata.indexOf(photo)]}
                                  alt={photo.fileName}
                                  w="100px"
                                  h="100px"
                                  objectFit="cover"
                                  borderRadius="md"
                                />
                              )}

                              <VStack spacing={1} align="stretch">
                                <Text fontSize="sm" fontWeight="bold" isTruncated>
                                  {photo.fileName}
                                </Text>

                                <HStack spacing={2} wrap="wrap">
                                  <Badge colorScheme="green" size="sm">
                                    {photo.year}
                                  </Badge>
                                  
                                  {photo.hasGPS && (
                                    <Badge colorScheme="orange" size="sm">
                                      <FaMapMarkerAlt size="10px" style={{ marginRight: '2px' }} />
                                      GPS
                                    </Badge>
                                  )}

                                  <Badge 
                                    colorScheme={photo.dateSource === 'exif' ? 'blue' : 'gray'} 
                                    size="sm"
                                  >
                                    {photo.dateSource === 'exif' ? 'EXIF' : 'Arquivo'}
                                  </Badge>
                                </HStack>

                                {/* Informações técnicas */}
                                {photo.camera && (photo.camera.make || photo.camera.model) && (
                                  <HStack>
                                    <FaCamera size="12px" />
                                    <Text fontSize="xs" color="gray.500">
                                      {[photo.camera.make, photo.camera.model].filter(Boolean).join(' ')}
                                    </Text>
                                  </HStack>
                                )}

                                {photo.photoDate && (
                                  <Text fontSize="xs" color="gray.500">
                                    {new Date(photo.photoDate).toLocaleDateString('pt-BR')}
                                  </Text>
                                )}
                              </VStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}

        {/* Estatísticas */}
        {metadata.length > 0 && (
          <>
            <Divider />
            <VStack spacing={3}>
              <Text fontSize="md" fontWeight="semibold">
                Estatísticas da Análise:
              </Text>
              
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="100%">
                <VStack p={3} bg="blue.50" borderRadius="md">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {metadata.length}
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    Total de Fotos
                  </Text>
                </VStack>

                <VStack p={3} bg="green.50" borderRadius="md">
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {years.length}
                  </Text>
                  <Text fontSize="sm" color="green.600">
                    Anos Diferentes
                  </Text>
                </VStack>

                <VStack p={3} bg="orange.50" borderRadius="md">
                  <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                    {metadata.filter(m => m.hasGPS).length}
                  </Text>
                  <Text fontSize="sm" color="orange.600">
                    Com GPS
                  </Text>
                </VStack>

                <VStack p={3} bg="purple.50" borderRadius="md">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {metadata.filter(m => m.dateSource === 'exif').length}
                  </Text>
                  <Text fontSize="sm" color="purple.600">
                    Com EXIF
                  </Text>
                </VStack>
              </SimpleGrid>
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default PhotoMetadataDemo;
