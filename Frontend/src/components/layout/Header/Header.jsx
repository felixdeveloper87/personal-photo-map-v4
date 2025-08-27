import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  useDisclosure,
  useToast,
  IconButton,
  useColorMode,
  useBreakpointValue,
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
  const { isLoggedIn, fullname, isPremium, logout } = useContext(AuthContext);
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

  const styles = useHeaderStyles(colorMode);

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
              display={{ base: "inline-flex", lg: "none" }}
              variant="ghost"
              color={styles.textColor}
              fontSize="2.2rem"
              p={2}
            />
            <HeaderLogo styles={styles} onClick={() => navigate("/")} />
          </HStack>

          {/* CENTRO: Navegação e ações principais (desktop) */}
          <HStack
            spacing={stackSpacing}
            align="center"
            flex="1"
            justify="center"
            display={{ base: "none", lg: "flex" }}
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
            display={{ base: "none", lg: "flex" }}
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
