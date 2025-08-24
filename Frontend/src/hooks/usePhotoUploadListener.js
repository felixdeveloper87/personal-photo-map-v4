import { useEffect, useContext } from 'react';
import { CountriesContext } from '../context/CountriesContext';

/**
 * Hook personalizado para detectar uploads de fotos e atualizar o cache automaticamente.
 * 
 * Funcionalidades:
 * - Escuta eventos de upload de fotos
 * - Atualiza automaticamente o cache de países
 * - Mantém dados sincronizados em tempo real
 * 
 * @returns {Object} Objeto com métodos para forçar atualização
 */
export const usePhotoUploadListener = () => {
  const { forceRefresh } = useContext(CountriesContext);

  useEffect(() => {
    // Função para lidar com eventos de upload
    const handlePhotoUpload = (event) => {
      console.log('📸 Photo upload detected, refreshing cache...');
      
      // Força atualização imediata do cache
      forceRefresh();
    };

    // Função para lidar com eventos de exclusão
    const handlePhotoDelete = (event) => {
      console.log('🗑️ Photo deletion detected, refreshing cache...');
      
      // Força atualização imediata do cache
      forceRefresh();
    };

    // Função para lidar com eventos de modificação
    const handlePhotoModify = (event) => {
      console.log('✏️ Photo modification detected, refreshing cache...');
      
      // Força atualização imediata do cache
      forceRefresh();
    };

    // Escuta eventos customizados de upload
    window.addEventListener('photo-upload', handlePhotoUpload);
    window.addEventListener('photo-delete', handlePhotoDelete);
    window.addEventListener('photo-modify', handlePhotoModify);

    // Escuta eventos de storage (para sincronização entre abas)
    const handleStorageChange = (event) => {
      if (event.key === 'photo-upload-timestamp') {
        console.log('📸 Photo upload detected via storage, refreshing cache...');
        forceRefresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup dos event listeners
    return () => {
      window.removeEventListener('photo-upload', handlePhotoUpload);
      window.removeEventListener('photo-delete', handlePhotoDelete);
      window.removeEventListener('photo-modify', handlePhotoModify);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [forceRefresh]);

  // Função para disparar evento de upload (usada pelos componentes de upload)
  const triggerPhotoUpload = () => {
    console.log('📸 Triggering photo upload event...');
    
    // Dispara evento customizado
    window.dispatchEvent(new CustomEvent('photo-upload'));
    
    // Atualiza timestamp no storage para sincronização entre abas
    localStorage.setItem('photo-upload-timestamp', Date.now().toString());
  };

  // Função para disparar evento de exclusão
  const triggerPhotoDelete = () => {
    console.log('🗑️ Triggering photo deletion event...');
    
    window.dispatchEvent(new CustomEvent('photo-delete'));
    localStorage.setItem('photo-upload-timestamp', Date.now().toString());
  };

  // Função para disparar evento de modificação
  const triggerPhotoModify = () => {
    console.log('✏️ Triggering photo modification event...');
    
    window.dispatchEvent(new CustomEvent('photo-modify'));
    localStorage.setItem('photo-upload-timestamp', Date.now().toString());
  };

  return {
    triggerPhotoUpload,
    triggerPhotoDelete,
    triggerPhotoModify,
  };
};

