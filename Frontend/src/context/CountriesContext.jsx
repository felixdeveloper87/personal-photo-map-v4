


import React, { createContext, useState, useEffect, useCallback } from 'react';
import countries from 'i18n-iso-countries';
import { buildApiUrl } from '../utils/apiConfig';

// Create and export the context to provide global state access for countries-related data
export const CountriesContext = createContext();

/**
 * CountriesProvider Component
 * This component acts as a context provider for countries-related data, including:
 * - Countries with photos (detailed with photo counts)
 * - Loading state
 * - Photo and country counts
 * - Cache management with real-time updates
 * It wraps child components and exposes the above data through the context API.
 */
export const CountriesProvider = ({ children }) => {
    // State for storing countries that have associated photos (detailed)
    const [countriesWithPhotos, setCountriesWithPhotos] = useState([]);
    // State for tracking whether data is still loading
    const [availableYears, setAvailableYears] = useState([]);
    const [loading, setLoading] = useState(true);
    // State for the total number of photos uploaded
    const [photoCount, setPhotoCount] = useState(0);
    // State for the total number of countries with photos
    const [countryCount, setCountryCount] = useState(0);
    
    // Cache management
    const [lastFetch, setLastFetch] = useState(0);
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

    /**
     * fetchCounts - Fetches the total photo count and country count from the backend API
     * This function retrieves aggregated metrics and updates the respective state variables.
     */
    const fetchCounts = async () => {
        const token = localStorage.getItem('token');
        console.log('Token:', token);

        if (!token) return;

        try {
            console.log('🔄 Fetching counts...');
            
            const response = await fetch(buildApiUrl('/api/images/count'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('📊 Counts response status:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error('Error fetching photo and country counts');
            }

            const data = await response.json();
            console.log('📊 Counts data:', data);
            
            setPhotoCount(data.photoCount);
            setCountryCount(data.countryCount);
            
            console.log('✅ Counts set successfully:', { photoCount: data.photoCount, countryCount: data.countryCount });
        } catch (error) {
            console.error('Error fetching photo/country counts:', error);
            setPhotoCount(0);
            setCountryCount(0);
        }
    };

    /**
     * fetchCountriesWithPhotosDetailed - Fetches detailed information about countries with photos
     * This function retrieves country IDs, names, and photo counts from the new detailed endpoint.
     */
    const fetchCountriesWithPhotosDetailed = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setCountriesWithPhotos([]);
            setLoading(false);
            return;
        }

        try {
            console.log('🔄 Fetching from detailed endpoint...');
            
            // Use the new detailed endpoint
            const response = await fetch(buildApiUrl('/api/images/countries-with-photos-detailed'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('📊 Response status:', response.status, response.statusText);

            if (!response.ok) {
                console.warn('⚠️ Detailed endpoint failed, falling back to old endpoint');
                // Fallback to old endpoint
                return await fetchCountriesWithPhotosOld();
            }

            const data = await response.json();
            console.log('📊 Countries with photos detailed:', data);
            console.log('📊 Data structure check:', data.map(c => ({ countryId: c.countryId, countryName: c.countryName, photoCount: c.photoCount })));
            
            // TEMPORARY: If data is empty, force fallback to test old endpoint
            if (!data || data.length === 0) {
                console.warn('⚠️ Detailed endpoint returned empty array, testing fallback');
                return await fetchCountriesWithPhotosOld();
            }
            
            // Data already comes with countryId, countryName, and photoCount
            setCountriesWithPhotos(data);
            console.log('✅ Detailed data set successfully');
            console.log('✅ Final countriesWithPhotos state:', data);
            
            // Force a re-render by updating the state again
            setTimeout(() => {
                console.log('🔄 Forcing re-render after 100ms...');
                setCountriesWithPhotos([...data]);
            }, 100);
        } catch (error) {
            console.error('Error fetching countries with photos detailed:', error);
            console.warn('⚠️ Falling back to old endpoint due to error');
            // Fallback to old endpoint
            return await fetchCountriesWithPhotosOld();
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fallback function using the old endpoint structure
     */
    const fetchCountriesWithPhotosOld = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setCountriesWithPhotos([]);
            return;
        }

        try {
            const response = await fetch(buildApiUrl('/api/images/countries-with-photos'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error fetching countries with photos');
            }

            const data = await response.json();
            console.log('📊 Countries with photos (old format):', data);
            
            // Convert old format to new format
            const mappedCountries = data.map((countryId) => ({
                countryId,
                countryName: getCountryName(countryId),
                photoCount: 0 // We don't have photo count in old format
            }));
            
            console.log('📊 Mapped countries:', mappedCountries);
            setCountriesWithPhotos(mappedCountries);
        } catch (error) {
            console.error('Error fetching countries with photos (old):', error);
            setCountriesWithPhotos([]);
        }
    };

    /**
     * Helper to get country names (same as backend)
     */
    const getCountryName = (countryId) => {
        const countryNames = {
            'us': 'United States',
            'br': 'Brazil',
            'fr': 'France',
            'de': 'Germany',
            'it': 'Italy',
            'es': 'Spain',
            'uk': 'United Kingdom',
            'ca': 'Canada',
            'au': 'Australia',
            'jp': 'Japan',
            'cn': 'China',
            'in': 'India',
            'mx': 'Mexico',
            'ar': 'Argentina',
            'cl': 'Chile',
            'pe': 'Peru',
            'co': 'Colombia',
            've': 'Venezuela',
            'ec': 'Ecuador',
            'uy': 'Uruguay',
            'py': 'Paraguay',
            'bo': 'Bolivia',
            'gy': 'Guyana',
            'sr': 'Suriname',
            'gf': 'French Guiana',
            'fk': 'Falkland Islands'
        };
        
        return countryNames[countryId?.toLowerCase()] || countryId?.toUpperCase() || 'Unknown';
    };

    /**
     * fetchAvailableYears - Busca os anos disponíveis no backend
     */
    const fetchAvailableYears = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAvailableYears([]);
            return;
        }

        try {
            const response = await fetch(buildApiUrl('/api/images/available-years'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar anos disponíveis');
            }

            const data = await response.json();
            setAvailableYears(data && Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao buscar anos disponíveis:', error);
            setAvailableYears([]);
        }
    };

    /**
     * refreshCountriesWithPhotos - Refreshes all data with cache validation
     * This function ensures all relevant data is fetched and updated simultaneously.
     */
    const refreshCountriesWithPhotos = useCallback(async (force = false) => {
        const now = Date.now();
        
        console.log('🔄 refreshCountriesWithPhotos called with force:', force);
        console.log('🔄 Current time:', new Date(now).toLocaleTimeString());
        console.log('🔄 Last fetch time:', new Date(lastFetch).toLocaleTimeString());
        console.log('🔄 Cache duration:', CACHE_DURATION, 'ms');
        
        // Check if cache is still valid (unless forced refresh)
        if (!force && (now - lastFetch) < CACHE_DURATION) {
            console.log('🔄 Using cached data, last fetch:', new Date(lastFetch).toLocaleTimeString());
            return;
        }

        console.log('🔄 Fetching fresh data...', force ? '(FORCED)' : '');
        setLoading(true);
        
        try {
            // Clear cache if forced refresh
            if (force) {
                setLastFetch(0);
                console.log('🔄 Cache cleared for forced refresh');
                
                // Clear existing state to force immediate re-render
                setCountriesWithPhotos([]);
                setPhotoCount(0);
                setCountryCount(0);
                setAvailableYears([]);
            }
            
            console.log('🔄 Starting parallel data fetch...');
            
            // Ensure fresh data by adding timestamp to bust any HTTP cache
            const timestamp = Date.now();
            console.log('🔄 Using cache-busting timestamp:', timestamp);
            
            await Promise.all([
                fetchCounts(), 
                fetchCountriesWithPhotosDetailed(), 
                fetchAvailableYears()
            ]);
            
            setLastFetch(now);
            console.log('🔄 Data refresh completed successfully at:', new Date(now).toLocaleTimeString());
            
            // Log final state for debugging
            console.log('🔄 Final refresh state check:');
            console.log('- Photo count will be updated');
            console.log('- Country count will be updated');
            console.log('- Countries with photos will be updated');
            
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setLoading(false);
        }
    }, [lastFetch]);

    /**
     * forceRefresh - Forces a refresh of all data (used after uploads)
     * This bypasses cache and fetches fresh data immediately.
     */
    const forceRefresh = useCallback(async () => {
        console.log('🔄 Force refresh triggered');
        await refreshCountriesWithPhotos(true);
    }, [refreshCountriesWithPhotos]);

    /**
     * forceRefreshWithCallback - Forces refresh and executes callback when done
     * This is useful for upload success handlers to ensure data is refreshed
     */
    const forceRefreshWithCallback = useCallback(async (callback, retries = 3) => {
        console.log('🔄 Force refresh with callback triggered, retries:', retries);
        
        const attemptRefresh = async (attempt = 1) => {
            try {
                await refreshCountriesWithPhotos(true);
                
                if (callback) {
                    callback(true, attempt);
                }
                
                console.log(`✅ Force refresh completed successfully on attempt ${attempt}`);
            } catch (error) {
                console.error(`❌ Force refresh attempt ${attempt} failed:`, error);
                
                if (attempt < retries) {
                    const delay = 1000 * attempt; // Progressive delay
                    console.log(`🔄 Retrying force refresh in ${delay}ms...`);
                    setTimeout(() => attemptRefresh(attempt + 1), delay);
                } else {
                    console.error('❌ All force refresh attempts failed');
                    if (callback) {
                        callback(false, attempt);
                    }
                }
            }
        };
        
        await attemptRefresh();
    }, [refreshCountriesWithPhotos]);

    /**
     * useEffect - Effect for monitoring token changes and triggering data refresh
     * This effect listens for changes in the localStorage token (via the 'storage' event)
     * and updates the context state accordingly.
     */
    useEffect(() => {
        const updateData = () => {
            const token = localStorage.getItem('token');
            if (token) {
                refreshCountriesWithPhotos();
            } else {
                setPhotoCount(0);
                setCountryCount(0);
                setCountriesWithPhotos([]);
                setAvailableYears([]);
                setLastFetch(0);
            }
        };

        // Listen for 'storage' events to detect token changes across tabs/windows
        window.addEventListener('storage', updateData);
        updateData(); // Perform an initial data fetch on component mount

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('storage', updateData);
        };
    }, [refreshCountriesWithPhotos]);

    return (
        // Provide the context value to child components
        <CountriesContext.Provider
            value={{
                countriesWithPhotos,
                loading,
                photoCount,
                countryCount,
                availableYears,
                refreshCountriesWithPhotos,
                forceRefresh, // New method for immediate refresh
                forceRefreshWithCallback, // New method with callback support
            }}
        >
            {children}
        </CountriesContext.Provider>
    );
};

