import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  IconButton,
  Collapse,
  Flex,
  Center,
  Button,
} from "@chakra-ui/react";
import { FaImages, FaMap, FaUser, FaSignOutAlt, FaMoon, FaSun, FaTimes } from "react-icons/fa";
import { 
  ModernUpgradeToPremiumButton, 
  ModernLoginButton, 
  ModernRegisterButton,
  ModernPhotoStorageButton,
  ModernCountriesVisitedButton,
  ModernSearchButton,
  ModernTimelineButton
} from "../../ui/buttons/HeaderButtons";
import SearchForm from "../../features/SearchForm";
import {
  userProfileCardStyles,
  mobileMenuStyles,
  themeToggleStyles,
  counterCardEnhancedStyles,
} from "../../../styles/headerStyles";
import { useNavigate } from "react-router-dom";

/**
 * HeaderMobile
 * Responsável SOMENTE pela renderização do menu mobile.
 * Recebe todos os dados e handlers via props; não mantém estado de modais nem contexto.
 */
const HeaderMobile = ({
  isOpen,
  isCompact,
  styles,
  colorMode,
  toggleColorMode,
  isLoggedIn,
  fullname,
  isPremium,
  photoCount,
  countryCount,
  countriesWithPhotos,
  onProfileClick,
  onPremiumClick,
  onPhotoStorageClick,
  onCountriesClick,
  onTimelineClick,
  onSearch,
  onLoginClick,
  onRegisterClick,
  onLogout,
  onClose, // ⬅️ novo: para fechar pelo X no topo
}) => {
  const navigate = useNavigate();

  return (
    <Box display={isCompact ? "block" : "none"}>
      <Collapse in={isOpen} animateOpacity>
        <Box
          {...mobileMenuStyles(styles)}
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}
          w="100%"
          mt="0"
          boxShadow="0 10px 30px rgba(0,0,0,0.3)"
          backdropFilter="blur(12px)"
          overflow="hidden"
        >
          {/* Barra superior: fechar (esq) e tema (dir), alinhados com o conteúdo */}
          <Flex
            align="center"
            justify="space-between"
            px={4}
            pt={3}
            pb={2}
            position="sticky"
            top={0}
            zIndex={10}
          >
            <IconButton
              aria-label="Close menu"
              icon={<FaTimes />}
              onClick={onClose}
              size="sm"
              variant="ghost"
              color={styles.textColor}
            />
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
              onClick={toggleColorMode}
              size="sm"
              variant="ghost"
              color={styles.textColor}
              {...themeToggleStyles?.(styles)}
            />
          </Flex>

          {isLoggedIn ? (
            <VStack align="stretch" spacing={3} px={4} pt={2} pb={4}>
              {/* Perfil do Usuário */}
              <Flex
                {...userProfileCardStyles(styles)}
                align="center"
                cursor="pointer"
                onClick={onProfileClick}
                w="full"
                justify="center"
              >
                <Avatar
                  size="md"
                  name={fullname}
                  mr={4}
                  bg={isPremium ? styles.premiumGradient : styles.accentColor}
                  color="white"
                  ring="3px"
                  ringColor={isPremium ? styles.premiumBorderColor : "rgba(255, 255, 255, 0.3)"}
                  transition="all 0.3s ease"
                />
                <Box textAlign="center">
                  <Text color={styles.textColor} fontSize="lg" fontWeight="700">
                    {fullname}
                  </Text>
                  {isPremium && (
                    <Badge
                      mt={2}
                      colorScheme="yellow"
                      variant="solid"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      PREMIUM ✨
                    </Badge>
                  )}
                </Box>
              </Flex>

              {/* Botões de funcionalidades - usando os mesmos do desktop */}
              <Box w="full">
                {/* Grid de botões quadrados 2x2 */}
                <Box
                  display="grid"
                  gridTemplateColumns="1fr 1fr"
                  gap={3}
                  w="full"
                >
                  {/* Photo Storage Button */}
                  <ModernPhotoStorageButton
                    onClick={onPhotoStorageClick}
                    w="full"
                    h="80px"
                    size="md"
                    borderRadius="xl"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                  />


                  {/* Countries Visited Button */}
                  <ModernCountriesVisitedButton
                    onClick={onCountriesClick}
                    w="full"
                    h="80px"
                    size="md"
                    borderRadius="xl"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                  />

                  {/* Search Button */}
                  <ModernSearchButton
                    onClick={() => {
                      // Encontrar e clicar no botão oculto do SearchForm
                      const searchTrigger = document.querySelector('[data-search-trigger]');
                      if (searchTrigger) {
                        searchTrigger.click();
                      }
                      // Não fechar o menu imediatamente para permitir que o usuário use o SearchForm
                      // O menu será fechado quando o SearchForm for fechado
                    }}
                    w="full"
                    h="80px"
                    size="md"
                    borderRadius="xl"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                  />

                  {/* Timeline Button */}
                  <ModernTimelineButton
                    onClick={onTimelineClick}
                    w="full"
                    h="80px"
                    size="md"
                    borderRadius="xl"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                  />
                </Box>
              </Box>

              {/* Upgrade Premium */}
              {!isPremium && (
                <ModernUpgradeToPremiumButton
                  onClick={() => {
                    onPremiumClick();
                    onClose?.();
                  }}
                  w="full"
                />
              )}

              {/* Logout */}
              <Flex
                w="full"
                bg={styles.cardBg}
                color={styles.warningColor}
                border="1px solid"
                borderColor={styles.cardBorder}
                borderRadius="xl"
                p={4}
                align="center"
                justify="center"
                cursor="pointer"
                onClick={() => {
                  onLogout();
                  navigate('/'); // Redireciona para a landing page após logout
                  onClose?.();
                }}
                _hover={{
                  bg: styles.cardHover,
                  transform: "translateY(-2px)",
                  boxShadow: styles.cardShadowHover,
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                backdropFilter="blur(20px)"
              >
                <FaSignOutAlt size={20} />
                <Text ml={3} fontWeight="600">
                  Logout
                </Text>
              </Flex>

              {/* SearchForm para usuários logados */}
              <SearchForm
                countriesWithPhotos={countriesWithPhotos}
                onSearch={onSearch}
                onClose={onClose}
              />
            </VStack>
          ) : (
            <VStack spacing={6} px={4} pt={2} pb={4}>
              <HStack justify="center" w="full">
                <Text color={styles.textColor} fontSize="lg" fontWeight="600">
                  Welcome to Photomap
                </Text>
              </HStack>
              {/* Map button is rendered next to the logo in Header.jsx for compact layouts */}
              <ModernLoginButton
                onClick={onLoginClick}
                w="full"
                size="md"
              />
              <ModernRegisterButton
                onClick={onRegisterClick}
                w="full"
                size="md"
              />
            </VStack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default React.memo(HeaderMobile);
