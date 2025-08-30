import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import PhotoGallery from './PhotoGallery';
import EnhancedImageUploaderModal from '../../modals/EnhancedImageUploaderModal';
import { CountriesContext } from '../../../context/CountriesContext';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import LoginModal from '../../modals/LoginModal';
import RegisterModal from '../../modals/RegisterModal';
import { buildApiUrl } from '../../../utils/apiConfig';
import {
  Box,
  Button,
  Text,
  Flex,
  Wrap,
  WrapItem,
  Input,
  useToast,
  useDisclosure,
  Icon,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from '../../ui/CustomToast';
import {
  DeleteAllByYearButton,
  CreateAlbumButton,
  DeleteAlbum,
  DeleteByYearButton
} from '../../ui/buttons/CustomButtons';
import {
  ShowAllButton,
  YearSelectableButton,
  AlbumSelectableButton,

} from "../../ui/buttons/SelectableButtons";

/**
 * Returns a headers object containing the Authorization token, if any.
 * Used to authenticate requests to the backend.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Handles authentication errors by checking if the token is invalid/expired
 * and automatically logging out the user if needed.
 */
const handleAuthError = (response, error) => {
  if (response.status === 401) {
    console.warn('🔐 Authentication failed - token may be expired or invalid');
    
    // Show user-friendly error message
    toast({
      title: "Session Expired",
      description: "Your login session has expired. Please log in again.",
      status: "warning",
      duration: 5000,
      isClosable: true,
    });
    
    // Clear invalid token and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('fullname');
    localStorage.removeItem('email');
    localStorage.removeItem('premium');
    
    // Redirect to home/login page after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    
    return true; // Indicates auth error was handled
  }
  return false; // Auth error was not handled
};

/* ---------------- Fetchers (GET) ---------------- */

/**
 * Fetches a list of years for which the country has images.
 * @param {string} countryId - The country identifier (e.g., "br").
 * @returns {Promise<Array<number>>} Array of available years.
 */
async function fetchYears(countryId) {
  const response = await fetch(
    buildApiUrl(`/api/images/${countryId}/available-years`),
    { headers: getAuthHeaders() }
  );
  if (!response.ok) {
    if (handleAuthError(response)) return [];
    throw new Error(`Error fetching years: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches albums associated with a particular country.
 * @param {string} countryId - The country identifier (e.g., "br").
 * @returns {Promise<Array>} Array of album objects.
 */
async function fetchAlbums(countryId) {
  const response = await fetch(
    buildApiUrl(`/api/albums/${countryId}`),
    { headers: getAuthHeaders() }
  );
  if (!response.ok) {
    if (handleAuthError(response)) return [];
    throw new Error(`Error fetching albums: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches images based on a country and optional filters (year, album).
 * @param {string} countryId - The country identifier.
 * @param {number} [year] - Optional year filter for images.
 * @param {string} [albumId] - Optional album ID filter for images.
 * @param {boolean} showAllSelected - Whether to display all images from the country.
 * @returns {Promise<Array>} Array of image objects (filePaths, IDs, etc.)
 */
async function fetchImages(countryId, year, albumId, showAllSelected) {
  let url = buildApiUrl(`/api/images/${countryId}`);
  if (albumId) {
    url = buildApiUrl(`/api/albums/${albumId}/images`);
  } else if (year && !showAllSelected) {
    url += `/${year}`;
  }

  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    if (handleAuthError(response)) return [];
    throw new Error(`Error fetching images: ${response.status}`);
  }
  return response.json();
}

/**
 * PhotoManager Component
 *
 * Manages displaying and handling images for a given country, including:
 * - Uploading new images
 * - Filtering images by year or album
 * - Deleting images, albums, or all photos
 * - Creating new albums (Premium feature)
 */
const PhotoManager = ({ countryId, onUploadSuccess }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isPremium } = useContext(AuthContext);
  const { refreshCountriesWithPhotos, refreshAfterUpload, triggerMapUpdate } = useContext(CountriesContext);
  const navigate = useNavigate();

  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);
  const [pendingAlbumId, setPendingAlbumId] = useState(null);
  const [yearToDelete, setYearToDelete] = useState(null);

  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onClose: onDeleteConfirmClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteAlbumOpen,
    onOpen: onDeleteAlbumOpen,
    onClose: onDeleteAlbumClose,
  } = useDisclosure();

  const {
    isOpen: isYearDeleteOpen,
    onOpen: onYearDeleteOpen,
    onClose: onYearDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isAllDeleteOpen,
    onOpen: onAllDeleteOpen,
    onClose: onAllDeleteClose,
  } = useDisclosure();



  // EnhancedImageUploaderModal state
  const {
    isOpen: isImageUploaderOpen,
    onOpen: onImageUploaderOpen,
    onClose: onImageUploaderClose,
  } = useDisclosure();

  // Handle upload success
  const handleUploadSuccess = async () => {   
    try {
      // 1. Trigger immediate map update for instant visual feedback
      triggerMapUpdate();
      
      // 2. Use specialized upload refresh that bypasses cache
      await refreshAfterUpload();
  
      await Promise.all([
        queryClient.invalidateQueries(['allImages', countryId]),
        queryClient.invalidateQueries(['years', countryId]),
        queryClient.invalidateQueries(['albums', countryId]),
        queryClient.refetchQueries(['allImages', countryId]),
        queryClient.refetchQueries(['years', countryId]),
        queryClient.refetchQueries(['albums', countryId])
      ]);      
      // 4. Final trigger for any remaining UI updates
      triggerMapUpdate();
      
    } catch (error) {
      console.error('❌ Error during upload success processing:', error);
      showErrorToast(toast, 'Photos uploaded but page refresh failed. Please refresh manually.');
    } finally {
      onImageUploaderClose();
    }
  };

  /** Local UI state */
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [showAllSelected, setShowAllSelected] = useState(false);

  /** Stores the IDs of images the user has selected for deletion/album creation */
  const [selectedImageIds, setSelectedImageIds] = useState([]);

  /** Check if the user is logged in */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const loginModal = useDisclosure();
  const registerModal = useDisclosure();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (!token) {
      loginModal.onOpen();
    }
  }, [loginModal]);

  /* ---------------- useQuery Calls ---------------- */

  // Fetch years for the given country
  const {
    data: yearsData = [],
    isLoading: isLoadingYears,
    isError: isErrorYears,
  } = useQuery({
    queryKey: ['years', countryId],
    queryFn: () => fetchYears(countryId),
    enabled: !!countryId && isLoggedIn,
  });

  // Fetch albums for the given country
  const {
    data: albumsData = [],
    isLoading: isLoadingAlbums,
    isError: isErrorAlbums,
  } = useQuery({
    queryKey: ['albums', countryId],
    queryFn: () => fetchAlbums(countryId),
    enabled: !!countryId && isLoggedIn,
  });

  // Fetch all images for the given country (for display and album creation)
  const {
    data: allImagesData = [],
    isLoading: isLoadingAllImages,
    isError: isErrorAllImages,
  } = useQuery({
    queryKey: ['allImages', countryId],
    queryFn: () => fetchImages(countryId, null, null, true), // Fetch all images
    enabled: !!countryId && !!isLoggedIn,
  });

  // Fetch filtered images for the given country, filtered by year/album if selected
  const {
    data: imagesData = [],
    isLoading: isLoadingImages,
    isError: isErrorImages,
    refetch: refetchImages,
  } = useQuery({
    queryKey: ['images', countryId, selectedYear, selectedAlbum, showAllSelected],
    queryFn: () => fetchImages(countryId, selectedYear, selectedAlbum, showAllSelected),
    enabled:
      !!countryId &&
      !!isLoggedIn &&
      !!(selectedYear || selectedAlbum || showAllSelected),
    // Only fetch images if the user selects a year, album, or toggles 'Show All'
  });

  /* ---------------- Mutations (POST/DELETE) ---------------- */

  // Deleting multiple images
  const deleteImagesMutation = useMutation({
    mutationFn: async (ids) => {
      const response = await fetch(
        buildApiUrl('/api/images/delete-multiple'),
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(ids),
        }
      );
      if (!response.ok) {
        throw new Error('Error deleting images.');
      }
      return response;
    },
    onSuccess: async (_, ids) => {
      showSuccessToast(toast, `${ids.length} image(s) deleted successfully.`);
      // Trigger immediate map update
      triggerMapUpdate();
      
      try {
        // Invalidate relevant queries so React Query refetches fresh data
        await Promise.all([
          queryClient.invalidateQueries(['images']),
          queryClient.invalidateQueries(['years']),
          queryClient.invalidateQueries(['albums'])
        ]);
        
        await refreshCountriesWithPhotos(true);
        
        // Final trigger for UI update
        triggerMapUpdate();
      } catch (error) {
        console.error('❌ Error during delete success processing:', error);
      }
      
      setSelectedImageIds([]);
    },
    onError: () => {
      showErrorToast(toast, 'There was an error deleting the images.');
    },
  });

  // Creating a new album (Premium only)
  const createAlbumMutation = useMutation({
    mutationFn: async ({ countryId, albumName, imageIds }) => {
      const response = await fetch(buildApiUrl('/api/albums'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ countryId, albumName, imageIds }),
      });
      if (!response.ok) {
        throw new Error('Error creating album.');
      }
      return response.json();
    },
    onSuccess: () => {
      showSuccessToast(toast, 'The album was successfully created.');
      setNewAlbumName('');
      setSelectedImageIds([]);
      queryClient.invalidateQueries(['albums']);
    },
    onError: () => {
      showErrorToast(toast, 'There was an error creating the album.');
    },
  });

  // Delete an entire album
  const deleteAlbumMutation = useMutation({
    mutationFn: async (albumId) => {
      const response = await fetch(
        buildApiUrl(`/api/albums/${albumId}`),
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`Error deleting album: ${response.statusText}`);
      }
      return response;
    },
    onSuccess: async () => {
      showSuccessToast(toast, 'The album was deleted successfully.');
      // Trigger immediate map update
      triggerMapUpdate();
      
      try {
        await Promise.all([
          queryClient.invalidateQueries(['albums']),
          queryClient.invalidateQueries(['images']),
          queryClient.invalidateQueries(['years'])
        ]);
        
        await refreshCountriesWithPhotos(true);
        
        // Final trigger for UI update
        triggerMapUpdate();
      } catch (error) {
        console.error('❌ Error during album delete success processing:', error);
      }
    },
    onError: () => {
      showErrorToast(toast, 'There was an error deleting the album.');
    },
  });

  // Delete images by year
  const deleteImagesByYearMutation = useMutation({
    mutationFn: async ({ countryId, year }) => {
      const response = await fetch(
        buildApiUrl(`/api/images/${countryId}/${year}`),
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`Error deleting images from year ${year}: ${response.status}`);
      }
      return response;
    },
    onSuccess: async (_, { year }) => {
      showSuccessToast(toast, `All images from year ${year} were deleted successfully.`);
      // Trigger immediate map update
      triggerMapUpdate();
      
      try {
        await Promise.all([
          queryClient.invalidateQueries(['images']),
          queryClient.invalidateQueries(['years']),
          queryClient.invalidateQueries(['albums'])
        ]);
        
        await refreshCountriesWithPhotos(true);
        
        // Final trigger for UI update
        triggerMapUpdate();
      } catch (error) {
        console.error('❌ Error during year delete success processing:', error);
      }
      
      setSelectedYear(null);
    },
    onError: (_, { year }) => {
      showErrorToast(toast, `There was an error deleting images from year ${year}.`);
    },
  });

  // Delete all images for an entire country
  const deleteAllImagesByCountryMutation = useMutation({
    mutationFn: async (countryId) => {
      const response = await fetch(
        buildApiUrl(`/api/images/delete-all-images/${countryId}`),
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(
          `Error deleting all images of ${countryId.toUpperCase()}: ${response.statusText}`
        );
      }
      return response;
    },
    onSuccess: async () => {
      showSuccessToast(toast, 'All images were deleted successfully.');
      // Trigger immediate map update
      triggerMapUpdate();
      
      try {
        await Promise.all([
          queryClient.invalidateQueries(['images']),
          queryClient.invalidateQueries(['years']),
          queryClient.invalidateQueries(['albums'])
        ]);
        
        await refreshCountriesWithPhotos(true);
        
        // Final trigger for UI update
        triggerMapUpdate();
      } catch (error) {
        console.error('❌ Error during all images delete success processing:', error);
      }
      
      setShowAllSelected(false);
    },
    onError: (_, countryId) => {
      showErrorToast(toast, `Error deleting all images of ${countryId?.toUpperCase()}.`);
    },
  });

  /* ---------------- Handlers ---------------- */

  /**
   * Called after a successful image upload from ImageUploader.
   * Optionally invalidates queries or triggers re-fetch to show new images.
   */
  const handleUpload = async (newImages, year) => {   
    try {
      // 1. Trigger immediate map update for instant visual feedback
      triggerMapUpdate();
      
      // 2. Invalidate queries to refetch new data
      await Promise.all([
        queryClient.invalidateQueries(['images']),
        queryClient.invalidateQueries(['years']),
        queryClient.invalidateQueries(['albums'])
      ]);
      
      // 3. Optionally call an onUploadSuccess prop
      if (onUploadSuccess) {
        await onUploadSuccess();
      }
      
      // 4. Refresh countries context with forced refresh
      await refreshCountriesWithPhotos(true);
      
      // 5. Final trigger for any remaining UI updates
      triggerMapUpdate();
      
    } catch (error) {
      console.error('❌ Error in handleUpload:', error);
      showErrorToast(toast, 'Upload completed but refresh failed. Please refresh the page.');
    }
  };

  /**
   * Attempts to create an album if user is Premium and
   * has selected at least one image. Otherwise shows a warning toast.
   */
  const handleCreateAlbum = () => {
    if (!isPremium) {
      showWarningToast(toast, 'Album creation is available only for premium users.');
      return;
    }

    if (!newAlbumName.trim()) {
      showWarningToast(toast, 'Please enter a name for the album.');
      return;
    }

    if (selectedImageIds.length === 0) {
      showWarningToast(toast, 'Please select at least one image.');
      return;
    }

    createAlbumMutation.mutate({
      countryId,
      albumName: newAlbumName,
      imageIds: selectedImageIds,
    });
  };

  /**
   * Deletes multiple selected images after user confirms.
   * @param {Array<string>} ids - The IDs of the images to delete.
   */
  const handleDeleteMultipleImages = (ids) => {
    if (ids.length === 0) {
      showWarningToast(toast, 'Please select at least one image.');
      return;
    }

    setPendingDeleteIds(ids.map(id => Number(id)));
    onDeleteConfirmOpen();
  };

  /**
   * Deletes an entire album after user confirmation.
   * @param {string} albumId - The ID of the album to delete.
   */
  const handleDeleteAlbum = (albumId) => {
    setPendingAlbumId(albumId);
    onDeleteAlbumOpen();
  };


  /**
   * Deletes all images from a selected year for the current country.
   * @param {number} year - The year from which to delete images.
   */
  const handleDeleteImagesByYear = (year) => {
    setYearToDelete(year);
    onYearDeleteOpen();
  };

  /**
   * Deletes ALL images for the current country.
   */
  const handleDeleteAllImagesByCountry = () => {
    onAllDeleteOpen();
  };


  /**
   * Toggles the selected year. If the same year is clicked again, deselect.
   */
  const toggleYearSelection = (year) => {
    setSelectedYear((prevYear) => (prevYear === year ? null : year));
    setSelectedAlbum(null);
    setShowAllSelected(false);
  };

  /**
   * Toggles the selected album. If the same album is clicked again, deselect.
   */
  const toggleAlbumSelection = (albumId) => {
    setSelectedAlbum((prev) => (prev === albumId ? null : albumId));
    setSelectedYear(null);
    setShowAllSelected(false);
  };

  /**
   * Toggles whether to display all images regardless of year or album filter.
   */
  const toggleShowAll = () => {
    setShowAllSelected((prev) => !prev);
    setSelectedYear(null);
    setSelectedAlbum(null);
  };

  /**
   * Convert allImagesData from the backend into the shape <PhotoGallery> needs.
   * Use useMemo to prevent recreating the array on every render.
   */
  const allImages = useMemo(() => 
    Array.isArray(allImagesData)
      ? allImagesData.map((image) => ({
        url: image.filePath.includes('s3.') ? image.filePath : buildApiUrl(image.filePath),
        id: image.id,
        year: image.year,
      }))
      : [],
    [allImagesData]
  );

  /**
   * Convert filtered imagesData from the backend into the shape <PhotoGallery> needs.
   * Use useMemo to prevent recreating the array on every render.
   */
  const images = useMemo(() => 
    Array.isArray(imagesData)
      ? imagesData.map((image) => ({
        url: image.filePath.includes('s3.') ? image.filePath : buildApiUrl(image.filePath),
        id: image.id,
        year: image.year,
      }))
      : [],
    [imagesData]
  );

  /**
   * Filter out only albums that actually contain images.
   * Use useMemo to prevent recreating the array on every render.
   */
  const albumsWithImages = useMemo(() => 
    Array.isArray(albumsData)
      ? albumsData.filter((album) => album.images && album.images.length > 0)
      : [],
    [albumsData]
  );

  return (
    <Box>
      {/* Controls Section - Filters */}
      <Box mb={4}>

        {/* Album Creation (Premium) - Only show if user has photos */}
        {isPremium && allImages.length > 0 && (
          <Flex mb={4} justify="center" >
            <Input
              placeholder="Album Name"
              value={newAlbumName}
              border="1px"
              borderColor="teal.800"
              onChange={(e) => setNewAlbumName(e.target.value)}
              width="200px"
              mr={2}
            />
            <CreateAlbumButton
              onClick={handleCreateAlbum}
              isLoading={createAlbumMutation.isLoading}
            >
              Create Album
            </CreateAlbumButton>
          </Flex>
        )}

        {/* Inspirational Message when no photos */}
        {allImages.length === 0 && (
          <Box 
            textAlign="center" 
            py={8} 
            px={6} 
            bg="blue.50" 
            borderRadius="xl"
            border="2px dashed"
            borderColor="blue.200"
            mb={4}
          >
            <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={3}>
              🌍 Your Journey Starts Here!
            </Text>
            <Text fontSize="lg" color="blue.700" mb={4} lineHeight="1.6">
              This country is waiting for your stories! Capture unique moments, 
              explore stunning landscapes and share your adventures with the world.
            </Text>
            <Text fontSize="md" color="blue.600" fontWeight="medium" mb={4}>
              ✈️ Take your first photo and start building your travel memories!
            </Text>
            
            {/* Upload Button */}
            <Button
              size="lg"
              colorScheme="blue"
              leftIcon={<Icon as={FaCloudUploadAlt} />}
              onClick={onImageUploaderOpen}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg"
              }}
              transition="all 0.3s ease"
            >
              Take First Photo
            </Button>
          </Box>
        )}

        {/* Year and Album Selection - Only show if there are photos */}
        {allImages.length > 0 && (
          <Wrap spacing={3} justify="center">
            {/* List of Years */}
            {yearsData.map((year) => (
              <WrapItem key={year}>
                <YearSelectableButton
                  year={year}
                  isSelected={selectedYear === year}
                  onClick={() => toggleYearSelection(year)}
                />
              </WrapItem>
            ))}

            {/* List of Albums that have images */}
            {albumsWithImages.map((album) => (
              <WrapItem key={album.id}>
                <AlbumSelectableButton
                  album={album}
                  isSelected={selectedAlbum === album.id}
                  onClick={() => toggleAlbumSelection(album.id)}
                />
              </WrapItem>
            ))}

            {/* "Show All" Button */}
            {(yearsData.length > 1 || (yearsData.length >= 1 && albumsWithImages.length >= 1)) && (
              <WrapItem>
                <ShowAllButton isSelected={showAllSelected} onClick={toggleShowAll} />
              </WrapItem>
            )}
          </Wrap>
        )}
      </Box>

      {/* Image Display */}
      {((selectedYear || selectedAlbum || showAllSelected) && isLoadingImages) || 
       (!(selectedYear || selectedAlbum || showAllSelected) && isLoadingAllImages) ? (
        <Text mt={1} mb={2} textAlign="center">
          Loading photos...
        </Text>
      ) : (selectedYear || selectedAlbum || showAllSelected) ? (
        // Show filtered images
        images.length > 0 ? (
          <PhotoGallery
            images={images}
            onDeleteSelectedImages={handleDeleteMultipleImages}
            selectedImageIds={selectedImageIds}
            setSelectedImageIds={setSelectedImageIds}
          />
        ) : (
          <Box 
            textAlign="center" 
            py={6} 
            px={4} 
            bg="gray.50" 
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="lg" color="gray.600" mb={2}>
              📸 Nenhuma foto encontrada para os filtros selecionados
            </Text>
            <Text fontSize="sm" color="gray.500">
              Tente selecionar outro ano ou álbum
            </Text>
          </Box>
        )
      ) : (
        // Show all images when no filters are selected
        allImages.length > 0 && (
          <PhotoGallery
            images={allImages}
            onDeleteSelectedImages={handleDeleteMultipleImages}
            selectedImageIds={selectedImageIds}
            setSelectedImageIds={setSelectedImageIds}
          />
        )
      )}
      {(selectedYear || selectedAlbum) && (
        <Flex
          mt={2}
          justify="center"
          direction={{ base: "column", sm: "row" }}
          align="center"
          gap={3}

        >
          {selectedAlbum && (
            <DeleteAlbum
              onClick={() => handleDeleteAlbum(selectedAlbum)}
              isLoading={deleteAlbumMutation.isLoading} borderRadius="xl"
            />
          )}

          {selectedYear && (
            <DeleteByYearButton
              year={selectedYear}
              onClick={() => handleDeleteImagesByYear(selectedYear)}
              isLoading={deleteImagesByYearMutation.isLoading}
            />
          )}
        </Flex>
      )}

      {/* Delete all country images */}
      {showAllSelected && (
        <Flex mt={2} justify="center">
          <DeleteAllByYearButton
            year={selectedYear}
            onClick={onAllDeleteOpen}
            isLoading={deleteAllImagesByCountryMutation.isLoading}
          />
        </Flex>
      )}

      {/* 🔒 Modals de Confirmação */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={onDeleteConfirmClose}
        onConfirm={() => {
          deleteImagesMutation.mutate(pendingDeleteIds);
          onDeleteConfirmClose();
        }}
        title="Delete Images"
        message={`Are you sure you want to delete ${pendingDeleteIds.length} image(s)? This action cannot be undone.`}
      />

      <ConfirmDialog
        isOpen={isDeleteAlbumOpen}
        onClose={onDeleteAlbumClose}
        onConfirm={() => {
          deleteAlbumMutation.mutate(pendingAlbumId);
          onDeleteAlbumClose();
        }}
        title="Delete Album"
        message="Are you sure you want to delete this album and all of its images?"
      />

      <ConfirmDialog
        isOpen={isYearDeleteOpen}
        onClose={onYearDeleteClose}
        onConfirm={() => {
          deleteImagesByYearMutation.mutate({ countryId, year: yearToDelete });
          onYearDeleteClose();
        }}
        title="Delete Images by Year"
        message={`Are you sure you want to delete all images from year ${yearToDelete}? This action cannot be undone.`}
      />

      <ConfirmDialog
        isOpen={isAllDeleteOpen}
        onClose={onAllDeleteClose}
        onConfirm={() => {
          deleteAllImagesByCountryMutation.mutate(countryId);
          onAllDeleteClose();
        }}
        title="Delete All Images"
        message={`Are you sure you want to delete all images of ${countryId.toUpperCase()}? This action cannot be undone.`}
      />

      {/* Authentication Modals */}
      <LoginModal
        isOpen={loginModal.isOpen}
        onClose={loginModal.onClose}
        onSwitchToRegister={() => {
          loginModal.onClose();
          registerModal.onOpen();
        }}
      />
      <RegisterModal
        isOpen={registerModal.isOpen}
        onClose={registerModal.onClose}
        onSwitchToLogin={() => {
          registerModal.onClose();
          loginModal.onOpen();
        }}
      />

      {/* Enhanced Image Upload Modal */}
      <EnhancedImageUploaderModal
        countryId={countryId}
        onUploadSuccess={handleUploadSuccess}
        isOpen={isImageUploaderOpen}
        onClose={onImageUploaderClose}
      />

    </Box>
  );
};

export default PhotoManager;
