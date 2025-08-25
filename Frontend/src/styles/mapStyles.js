

// Estilos estáticos para evitar recriações
const STATIC_COLORS = {
  // Cores de países destacados - estáticas para melhor performance
  summerColors: {
    light: [
      { fill: '#FCD34D', border: '#F59E0B', shadow: '#FEF3C7', name: 'sun-yellow' },
      { fill: '#06B6D4', border: '#0891B2', shadow: '#67E8F9', name: 'ocean-blue' },
      { fill: '#10B981', border: '#059669', shadow: '#34D399', name: 'nature-green' },
      { fill: '#F97316', border: '#EA580C', shadow: '#FDBA74', name: 'coral-orange' },
      { fill: '#EC4899', border: '#DB2777', shadow: '#F9A8D4', name: 'summer-pink' },
      { fill: '#8B5CF6', border: '#7C3AED', shadow: '#A78BFA', name: 'violet-sunset' },
      { fill: '#EF4444', border: '#DC2626', shadow: '#F87171', name: 'sunset-red' },
      { fill: '#14B8A6', border: '#0D9488', shadow: '#5EEAD4', name: 'teal-ocean' }
    ],
    dark: [
      { fill: '#6366F1', border: '#4F46E5', shadow: '#8B5CF6', name: 'indigo' },
      { fill: '#10B981', border: '#059669', shadow: '#34D399', name: 'emerald' },
      { fill: '#F59E0B', border: '#D97706', shadow: '#FCD34D', name: 'amber' },
      { fill: '#EF4444', border: '#DC2626', shadow: '#F87171', name: 'red' },
      { fill: '#8B5CF6', border: '#7C3AED', shadow: '#A78BFA', name: 'violet' },
      { fill: '#06B6D4', border: '#0891B2', shadow: '#67E8F9', name: 'cyan' },
      { fill: '#F97316', border: '#EA580C', shadow: '#FDBA74', name: 'orange' },
      { fill: '#EC4899', border: '#DB2777', shadow: '#F9A8D4', name: 'pink' }
    ]
  }
};

// Cache para estilos de países - evita recriação
const countryStyleCache = new Map();

// Função para selecionar países de destaque
export const selectHighlightCountries = (countriesWithPhotos) => {
  console.log('🎯 selectHighlightCountries called with:', countriesWithPhotos);
  
  const maxCountries = 3;
  if (countriesWithPhotos.length > 0) {
    const selectedCountries = countriesWithPhotos
      .slice(0, maxCountries)
      .map(country => country.countryId)
      .sort(() => Math.random() - 0.5);
    
    console.log('🎯 Selected countries from user data:', selectedCountries);
    return selectedCountries;
  } else {
    const fallbackCountries = [
      'us', 'br', 'gb', 'fr', 'de', 'it', 'es', 'jp', 'ca', 'au', 
      'mx', 'ar', 'za', 'in', 'cn', 'ru', 'kr', 'th', 've', 'co'
    ];
    
    const selectedFallback = fallbackCountries
      .sort(() => Math.random() - 0.5)
      .slice(0, maxCountries);
    
    console.log('🎯 Using fallback countries:', selectedFallback);
    return selectedFallback;
  }
};

// Função para obter a cor do oceano baseada no tema - otimizada
export const getOceanColor = (colorMode) => {
  return colorMode === 'dark' ? 'transparent' : '#BAE6FD';
};

// Função para obter a opacidade do oceano baseada no tema - otimizada
export const getOceanOpacity = (colorMode) => {
  return colorMode === 'dark' ? 0 : 0.4;
};

// Função centralizada para obter todos os estilos do oceano - memoizada
const oceanStylesCache = new Map();
export const getOceanStyles = (colorMode) => {
  if (oceanStylesCache.has(colorMode)) {
    return oceanStylesCache.get(colorMode);
  }

  const styles = {
    color: getOceanColor(colorMode),
    opacity: getOceanOpacity(colorMode),
    background: getOceanColor(colorMode),
    fillColor: getOceanColor(colorMode),
    fillOpacity: getOceanOpacity(colorMode)
  };

  oceanStylesCache.set(colorMode, styles);
  return styles;
};

// Função base para criar estilos de países - otimizada com cache
export const createCountryStyleBase = (colors, countriesWithPhotos, highlightedCountries, isLoggedIn, isEffectActive, highlightIntensity, colorMode) => {
  // Chave única para o cache
  const cacheKey = `${isLoggedIn}-${isEffectActive}-${highlightIntensity}-${colorMode}-${countriesWithPhotos.length}-${highlightedCountries.length}`;
  
  if (countryStyleCache.has(cacheKey)) {
    return countryStyleCache.get(cacheKey);
  }

  const styleFunction = (feature) => {
    return createCountryStyle(colors)(feature, countriesWithPhotos, highlightedCountries, isLoggedIn, isEffectActive, highlightIntensity, colorMode);
  };

  countryStyleCache.set(cacheKey, styleFunction);
  return styleFunction;
};

// Função principal para criar estilos de países - otimizada
export const createCountryStyle = (colors) => {
  return (feature, countriesWithPhotos, highlightedCountries, isLoggedIn, isEffectActive, highlightIntensity = 1, colorMode = 'light') => {
    const countryId = feature.properties.iso_a2.toLowerCase();
    const hasPhotos = countriesWithPhotos.some((country) => country.countryId === countryId);
    const isHighlighted = highlightedCountries.includes(countryId);
    
    // Debug logging for specific countries
    if (countryId === 'br' || countryId === 'us' || countryId === 'gb') {
      console.log(`🎨 Style for ${countryId}:`, { hasPhotos, isHighlighted, isLoggedIn, countriesWithPhotosLength: countriesWithPhotos.length });
    }

    // Países destacados para usuários LOGADOS com cores de verão - ESTÁTICO
    if (isLoggedIn && isEffectActive && isHighlighted && hasPhotos) {
      const randomColor = Math.random();
      const colorSets = STATIC_COLORS.summerColors[colorMode === 'dark' ? 'dark' : 'light'];
      const colorIndex = Math.floor(randomColor * colorSets.length);
      const colorSet = colorSets[colorIndex];
      
      return {
        fillColor: colorSet.fill,
        weight: 2,
        color: colorSet.border,
        fillOpacity: 0.7,
        transition: 'all 0.3s ease',
        filter: `drop-shadow(0 1px 4px ${colorSet.shadow}30) brightness(1.02)`,
      };
    }

    // Highlighted countries for non-logged users - MESMAS CORES dos usuários logados
    if (!isLoggedIn && isEffectActive && isHighlighted) {
      const randomColor = Math.random();
      const colorSets = STATIC_COLORS.summerColors[colorMode === 'dark' ? 'dark' : 'light'];
      const colorIndex = Math.floor(randomColor * colorSets.length);
      const colorSet = colorSets[colorIndex];
      
      const opacity = 0.6 + (highlightIntensity * 0.2);
      
      return {
        fillColor: colorSet.fill,
        weight: 2,
        color: colorSet.border,
        fillOpacity: opacity,
        transition: 'all 0.6s ease-in-out',
        filter: `drop-shadow(0 1px 4px ${colorSet.shadow}30) brightness(${1 + highlightIntensity * 0.1})`,
        transform: `scale(${1 + highlightIntensity * 0.01})`,
      };
    }

    // Countries with photos (estado padrão para logados) - ESTÁTICO, sem piscar
    if (isLoggedIn && hasPhotos) {
      return {
        fillColor: colorMode === 'dark' ? '#3B82F6' : '#FCD34D',
        weight: 2.5,
        color: colorMode === 'dark' ? '#1D4ED8' : '#F59E0B',
        fillOpacity: colorMode === 'dark' ? 0.8 : 0.7,
        transition: 'all 0.3s ease',
        filter: `drop-shadow(0 1px 3px ${colorMode === 'dark' ? '#1D4ED820' : '#F59E0B20'}) brightness(1.01)`,
      };
    }

    // Default style - IGUAL para usuários logados e não logados
    return {
      fillColor: colorMode === 'dark' ? '#4B5563' : '#E5E7EB',
      weight: 1.5, 
      color: '#94A3B8', 
      fillOpacity: colorMode === 'dark' ? 0.7 : 0.5, 
      transition: 'all 0.2s ease', 
      className: 'country-gradient-gray',
    };
  };
};

// Função específica para MiniMap - mais eficiente para usuários não logados
const miniMapStyleCache = new Map();
export const createMiniMapStyle = (colorMode) => {
  if (miniMapStyleCache.has(colorMode)) {
    return miniMapStyleCache.get(colorMode);
  }

  const styleFunction = (feature) => ({
    fillColor: colorMode === 'dark' ? '#4B5563' : '#E5E7EB',
    weight: 1.25,
    color: '#94A3B8',
    fillOpacity: 0.7,
    transition: 'all 0.15s ease',
    className: 'country-gradient-gray',
  });

  miniMapStyleCache.set(colorMode, styleFunction);
  return styleFunction;
};

// Função para limpar cache quando necessário
export const clearStyleCache = () => {
  countryStyleCache.clear();
  oceanStylesCache.clear();
  miniMapStyleCache.clear();
};