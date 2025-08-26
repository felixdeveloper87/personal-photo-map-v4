import React from 'react';
import { HStack, Box } from '@chakra-ui/react';
import { ModernUpgradeToPremiumButton, ModernPhotoStorageButton, ModernCountriesVisitedButton, ModernTimelineButton, ModernSearchButton } from '../../ui/buttons/HeaderButtons';
import SearchForm from '../../features/SearchForm';

const HeaderActions = ({ 
  styles, 
  colorMode, 
  toggleColorMode, 
  isLoggedIn, 
  isPremium, 
  onPremiumClick,
  onPhotoStorageClick,
  onCountriesClick,
  countriesWithPhotos,
  onSearch,
  onTimelineClick
}) => {
  return (
    <Box my={2}>
      <HStack spacing={6} align="center">
        {/* Botões de funcionalidades para usuários logados - Counters */}
        {isLoggedIn && (
          <>
            <ModernPhotoStorageButton
              onClick={onPhotoStorageClick}
              size="md"
              aria-label="Photo Storage"
            />

            <ModernCountriesVisitedButton
              onClick={onCountriesClick}
              size="md"
              aria-label="Countries Visited"
            />
          </>
        )}

        {/* Botão Premium */}
        {isLoggedIn && !isPremium && (
          <ModernUpgradeToPremiumButton
            onClick={onPremiumClick}
            size="md"
          />
        )}

        {/* Search e Timeline - Apenas para usuários logados */}
        {isLoggedIn && (
          <>
            {/* Botão de busca visível */}
            <ModernSearchButton
              onClick={() => {
                // Encontrar e clicar no botão oculto do SearchForm
                const searchTrigger = document.querySelector('[data-search-trigger]');
                if (searchTrigger) {
                  searchTrigger.click();
                }
              }}
              size="md"
              aria-label="Search Photos"
            />
            
            <SearchForm
              countriesWithPhotos={countriesWithPhotos}
              onSearch={onSearch}
            />
            <ModernTimelineButton
              onClick={onTimelineClick}
              size="md"
              _hover={{
                transform: "translateY(-2px) scale(1.02)",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              }}
            >
              Timelineee
            </ModernTimelineButton>
          </>
        )}
      </HStack>
    </Box>
  );
};

export default React.memo(HeaderActions);
