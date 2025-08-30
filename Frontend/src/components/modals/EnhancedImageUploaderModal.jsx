// Frontend/src/components/modals/EnhancedImageUploaderModal.jsx
import React, { useState, useContext, useMemo, useCallback } from 'react';
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
  Input,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  FaCloudUploadAlt,
  FaCalendar,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import BaseModal from './BaseModal';
import { CountriesContext } from '../../context/CountriesContext';
import { buildApiUrl } from '../../utils/apiConfig';
import * as EXIF from 'exif-js';

const CURRENT_YEAR = new Date().getFullYear();
const RECENT_YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);
const DECADES = [1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1910, 1900];

const EnhancedImageUploaderModal = ({ isOpen, onClose, onUploadSuccess, countryId }) => {
  const toast = useToast();
  const { refreshCountriesWithPhotos } = useContext(CountriesContext);
  const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure();

  // Files & EXIF
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [photoMetadata, setPhotoMetadata] = useState({}); // { [file.name]: { year, date, hasGPS, original } }
  const [isLoading, setIsLoading] = useState(false);

  // Year strategy:
  // 'auto' => usa o ano detectado por foto (agrupa e envia por ano quando necessário)
  // 'override' => aplica um único ano manual para todas as fotos
  const [yearStrategy, setYearStrategy] = useState('auto');
  const [overrideYear, setOverrideYear] = useState(null); // number | null | 'custom'
  const [customYear, setCustomYear] = useState(''); // texto para input custom

  // -------------- Helpers --------------

  const showToast = useCallback(
    (title, description, status = 'info') => {
      toast({
        title,
        description,
        status,
        duration: 3500,
        isClosable: true,
      });
    },
    [toast]
  );

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
      return {};
    }
    return { Authorization: `Bearer ${token}` }; // NUNCA setar Content-Type para FormData
  };

  const extractPhotoMetadata = async (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const exif = EXIF.readFromBinaryFile(e.target.result) || {};
          // Ordem de preferência: DateTimeOriginal > DateTime > DateTimeDigitized
          const dateStr =
            exif.DateTimeOriginal || exif.DateTime || exif.DateTimeDigitized || null;

          let year;
          if (dateStr && typeof dateStr === 'string' && dateStr.includes(':')) {
            // EXIF vem como "YYYY:MM:DD HH:mm:ss"
            year = parseInt(dateStr.split(':')[0], 10);
          }

          if (!year || Number.isNaN(year)) {
            const fileDate = new Date(file.lastModified);
            resolve({
              year: fileDate.getFullYear(),
              date: fileDate.toISOString(),
              hasGPS: !!(exif.GPSLatitude && exif.GPSLongitude),
              original: null,
            });
          } else {
            resolve({
              year,
              date: dateStr,
              hasGPS: !!(exif.GPSLatitude && exif.GPSLongitude),
              original: exif,
            });
          }
        } catch {
          // Fallback: lastModified
          const fileDate = new Date(file.lastModified);
          resolve({
            year: fileDate.getFullYear(),
            date: fileDate.toISOString(),
            hasGPS: false,
            original: null,
          });
        }
      };
      reader.readAsArrayBuffer(file);
    });

  const readAllExif = async (files) => {
    const meta = {};
    for (const f of files) {
      meta[f.name] = await extractPhotoMetadata(f);
    }
    return meta;
  };

  const safeNumber = (v) => (typeof v === 'string' ? parseInt(v, 10) : v);

  // -------------- Derived (useMemo) --------------

  const detectedYears = useMemo(() => {
    if (selectedFiles.length === 0) return [];
    return selectedFiles
      .map((f) => photoMetadata[f.name]?.year)
      .filter((y) => y != null && !Number.isNaN(y));
  }, [selectedFiles, photoMetadata]);

  const uniqueYears = useMemo(() => Array.from(new Set(detectedYears)).sort((a, b) => b - a), [detectedYears]);

  const hasMultipleYears = uniqueYears.length > 1;
  const mostCommonYear = useMemo(() => {
    if (detectedYears.length === 0) return null;
    const counts = detectedYears.reduce((acc, y) => {
      acc[y] = (acc[y] || 0) + 1;
      return acc;
    }, {});
    return parseInt(
      Object.entries(counts)
        .sort(([, a], [, b]) => b - a)[0][0],
      10
    );
  }, [detectedYears]);

  const groupedFilesByYear = useMemo(() => {
    if (selectedFiles.length === 0) return {};
    const groups = {};
    for (const f of selectedFiles) {
      const y = photoMetadata[f.name]?.year ?? CURRENT_YEAR;
      groups[y] = groups[y] || [];
      groups[y].push(f);
    }
    return groups;
  }, [selectedFiles, photoMetadata]);

  const effectiveOverrideYear = useMemo(() => {
    if (yearStrategy !== 'override') return null;
    if (overrideYear === 'custom') {
      const y = safeNumber(customYear);
      return !Number.isNaN(y) && y >= 1900 && y <= CURRENT_YEAR ? y : null;
    }
    return safeNumber(overrideYear);
  }, [yearStrategy, overrideYear, customYear]);

  const uploadSummaryText = useMemo(() => {
    if (selectedFiles.length === 0) return '';
    if (yearStrategy === 'override') {
      if (effectiveOverrideYear) {
        return `${effectiveOverrideYear} (aplicado manualmente para todas as fotos)`;
      }
      return 'Selecione um ano válido para aplicar a todas as fotos';
    }
    if (hasMultipleYears) {
      return `${uniqueYears.join(', ')} (as fotos serão agrupadas automaticamente por ano)`;
    }
    if (detectedYears.length > 0) {
      return `${detectedYears[0]} (detectado automaticamente via EXIF/arquivo)`;
    }
    return `${CURRENT_YEAR} (ano atual — sem EXIF)`;
  }, [
    selectedFiles.length,
    yearStrategy,
    effectiveOverrideYear,
    hasMultipleYears,
    uniqueYears,
    detectedYears,
  ]);

  // -------------- Handlers --------------

  const handleFileSelect = async (event) => {
    const incoming = Array.from(event.target.files || []);
    if (incoming.length === 0) return;

    const valid = incoming.filter((f) => f.type?.startsWith('image/'));
    if (valid.length !== incoming.length) {
      showToast('Alguns arquivos foram ignorados', 'Apenas imagens são permitidas.', 'warning');
    }
    if (valid.length === 0) return;

    setIsLoading(true);
    try {
      const meta = await readAllExif(valid);
      setSelectedFiles(valid);
      setPhotoMetadata(meta);
      // Reset da estratégia ao adicionar fotos
      setYearStrategy('auto');
      setOverrideYear(null);
      setCustomYear('');
      showToast('Fotos analisadas!', `${valid.length} foto(s) prontas para upload.`, 'success');
    } catch {
      showToast('Erro na análise', 'Não foi possível ler os metadados das fotos.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPhotosWithYear = async (files, year) => {
    if (!countryId) {
      // Mantive a exigência do countryId conforme seu backend
      throw new Error('Selecione um país antes de enviar as fotos.');
    }

    const token = localStorage.getItem('token');
    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
      throw new Error('Você precisa estar logado para enviar fotos.');
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    formData.append('year', year);
    formData.append('countryId', countryId);

    const uploadUrl = buildApiUrl('/api/images/upload');

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403) {
        throw new Error('Acesso negado. Verifique seu login e tente novamente.');
      }
      throw new Error(`Falha no upload: ${response.status} - ${errorText}`);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    // Validações prévias
    if (!countryId) {
      showToast('País obrigatório', 'Selecione um país para associar as fotos.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      if (yearStrategy === 'override') {
        if (!effectiveOverrideYear) {
          throw new Error('Informe um ano válido (entre 1900 e o ano atual).');
        }
        await uploadPhotosWithYear(selectedFiles, effectiveOverrideYear);
      } else {
        // Estratégia auto: enviar por grupos (um request por ano)
        const entries = Object.entries(groupedFilesByYear); // [[year, files], ...]
        await Promise.all(
          entries.map(([y, files]) => uploadPhotosWithYear(files, parseInt(y, 10)))
        );
      }

      await refreshCountriesWithPhotos();
      onUploadSuccess?.();

      showToast('Upload concluído!', `${selectedFiles.length} foto(s) enviadas com sucesso.`, 'success');

      // Reset
      setSelectedFiles([]);
      setPhotoMetadata({});
      setYearStrategy('auto');
      setOverrideYear(null);
      setCustomYear('');
      onClose();
    } catch (error) {
      showToast('Erro no upload', error?.message || 'Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------- UI --------------

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        // Reset leve ao fechar
        setYearStrategy('auto');
        setOverrideYear(null);
        setCustomYear('');
        onClose();
      }}
      title="Enviar Fotos"
      icon={FaCloudUploadAlt}
      size="xl"
    >
      <VStack spacing={6} align="stretch">
        {/* Paso 1: Selecionar fotos */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={3} textAlign="center">
            1) Selecione suas fotos
          </Text>

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
            h="56px"
          >
            {selectedFiles.length === 0
              ? 'Clique para selecionar fotos'
              : `Selecionadas ${selectedFiles.length} foto(s)`}
          </Button>

          <Text fontSize="sm" color="gray.500" mt={2} textAlign="center">
            Você pode selecionar múltiplas fotos de uma vez
          </Text>
        </Box>

        {/* Prévia dos arquivos */}
        {selectedFiles.length > 0 && (
          <Box>
            <Text fontWeight="semibold" mb={3}>
              Selecionadas ({selectedFiles.length}):
            </Text>
            <Box maxH="300px" overflowY="auto" borderWidth={1} borderRadius="md" p={3}>
              <VStack spacing={3}>
                {selectedFiles.map((file, idx) => (
                  <HStack key={`${file.name}-${idx}`} w="full" justify="space-between">
                    <HStack spacing={3}>
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx + 1}`}
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

        {selectedFiles.length > 0 && <Divider />}

        {/* Passo 2: Estratégia de Ano */}
        {selectedFiles.length > 0 && (
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={3} textAlign="center">
              2) Como definir o ano das fotos?
            </Text>

            <HStack spacing={4} justify="center">
              <Button
                variant={yearStrategy === 'auto' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setYearStrategy('auto')}
                leftIcon={<FaCalendar />}
                size="md"
              >
                Detectar automaticamente (padrão)
              </Button>

              <Button
                variant={yearStrategy === 'override' ? 'solid' : 'outline'}
                colorScheme="green"
                onClick={() => setYearStrategy('override')}
                leftIcon={<FaCalendar />}
                size="md"
              >
                Definir um ano manual
              </Button>
            </HStack>

            <Text fontSize="sm" color="gray.600" mt={2} textAlign="center">
              {yearStrategy === 'auto'
                ? 'Usaremos os metadados EXIF (ou a data do arquivo) para cada foto. Fotos de anos diferentes serão agrupadas automaticamente.'
                : 'Todas as fotos receberão o mesmo ano que você escolher abaixo.'}
            </Text>

            {/* Override controls */}
            {yearStrategy === 'override' && (
              <Box
                mt={4}
                p={4}
                borderWidth={1}
                borderRadius="md"
                bg="green.50"
                borderColor="green.200"
                _dark={{ bg: 'green.900', borderColor: 'green.700' }}
              >
                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="semibold">Escolha um ano para aplicar a todas as fotos</Text>
                  <Select
                    value={overrideYear ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === 'custom') {
                        setOverrideYear('custom');
                      } else if (v === '') {
                        setOverrideYear(null);
                      } else {
                        setOverrideYear(parseInt(v, 10));
                      }
                    }}
                    placeholder="Selecione um ano"
                    bg="white"
                    _dark={{ bg: 'gray.800' }}
                  >
                    {/* Recentes */}
                    {RECENT_YEARS.slice(0, 10).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                    <option value="" disabled>
                      ───────────
                    </option>
                    {/* Décadas */}
                    {DECADES.map((y) => (
                      <option key={y} value={y}>
                        {y}s
                      </option>
                    ))}
                    <option value="" disabled>
                      ───────────
                    </option>
                    <option value="custom">📝 Digitar ano manualmente…</option>
                  </Select>

                  {overrideYear === 'custom' && (
                    <Box>
                      <Input
                        type="number"
                        min="1900"
                        max={CURRENT_YEAR}
                        placeholder={`e.g., ${CURRENT_YEAR}`}
                        value={customYear}
                        onChange={(e) => setCustomYear(e.target.value)}
                        bg="white"
                        _dark={{ bg: 'gray.800' }}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Informe um ano entre 1900 e {CURRENT_YEAR}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}

            {/* Dica com ano mais comum detectado */}
            {yearStrategy === 'auto' && (
              <Box
                mt={4}
                p={3}
                borderWidth={1}
                borderRadius="md"
                bg="blue.50"
                borderColor="blue.200"
                _dark={{ bg: 'blue.900', borderColor: 'blue.700' }}
              >
                <HStack justify="space-between">
                  <Text fontWeight="semibold" color="blue.700" _dark={{ color: 'blue.200' }}>
                    📅 Detecção automática
                  </Text>
                  <Icon
                    as={isAdvancedOpen ? FaChevronUp : FaChevronDown}
                    cursor="pointer"
                    onClick={onAdvancedToggle}
                    color="blue.500"
                  />
                </HStack>
                <Collapse in={isAdvancedOpen}>
                  <Text fontSize="sm" mt={2}>
                    Ano mais frequente entre as fotos: {mostCommonYear ?? 'indisponível'}.
                  </Text>
                  {hasMultipleYears && (
                    <Text fontSize="xs" color="blue.600" _dark={{ color: 'blue.300' }} mt={1}>
                      Encontramos múltiplos anos: {uniqueYears.join(', ')}. Enviaremos em grupos por ano.
                    </Text>
                  )}
                </Collapse>
              </Box>
            )}
          </Box>
        )}

        {/* Resumo */}
        {selectedFiles.length > 0 && (
          <Box
            p={4}
            bg="gray.50"
            borderRadius="md"
            borderWidth={1}
            _dark={{ bg: 'gray.800' }}
          >
            <VStack spacing={3} align="stretch">
              <HStack spacing={2} justify="center">
                <Icon as={FaCalendar} />
                <Text fontSize="md" fontWeight="semibold">
                  📋 Resumo de Upload
                </Text>
              </HStack>
              <Box textAlign="center">
                <Text fontSize="sm">
                  <strong>Estratégia:</strong> {uploadSummaryText}
                </Text>
                {yearStrategy === 'auto' && hasMultipleYears && (
                  <Text fontSize="xs" mt={2}>
                    Enviaremos {Object.keys(groupedFilesByYear).length} grupo(s):{' '}
                    {Object.entries(groupedFilesByYear)
                      .sort((a, b) => b[0] - a[0])
                      .map(([y, files]) => `${y} (${files.length})`)
                      .join(', ')}
                  </Text>
                )}
              </Box>
              {!countryId && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle fontSize="sm">País não selecionado.</AlertTitle>
                  <AlertDescription fontSize="sm">
                    Selecione um país para associar as fotos antes de enviar.
                  </AlertDescription>
                </Alert>
              )}
            </VStack>
          </Box>
        )}

        {/* Passo 3: Upload */}
        {selectedFiles.length > 0 && (
          <Box>
            <Button
              colorScheme="green"
              size="lg"
              onClick={handleUpload}
              isLoading={isLoading}
              leftIcon={<FaCloudUploadAlt />}
              w="full"
              h="56px"
              fontSize="lg"
              isDisabled={yearStrategy === 'override' && !effectiveOverrideYear}
            >
              {(() => {
                if (yearStrategy === 'override') {
                  return effectiveOverrideYear
                    ? `Enviar ${selectedFiles.length} foto(s) com ano ${effectiveOverrideYear}`
                    : 'Informe um ano válido';
                }
                if (hasMultipleYears) {
                  return `Enviar ${selectedFiles.length} foto(s) (agrupadas por ano)`;
                }
                const y = detectedYears[0] ?? CURRENT_YEAR;
                return `Enviar ${selectedFiles.length} foto(s) com ano ${y}`;
              })()}
            </Button>

            <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
              {yearStrategy === 'override'
                ? effectiveOverrideYear
                  ? `Todas as fotos receberão o ano ${effectiveOverrideYear}.`
                  : 'Defina o ano para continuar.'
                : hasMultipleYears
                ? 'As fotos serão automaticamente organizadas e enviadas por ano.'
                : 'Usaremos o ano detectado automaticamente.'}
            </Text>
          </Box>
        )}

        {/* Como funciona */}
        <Box p={4} bg="blue.50" borderRadius="md" _dark={{ bg: 'blue.900' }}>
          <VStack spacing={3} align="stretch">
            <HStack spacing={2} justify="center">
              <Icon as={FaInfoCircle} color="blue.500" />
              <Text fontSize="md" fontWeight="semibold" color="blue.700" _dark={{ color: 'blue.200' }}>
                Como funciona
              </Text>
            </HStack>

            <VStack spacing={2} align="start">
              <HStack spacing={2}>
                <Icon as={FaCloudUploadAlt} color="blue.500" />
                <Text fontSize="sm" color="blue.700" _dark={{ color: 'blue.200' }}>
                  <strong>Seleção de fotos:</strong> escolha várias imagens de uma vez.
                </Text>
              </HStack>

              <HStack spacing={2}>
                <Icon as={FaCalendar} color="blue.500" />
                <Text fontSize="sm" color="blue.700" _dark={{ color: 'blue.200' }}>
                  <strong>Detecção automática:</strong> usamos EXIF (ou data do arquivo) para definir o ano.
                </Text>
              </HStack>

              <HStack spacing={2}>
                <Icon as={FaMapMarkerAlt} color="blue.500" />
                <Text fontSize="sm" color="blue.700" _dark={{ color: 'blue.200' }}>
                  <strong>Ano manual:</strong> opcionalmente, aplique um único ano a todas as fotos.
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </VStack>
    </BaseModal>
  );
};

export default EnhancedImageUploaderModal;
