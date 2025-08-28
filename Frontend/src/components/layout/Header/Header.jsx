import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  useDisclosure,
  useToast,
  IconButton,
  useMediaQuery,
  useColorMode,
  useBreakpointValue,
  Container,
  HStack,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

import { AuthContext } from "../../../context/AuthContext";
import { CountriesContext } from "../../../context/CountriesContext";
import { buildApiUrl } from "../../../utils/apiConfig";

// Estilos centralizados
import {
  useHeaderStyles,
  headerContainerStyles,
} from "../../../styles/headerStyles";

// Componentes do header
import HeaderLogo from "./HeaderLogo";
import HeaderActions from "./HeaderActions";
import HeaderAuth from "./HeaderAuth";
import HeaderUser from "./HeaderUser";
import HeaderMobile from "./HeaderMobile";
import {
  ModernThemeToggleButton,
  ModernLogoutButton,
  ModernMapButton,
} from "../../ui/buttons/HeaderButtons";

// Modais
import UserProfileModal from "../../modals/UserProfileModal";
import PremiumBenefitsModal from "../../modals/PremiumBenefitsModal";
import PhotoStorageModal from "../../modals/PhotoStorageModal";
import UserStatisticsModal from "../../modals/UserStatisticsModal";
import LoginModal from "../../modals/LoginModal";
import RegisterModal from "../../modals/RegisterModal";

const Header = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  // Contextos
  const { isLoggedIn, fullname, isPremium, logout, upgradeToPremium } = useContext(AuthContext);
  const { countriesWithPhotos, photoCount, countryCount } =
    useContext(CountriesContext);

  // Disclosures
  const mobileMenu = useDisclosure();
  const photoStorageModal = useDisclosure();
  const userStatisticsModal = useDisclosure();
  const profileModal = useDisclosure();
  const premiumModal = useDisclosure();
  const loginModal = useDisclosure();
  const registerModal = useDisclosure();

  // States
  const [isUpgrading, setIsUpgrading] = useState(false);

  const styles = useHeaderStyles(colorMode);

  // Handle premium upgrade
  const handlePremiumUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // Try direct API call first to debug the issue
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔍 Debug: Trying direct API call...');
      const debugUrl = buildApiUrl('/api/users/make-premium');
      console.log('🔍 Debug URL:', debugUrl);
      console.log('🔍 Debug Token:', token.substring(0, 20) + '...');
      console.log('🔍 Debug Token Length:', token.length);
      console.log('🔍 Debug Token Format:', token.startsWith('Bearer ') ? 'Has Bearer prefix' : 'No Bearer prefix');
      console.log('🔍 Debug Token JWT Format:', token.includes('.') ? 'Looks like JWT' : 'Not JWT format');

      // Test 1: Try with different HTTP methods
      console.log('🔍 Test 1: Trying PUT method...');
      let debugResponse = await fetch(debugUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (debugResponse.status === 403) {
        console.log('🔍 Test 2: PUT failed, trying POST method...');
        debugResponse = await fetch(debugUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      if (debugResponse.status === 403) {
        console.log('🔍 Test 3: POST failed, trying GET method...');
        debugResponse = await fetch(debugUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      // Test 4: Try a different endpoint to see if it's an auth issue or endpoint issue
      if (debugResponse.status === 403) {
        console.log('🔍 Test 4: All methods failed, testing auth with different endpoint...');
        const testUrl = buildApiUrl('/api/auth/validate');
        const testResponse = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('🔍 Test 4 Result - /api/auth/validate status:', testResponse.status);
        
        // Test 5: Get user details to see what permissions they have
        if (testResponse.ok) {
          try {
            const userData = await testResponse.json();
            console.log('🔍 Test 5: User data from /api/auth/validate:', userData);
          } catch (parseError) {
            console.log('🔍 Test 5: Could not parse user data:', parseError);
          }
        }

        // Test 6: Try to access a different protected endpoint to see if it's a general issue
        console.log('🔍 Test 6: Testing access to other protected endpoints...');
        try {
          const usersUrl = buildApiUrl('/api/auth/users');
          const usersResponse = await fetch(usersUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          console.log('🔍 Test 6 Result - /api/auth/users status:', usersResponse.status);
        } catch (testError) {
          console.log('🔍 Test 6 Error:', testError);
        }

        // Test 7: Check if user is already premium (this could cause 403)
        console.log('🔍 Test 7: Checking current premium status...');
        console.log('🔍 Current isPremium state:', isPremium);
        console.log('🔍 Current localStorage premium value:', localStorage.getItem('premium'));
      }

      console.log('🔍 Debug Response Status:', debugResponse.status);
      console.log('🔍 Debug Response Headers:', Object.fromEntries(debugResponse.headers.entries()));

      if (!debugResponse.ok) {
        const debugErrorText = await debugResponse.text();
        console.log('🔍 Debug Error Text:', debugErrorText);
        
        // Handle 403 Forbidden specifically - this means user is authenticated but lacks permission
        if (debugResponse.status === 403) {
          throw new Error('Access denied. Premium upgrade is currently restricted. This feature may require admin approval or may not be available for self-service. Please contact support for assistance.');
        }
        
        // Try the context function as fallback for other errors
        console.log('🔄 Trying context function as fallback...');
        await upgradeToPremium();
      } else {
        console.log('✅ Direct API call successful!');
        // Update premium status manually
        localStorage.setItem('premium', 'true');
        window.location.reload(); // Refresh to update UI
      }

      toast({
        title: "Premium Upgrade Successful! 🎉",
        description: "Welcome to Premium! You now have access to all premium features.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      premiumModal.onClose();
    } catch (error) {
      console.error('💥 Header upgrade error:', error);
      
      let errorMessage = error.message || "Please try again later.";
      
      // Handle specific error cases
      if (error.message.includes('Access denied') || error.message.includes('restricted')) {
        errorMessage = "Premium upgrade is currently restricted. Please contact support for assistance.";
        // Don't redirect to login for permission issues
      } else if (error.message.includes('session has expired') || error.message.includes('log in again')) {
        errorMessage = "Your session has expired. Please log in again to continue.";
        // Only redirect to login for actual authentication issues
        setTimeout(() => {
          loginModal.onOpen();
        }, 2000);
      } else if (error.message.includes('Access forbidden')) {
        errorMessage = "You don't have permission to upgrade. Please contact support.";
      }
      
      toast({
        title: "Upgrade Failed",
        description: errorMessage,
        status: "error",
        duration: 8000, // Longer duration for important messages
        isClosable: true,
        position: "top-right",
      });
      
      // Only show login modal for actual authentication issues, not permission issues
      if (error.message.includes('session has expired') || error.message.includes('log in again')) {
        setTimeout(() => {
          loginModal.onOpen();
        }, 3000);
      }
    } finally {
      setIsUpgrading(false);
    }
  };

  // ====== Responsividade (somente desktop) ======
  // Tamanhos de botões aumentam conforme os breakpoints (lg, xl, 2xl)
  const buttonSize = useBreakpointValue({
    base: "sm", // não afeta pois desktop está oculto no base, mas mantém coerência
    lg: "sm",
    xl: "md",
    "2xl": "lg",
  });

  // Espaçamento dos HStacks em desktop
  const stackSpacing = useBreakpointValue({
    base: 4, // idem acima
    lg: 4,
    xl: 6,
    "2xl": 8,
  });

  // Largura máxima da área central em desktop
  const centerMaxW = useBreakpointValue({
    lg: "800px",
    xl: "960px",
    "2xl": "1140px",
  });

  // Mostrar versão compacta (hamburger + logo map button) em larguras <= 1380px
  const [isCompact] = useMediaQuery("(max-width: 1380px)");

  return (
    <Box as="header" w="100%" position="relative" zIndex={100}>
      <Container maxW="container.xl" {...headerContainerStyles(styles)}>
        <Flex align="center" justify="space-between" w="100%" h="auto" gap={6}>
          {/* ESQUERDA: Logo (canto esquerdo) */}
          <HStack spacing={4} align="center" flex="0 0 auto">
            {/* Botão Hamburguer (mobile) */}
            <IconButton
              aria-label={mobileMenu.isOpen ? "Close menu" : "Open menu"}
              icon={mobileMenu.isOpen ? <CloseIcon /> : <HamburgerIcon />}
              onClick={
                mobileMenu.isOpen ? mobileMenu.onClose : mobileMenu.onOpen
              }
              display={isCompact ? "inline-flex" : "none"}
              variant="ghost"
              color={styles.textColor}
              fontSize="2.2rem"
              p={2}
            />
            <HeaderLogo styles={styles} onClick={() => navigate("/")} />
            {/* Map button next to logo for compact layouts */}
            <ModernMapButton
              isLoggedIn={isLoggedIn}
              onClick={() =>
                isLoggedIn ? navigate("/map/private") : navigate("/map")
              }
              size={buttonSize}
              aria-label="Go to Map"
              display={isCompact ? "inline-flex" : "none"}
            />
          </HStack>

          {/* CENTRO: Navegação e ações principais (desktop) */}
          <HStack
            spacing={stackSpacing}
            align="center"
            flex="1"
            justify="center"
            display={isCompact ? "none" : "flex"}
            maxW={centerMaxW}
          >
            {/* Botão Map - responsivo */}
            <ModernMapButton
              isLoggedIn={isLoggedIn}
              onClick={() =>
                isLoggedIn ? navigate("/map/private") : navigate("/map")
              }
              size={buttonSize}
              aria-label="Go to Map"
            />

            {isLoggedIn && (
              <HeaderUser
                styles={styles}
                fullname={fullname}
                isPremium={isPremium}
                onProfileClick={profileModal.onOpen}
              />
            )}

            {isLoggedIn && (
              <HeaderActions
                styles={styles}
                colorMode={colorMode}
                toggleColorMode={toggleColorMode}
                isLoggedIn={isLoggedIn}
                isPremium={isPremium}
                onPremiumClick={premiumModal.onOpen}
                onPhotoStorageClick={photoStorageModal.onOpen}
                onCountriesClick={userStatisticsModal.onOpen}
                countriesWithPhotos={countriesWithPhotos}
                onSearch={(p) =>
                  navigate(`/countries/${p.country}?year=${p.year}`)
                }
                onTimelineClick={() => navigate("/timeline")}
                // Prop opcional para componentes internos adotarem tamanho
                buttonSize={buttonSize}
                // Você pode também passar paddings/margens responsivos, se necessário
              />
            )}
          </HStack>

          {/* DIREITA: Theme Toggle + Auth/Logout (desktop) */}
          <HStack
            spacing={stackSpacing}
            align="center"
            flex="0 0 auto"
            display={isCompact ? "none" : "flex"}
          >
            <ModernThemeToggleButton
              colorMode={colorMode}
              toggleColorMode={toggleColorMode}
              styles={styles}
              size={buttonSize}
            />

            {!isLoggedIn ? (
              <HeaderAuth
                styles={styles}
                onLoginClick={loginModal.onOpen}
                onRegisterClick={registerModal.onOpen}
                // Caso o componente repasse para botões internos
                size={buttonSize}
              />
            ) : (
              <ModernLogoutButton
                onClick={() => {
                  logout();
                  navigate("/"); // Redireciona para a landing page após logout
                  toast({
                    title: "Logged out",
                    status: "info",
                    duration: 2000,
                    isClosable: true,
                  });
                }}
                size={buttonSize}
              />
            )}
          </HStack>
        </Flex>
      </Container>

      {/* MENU MOBILE (aparece somente no base…lg) */}
      <HeaderMobile
  isCompact={isCompact}
        isOpen={mobileMenu.isOpen}
        styles={styles}
        colorMode={colorMode}
        toggleColorMode={toggleColorMode}
        isLoggedIn={isLoggedIn}
        fullname={fullname}
        isPremium={isPremium}
        photoCount={photoCount}
        countryCount={countryCount}
        countriesWithPhotos={countriesWithPhotos}
        onProfileClick={() => {
          profileModal.onOpen();
          mobileMenu.onClose();
        }}
        onPremiumClick={() => {
          premiumModal.onOpen();
          mobileMenu.onClose();
        }}
        onPhotoStorageClick={() => {
          photoStorageModal.onOpen();
          mobileMenu.onClose();
        }}
        onCountriesClick={() => {
          userStatisticsModal.onOpen();
          mobileMenu.onClose();
        }}
        onTimelineClick={() => {
          navigate("/timeline");
          mobileMenu.onClose();
        }}
        onSearch={(p) => navigate(`/countries/${p.country}?year=${p.year}`)}
        onLoginClick={() => {
          loginModal.onOpen();
          mobileMenu.onClose();
        }}
        onRegisterClick={() => {
          registerModal.onOpen();
          mobileMenu.onClose();
        }}
        onLogout={() => {
          logout();
          navigate("/"); // Redireciona para a landing page após logout
          mobileMenu.onClose();
          toast({
            title: "Logged out",
            status: "info",
            duration: 2000,
            isClosable: true,
          });
        }}
        onClose={mobileMenu.onClose} // ⬅️ fecha pelo X no topo
      />

      {/* MODAIS */}
      <UserProfileModal
        isOpen={profileModal.isOpen}
        onClose={profileModal.onClose}
        fullname={fullname}
        email={""} // TODO: Adicionar email do usuário quando disponível
        photoCount={photoCount}
        countryCount={countryCount}
        isPremium={isPremium}
      />
      <PremiumBenefitsModal
        isOpen={premiumModal.isOpen}
        onClose={premiumModal.onClose}
        onUpgrade={handlePremiumUpgrade}
        isLoading={isUpgrading}
      />
      <PhotoStorageModal
        isOpen={photoStorageModal.isOpen}
        onClose={photoStorageModal.onClose}
      />
      <UserStatisticsModal
        isOpen={userStatisticsModal.isOpen}
        onClose={userStatisticsModal.onClose}
      />
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
    </Box>
  );
};

export default Header;
