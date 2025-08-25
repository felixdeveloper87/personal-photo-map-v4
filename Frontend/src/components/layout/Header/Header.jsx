import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  useDisclosure,
  useToast,
  IconButton,
  useColorMode,
  Container,
  HStack,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

import { AuthContext } from "../../../context/AuthContext";
import { CountriesContext } from "../../../context/CountriesContext";

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
import { ModernThemeToggleButton, ModernLogoutButton, ModernMapButton } from "../../ui/buttons/HeaderButtons";

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
  const { isLoggedIn, fullname, isPremium, logout } = useContext(AuthContext);
  const { countriesWithPhotos, photoCount, countryCount } = useContext(CountriesContext);

  // Disclosures
  const mobileMenu = useDisclosure();
  const photoStorageModal = useDisclosure();
  const userStatisticsModal = useDisclosure();
  const profileModal = useDisclosure();
  const premiumModal = useDisclosure();
  const loginModal = useDisclosure();
  const registerModal = useDisclosure();

  const styles = useHeaderStyles(colorMode);

  return (
    <Box as="header" w="100%" position="relative" zIndex={100}>
      <Container maxW="container.xl" {...headerContainerStyles(styles)}>
        <Flex align="center" justify="space-between" w="100%" gap={4}>
          {/* ESQUERDA: Logo + Map Button + (opcional) toggle no desktop */}
          <HStack spacing={3} align="center">
            {/* Botão Hamburguer (mobile) */}
            <IconButton
              aria-label={mobileMenu.isOpen ? "Close menu" : "Open menu"}
              icon={mobileMenu.isOpen ? <CloseIcon /> : <HamburgerIcon />}
              onClick={mobileMenu.isOpen ? mobileMenu.onClose : mobileMenu.onOpen}
              display={{ base: "inline-flex", lg: "none" }}
              variant="ghost"
              color={styles.textColor}
              fontSize="2.2rem"
              p={2}
            />
            <HeaderLogo styles={styles} onClick={() => navigate("/")} />

            {/* Botão Map - sempre visível */}
            <ModernMapButton
              isLoggedIn={isLoggedIn}
              onClick={() => isLoggedIn ? navigate("/map/private") : navigate("/map")}
              size="md"
              aria-label="Go to Map"
            />
          </HStack>

          {/* CENTRO: escondido no mobile para não “quebrar” quando logado */}
          <HStack
            spacing={6}
            align="center"
            flex={1}
            justify="center"
            display={{ base: "none", lg: "flex" }} // ⬅️ importante
          >
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
                onSearch={(p) => navigate(`/countries/${p.country}?year=${p.year}`)}
                onTimelineClick={() => navigate("/timeline")}
              />
            )}
          </HStack>

          {/* DIREITA: Auth / Toggle / Logout etc. (desktop) */}
          <HStack spacing={8} align="center" display={{ base: "none", lg: "flex" }}>
            <ModernThemeToggleButton
              colorMode={colorMode}
              toggleColorMode={toggleColorMode}
              styles={styles}
            />
            {!isLoggedIn ? (
              <HeaderAuth
                styles={styles}
                onLoginClick={loginModal.onOpen}
                onRegisterClick={registerModal.onOpen}
              />
            ) : (
              <ModernLogoutButton
                onClick={() => {
                  logout();
                  navigate('/'); // Redireciona para a landing page após logout
                  toast({
                    title: "Logged out",
                    status: "info",
                    duration: 2000,
                    isClosable: true,
                  });
                }}
                size="md"
              />
            )}
          </HStack>
        </Flex>
      </Container>

      {/* MENU MOBILE (aparece somente no base…lg) */}
      <HeaderMobile
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
          navigate('/'); // Redireciona para a landing page após logout
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
      <PremiumBenefitsModal isOpen={premiumModal.isOpen} onClose={premiumModal.onClose} />
      <PhotoStorageModal isOpen={photoStorageModal.isOpen} onClose={photoStorageModal.onClose} />
      <UserStatisticsModal isOpen={userStatisticsModal.isOpen} onClose={userStatisticsModal.onClose} />
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
