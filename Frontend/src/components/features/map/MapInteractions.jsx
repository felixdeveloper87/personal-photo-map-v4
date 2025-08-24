import { useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { AuthContext } from '../../../context/AuthContext';

export const useMapInteractions = (countryStyle, countriesWithPhotos, colors) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoggedIn } = useContext(AuthContext);
  const [conversionModal, setConversionModal] = useState({ isOpen: false, country: null });

  // Otimização: criar um Map para busca O(1) ao invés de O(n)
  const countriesWithPhotosMap = useMemo(
    () => new Map(countriesWithPhotos.map(c => [c.countryId, c])),
    [countriesWithPhotos]
  );

  const onEachCountry = useCallback(
    (country, layer) => {
      layer.on({       
        click: () => {
          const countryId = country.properties.iso_a2.toLowerCase();
          const countryName = country.properties.name || country.properties.name_long;
          
          if (!isLoggedIn) {
            // Usuário não logado - mostrar modal de conversão
            setConversionModal({
              isOpen: true,
              country: { id: countryId, name: countryName }
            });
            
            // Toast elegante e profissional para usuários não logados
            toast({
              title: "🔐 Access Required",
              description: `Sign in to explore ${countryName} and unlock detailed insights`,
              status: "info",
              duration: 3000,
              isClosable: true,
              position: "top",
              variant: "subtle",
              containerStyle: {
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
              },
            });
          } else {
            // Busca O(1) para verificar se há fotos usando o Map
            const countryData = countriesWithPhotosMap.get(countryId);
            const hasPhotos = !!countryData;
            const photoCount = countryData?.photoCount || 0;
            
            // Toast elegante e informativo para usuários logados
            toast({
              title: hasPhotos ? "📸 Memories Found!" : "🌍 Exploring New Territory",
              description: hasPhotos 
                ? `You have ${photoCount} photo${photoCount !== 1 ? 's' : ''} in ${countryName}` 
                : `Discovering ${countryName} - Ready to create new memories?`,
              status: hasPhotos ? "success" : "info",
              duration: 2500,
              isClosable: true,
              position: "top",
              variant: "subtle",
              containerStyle: {
                background: hasPhotos 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(59, 130, 246, 0.1)',
                border: hasPhotos 
                  ? '1px solid rgba(16, 185, 129, 0.2)' 
                  : '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
              },
            });
            
            navigate(`/countries/${countryId}`);
          }
        },
        
        // Hover effects mais suaves e profissionais
        mouseover: (e) => {
          if (e.target && e.target.setStyle) {
            e.target.setStyle({
              fillColor: '#22C55E',
              weight: 2,
              color: '#16A34A',
              fillOpacity: 0.8,
              dashArray: '5, 5',
            });
          }
        },
        
        mouseout: (e) => {
          if (e.target && e.target.setStyle) {
            e.target.setStyle(countryStyle(e.target.feature));
          }
        },
      });
      
      // Tooltip mais elegante e informativo
      layer.bindTooltip(
        `<div style="
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #1F2937;
          background: rgba(255, 255, 255, 0.95);
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(8px);
        ">
          ${country.properties.name || country.properties.name_long}
        </div>`,
        {
          permanent: false,
          direction: 'top',
          className: 'country-tooltip-enhanced',
          offset: [0, -8],
          sticky: true,
        }
      );
    },
    [navigate, countriesWithPhotosMap, toast, setConversionModal, isLoggedIn, countryStyle]
  );

  return { onEachCountry, conversionModal, setConversionModal };
};