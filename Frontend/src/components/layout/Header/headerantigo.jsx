// import React, { useContext, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Box,
//   Flex,
//   Heading,
//   Image,
//   Text,
//   useDisclosure,
//   useToast,
//   IconButton,
//   VStack,
//   HStack,
//   Collapse,
//   useColorMode,
//   useColorModeValue,
//   Badge,
//   Container,
//   Avatar,
//   Divider,
// } from "@chakra-ui/react";
// import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
// import { AuthContext } from "../../context/AuthContext";
// import { CountriesContext } from "../../context/CountriesContext";
// import SearchForm from "../features/SearchForm";
// import UserProfileModal from "../modals/UserProfileModal";
// import PremiumBenefitsModal from "../modals/PremiumBenefitsModal";
// import PhotoStorageModal from "../modals/PhotoStorageModal";
// import CountriesVisitedModal from "../modals/CountriesVisitedModal";
// import LoginModal from "../modals/LoginModal";
// import RegisterModal from "../modals/RegisterModal";
// import logo from "../../assets/logo.png";
// import { FaMoon, FaSun, FaImages, FaMap, FaCrown, FaUser, FaSignOutAlt } from "react-icons/fa";
// import {
//   SignOutButton,
//   TimelineButton,
//   UpgradeToPremiumButton,
// } from "../ui/buttons/CustomButtons";
// import {
//   ModernSearchButton,
//   ModernTimelineButton,
//   ModernLoginButton,
//   ModernRegisterButton,
//   CompactSearchButton,
//   CompactTimelineButton,
// } from "../ui/buttons/ModernButtons";
// import { showSuccessToast, showErrorToast } from "../ui/CustomToast";
// import { 
//   useHeaderStyles, 
//   headerContainerStyles, 
//   cardStyles, 
//   mobileMenuStyles,
//   logoStyles,
//   themeToggleStyles,
//   counterCardStyles,
//   userProfileCardStyles,
//   counterCardEnhancedStyles
// } from "../../styles/headerStyles";

// function Header() {
//   const navigate = useNavigate();
//   const toast = useToast();
//   const { colorMode, toggleColorMode } = useColorMode();
//   const { isOpen, onToggle, onClose } = useDisclosure();
  
//   // Debug para verificar o estado do menu
//   console.log('Menu mobile isOpen:', isOpen);
//   const photoStorageModal = useDisclosure();
//   const countriesModal = useDisclosure();
//   const profileModal = useDisclosure();
//   const premiumModal = useDisclosure();
//   const loginModal = useDisclosure();
//   const registerModal = useDisclosure();

//   // Estilos centralizados do header
//   const styles = useHeaderStyles();

//   // Auth and Countries contexts
//   const { isLoggedIn, fullname, email, isPremium, updatePremiumStatus, logout } =
//     useContext(AuthContext);
//   const { countriesWithPhotos, photoCount, countryCount } =
//     useContext(CountriesContext);

//   // Simplified premium upgrade handler
//   const handleBecomePremium = async () => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/auth/users/make-premium`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       if (!response.ok) throw new Error("Failed to upgrade to premium");
//       updatePremiumStatus(true);
//       showSuccessToast(toast, "You are now a Premium user!");
//       premiumModal.onClose();
//     } catch (error) {
//       showErrorToast(toast, "Failed to become premium.");
//     }
//   };

//   return (
//     <Box
//       {...headerContainerStyles(styles.backgroundPattern)}
//       bgGradient={styles.bgGradient}
//       boxShadow={styles.boxShadow}
//     >
//               <Container maxW="1400px" px={4}>
//           <Flex justify="space-between" align="center" py={4} position="relative">
//           {/* Modern Logo & Brand */}
//           <Flex
//             {...logoStyles(styles)}
//             onClick={() => navigate("/")}
//           >
//             <Image 
//               src={logo} 
//               alt="Photomap Logo" 
//               h="52px" 
//               mr={4}
//               filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
//             />
//             <Box>
//               <Heading
//                 as="h1"
//                 size="lg"
//                 color={styles.logoTextColor}
//                 fontWeight="900"
//                 letterSpacing="tight"
//                 textShadow="0 2px 4px rgba(0,0,0,0.1)"
//                 fontSize={{ base: "xl", md: "2xl" }}
//               >
//                 Photomap
//               </Heading>
//               <Text
//                 color={styles.logoSubtextColor}
//                 fontSize={{ base: "xs", md: "sm" }}
//                 fontWeight="600"
//                 opacity={0.9}
//                 letterSpacing="wide"
//                 textShadow="0 1px 2px rgba(0,0,0,0.05)"
//               >
//                  Capture • Explore • Remember
//               </Text>
//             </Box>
//           </Flex>

//           {/* Theme Toggle Button */}
//           <IconButton
//             {...themeToggleStyles(styles)}
//             icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
//             onClick={toggleColorMode}
//             color={styles.textColor}
//             display={{ base: "none", lg: "flex" }}
//             ml={4}
//           />

//           {/* Mobile Menu Toggle */}
//           <IconButton
//             display={{ base: "flex", lg: "none" }}
//             onClick={() => {
//               console.log('Toggle clicked, current isOpen:', isOpen);
//               onToggle();
//             }}
//             icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
//             variant="ghost"
//             color={styles.textColor}
//             size="lg"
//             bg={isOpen ? styles.cardHover : styles.cardBg}
//             border="1px solid"
//             borderColor={styles.cardBorder}
//             borderRadius="xl"
//             _hover={{ 
//               bg: styles.cardHover, 
//               transform: "scale(1.05)",
//               boxShadow: styles.cardShadow
//             }}
//             transition="all 0.2s ease"
//             aria-label={isOpen ? "Close Navigation" : "Open Navigation"}
//             backdropFilter="blur(20px)"
//           />

//           {/* Desktop Navigation */}
//           <HStack display={{ base: "none", lg: "flex" }} spacing={4} flex={1} justify="flex-end" ml={8}>
//             {isLoggedIn ? (
//               <>
//                 {/* User Profile Card */}
//                 <Flex
//                   {...userProfileCardStyles(styles)}
//                   align="center"
//                   cursor="pointer"
//                   onClick={profileModal.onOpen}
//                   minW="180px"
//                   justify="center"
//                 >
//                   <Avatar
//                     size="sm"
//                     name={fullname}
//                     mr={3}
//                     bg={isPremium ? styles.premiumGradient : styles.accentColor}
//                     color="white"
//                     ring="3px"
//                     ringColor={isPremium ? styles.premiumBorderColor : "rgba(255, 255, 255, 0.3)"}
//                     filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
//                     transition="all 0.3s ease"
//                     _groupHover={{
//                       transform: "scale(1.1)",
//                       ringColor: isPremium ? styles.premiumBorderColor : "rgba(255, 255, 255, 0.5)"
//                     }}
//                   />
//                   <Box textAlign="left">
//                     <Text 
//                       color={styles.textColor} 
//                       fontSize="sm" 
//                       fontWeight="700"
//                       lineHeight="1.2"
//                       transition="all 0.3s ease"
//                       _groupHover={{
//                         color: styles.accentColor,
//                         textShadow: "0 1px 2px rgba(0,0,0,0.1)"
//                       }}
//                     >
//                       {fullname}
//                     </Text>
//                     {isPremium && (
//                       <Badge
//                         size="sm"
//                         variant="solid"
//                         borderRadius="full"
//                         px={2}
//                         py={0.5}
//                         bg={styles.premiumBadgeBg}
//                         color="gray.800"
//                         fontSize="xs"
//                         fontWeight="800"
//                         letterSpacing="wide"
//                         filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
//                         transition="all 0.3s ease"
//                         _groupHover={{
//                           transform: "scale(1.05)",
//                           filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
//                         }}
//                       >
//                         PREMIUM 
//                       </Badge>
//                     )}
//                   </Box>
//                 </Flex>

//                 <Divider orientation="vertical" h="40px" borderWidth="2px" borderColor={styles.cardBorder} opacity={0.6} />

//                 {/* Photo Counter */}
//                 <Flex
//                   {...counterCardEnhancedStyles(styles)}
//                   align="center"
//                   cursor="pointer"
//                   onClick={photoStorageModal.onOpen}
//                   minW="140px"
//                   justify="center"
//                 >
//                   <Box
//                     as={FaImages}
//                     color={styles.accentColor}
//                     size="18px"
//                     mr={3}
//                     filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
//                     transition="all 0.3s ease"
//                     _groupHover={{
//                       transform: "scale(1.1)",
//                       filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))"
//                     }}
//                   />
//                   <Box textAlign="center">
//                     <Text 
//                       color={styles.textColor} 
//                       fontSize="lg" 
//                       fontWeight="800"
//                       lineHeight="1"
//                     >
//                       {photoCount}
//                     </Text>
//                     <Text 
//                       color={styles.textColorSecondary} 
//                       fontSize="xs" 
//                       fontWeight="600"
//                       textTransform="uppercase"
//                       letterSpacing="wide"
//                     >
//                       Photos
//                     </Text>
//                   </Box>
//                 </Flex>

//                 <Divider orientation="vertical" h="40px" borderWidth="2px" borderColor={styles.cardBorder} opacity={0.6} />

//                 {/* Countries Counter */}
//                 <Flex
//                   {...counterCardEnhancedStyles(styles)}
//                   align="center"
//                   cursor="pointer"
//                   onClick={countriesModal.onOpen}
//                   minW="140px"
//                   justify="center"
//                 >
//                   <Box
//                     as={FaMap}
//                     color={styles.successColor}
//                     size="18px"
//                     mr={3}
//                     filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
//                     transition="all 0.3s ease"
//                     _groupHover={{
//                       transform: "scale(1.1)",
//                       filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))"
//                     }}
//                   />
//                   <Box textAlign="center">
//                     <Text 
//                       color={styles.textColor} 
//                       fontSize="lg" 
//                       fontWeight="800"
//                       lineHeight="1"
//                     >
//                       {countryCount}
//                     </Text>
//                     <Text 
//                       color={styles.textColorSecondary} 
//                       fontSize="xs" 
//                       fontWeight="600"
//                       textTransform="uppercase"
//                       letterSpacing="wide"
//                     >
//                       Countries
//                     </Text>
//                   </Box>
//                 </Flex>

//                 {/* Search Button */}
//                 <ModernSearchButton
//                   onClick={() => {
//                     const searchForm = document.querySelector('[data-search-trigger]');
//                     if (searchForm) {
//                       searchForm.click();
//                     }
//                   }}
//                   size="md"
//                 />

//                 {/* Timeline Button */}
//                 <ModernTimelineButton
//                   onClick={() => navigate("/timeline")}
//                   size="md"
//                 />

//                 {/* Upgrade to Premium */}
//                 {!isPremium && (
//                   <UpgradeToPremiumButton
//                     onClick={premiumModal.onOpen}
//                     size="md"
//                   />
//                 )}

//                 {/* Logout Button */}
//                 <IconButton
//                   aria-label="Sign Out"
//                   icon={<FaSignOutAlt />}
//                   onClick={logout}
//                   size="md"
//                   bg={styles.cardBg}
//                   color={styles.warningColor}
//                   border="1px solid"
//                   borderColor={styles.cardBorder}
//                   borderRadius="xl"
//                   _hover={{
//                     bg: styles.cardHover,
//                     transform: "translateY(-2px)",
//                     boxShadow: styles.cardShadowHover
//                   }}
//                   transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
//                   backdropFilter="blur(20px)"
//                 />

//                 {/* Hidden SearchForm for modal functionality */}
//                 <Box display="none">
//                   <SearchForm
//                     countriesWithPhotos={countriesWithPhotos}
//                     onSearch={(searchParams) =>
//                       navigate(`/countries/${searchParams.country}?year=${searchParams.year}`)
//                     }
//                   />
//                 </Box>
//               </>
//             ) : (
//               <HStack spacing={4}>
//                 <ModernLoginButton onClick={loginModal.onOpen} size="md" />
//                 <ModernRegisterButton onClick={registerModal.onOpen} size="md" />
//               </HStack>
//             )}
//           </HStack>
//         </Flex>

//         {/* Mobile Menu */}
//         <Collapse in={isOpen} animateOpacity>
//           <Box
//             {...mobileMenuStyles(styles)}
//             position="relative"
//           >
//             {/* Mobile Theme Toggle */}
//             <IconButton
//               {...themeToggleStyles(styles)}
//               icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
//               onClick={toggleColorMode}
//               color={styles.textColor}
//               size="sm"
//               position="absolute"
//               top="1rem"
//               right="1rem"
//               zIndex={10}
//             />

//             {isLoggedIn ? (
//                               <VStack align="stretch" spacing={3} px={4} pt={8}>
//                 {/* User Profile */}
//                 <Flex
//                   {...userProfileCardStyles(styles)}
//                   align="center"
//                   cursor="pointer"
//                   onClick={profileModal.onOpen}
//                   w="full"
//                   justify="center"
//                 >
//                   <Avatar 
//                     size="md" 
//                     name={fullname} 
//                     mr={4}
//                     bg={isPremium ? styles.premiumGradient : styles.accentColor}
//                     color="white"
//                     ring="3px"
//                     ringColor={isPremium ? styles.premiumBorderColor : "rgba(255, 255, 255, 0.3)"}
//                     filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
//                     transition="all 0.3s ease"
//                     _groupHover={{
//                       transform: "scale(1.1)",
//                       ringColor: isPremium ? styles.premiumBorderColor : "rgba(255, 255, 255, 0.5)"
//                     }}
//                   />
//                   <Box textAlign="center">
//                     <Text 
//                       color={styles.textColor} 
//                       fontSize="lg" 
//                       fontWeight="700"
//                       transition="all 0.3s ease"
//                       _groupHover={{
//                         color: styles.accentColor,
//                         textShadow: "0 1px 2px rgba(0,0,0,0.1)"
//                       }}
//                     >
//                       {fullname}
//                     </Text>
//                     {isPremium && (
//                       <Badge
//                         mt={2}
//                         colorScheme="yellow"
//                         variant="solid"
//                         borderRadius="full"
//                         px={3}
//                         py={1}
//                         filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
//                         transition="all 0.3s ease"
//                         _groupHover={{
//                           transform: "scale(1.05)",
//                           filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
//                         }}
//                       >
//                         PREMIUM 
//                       </Badge>
//                     )}
//                   </Box>
//                 </Flex>

//                 {/* Photo Counter */}
//                 <Flex
//                   {...counterCardEnhancedStyles(styles)}
//                   align="center"
//                   cursor="pointer"
//                   onClick={photoStorageModal.onOpen}
//                   w="full"
//                   justify="center"
//                 >
//                   <Box
//                     as={FaImages}
//                     color={styles.accentColor}
//                     size="20px"
//                     mr={4}
//                     filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
//                     transition="all 0.3s ease"
//                     _groupHover={{
//                       transform: "scale(1.1)",
//                       filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))"
//                     }}
//                   />
//                   <Box textAlign="center">
//                     <Text color={styles.textColor} fontSize="xl" fontWeight="800">
//                       {photoCount}
//                     </Text>
//                     <Text color={styles.textColorSecondary} fontSize="sm" fontWeight="600">
//                       Photos
//                     </Text>
//                   </Box>
//                 </Flex>

//                 {/* Countries Counter */}
//                 <Flex
//                   {...counterCardEnhancedStyles(styles)}
//                   align="center"
//                   cursor="pointer"
//                   onClick={countriesModal.onOpen}
//                   w="full"
//                   justify="center"
//                 >
//                   <Box
//                     as={FaMap}
//                     color={styles.successColor}
//                     size="20px"
//                     mr={4}
//                     filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
//                     transition="all 0.3s ease"
//                     _groupHover={{
//                       transform: "scale(1.1)",
//                       filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))"
//                     }}
//                   />
//                   <Box textAlign="center">
//                     <Text color={styles.textColor} fontSize="xl" fontWeight="800">
//                       {countryCount}
//                     </Text>
//                     <Text color={styles.textColorSecondary} fontSize="sm" fontWeight="600">
//                       Countries
//                     </Text>
//                   </Box>
//                 </Flex>

//                 <Divider borderColor={styles.cardBorder} opacity={0.6} />

//                 {/* Search */}
//                 <CompactSearchButton
//                   onClick={() => {
//                     const searchForm = document.querySelector('[data-search-trigger]');
//                     if (searchForm) {
//                       searchForm.click();
//                     }
//                   }}
//                   w="full"
//                   size="md"
//                 />

//                 {/* Timeline */}
//                 <CompactTimelineButton
//                   onClick={() => {
//                     navigate("/timeline");
//                     onClose();
//                   }}
//                   w="full"
//                   size="md"
//                 />

//                 {/* Upgrade to Premium */}
//                 {!isPremium && (
//                   <UpgradeToPremiumButton
//                     onClick={premiumModal.onOpen}
//                     w="full"
//                     size="md"
//                   />
//                 )}

//                 {/* Logout */}
//                 <IconButton
//                   aria-label="Sign Out"
//                   icon={<FaSignOutAlt />}
//                   onClick={logout}
//                   size="md"
//                   w="full"
//                   bg={styles.cardBg}
//                   color={styles.warningColor}
//                   border="1px solid"
//                   borderColor={styles.cardBorder}
//                   borderRadius="xl"
//                   _hover={{
//                     bg: styles.cardHover,
//                     transform: "translateY(-2px)",
//                     boxShadow: styles.cardShadowHover
//                   }}
//                   transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
//                   backdropFilter="blur(20px)"
//                 />

//                 {/* Hidden SearchForm for modal functionality */}
//                 <Box display="none">
//                   <SearchForm
//                     countriesWithPhotos={countriesWithPhotos}
//                     onSearch={(searchParams) => {
//                       navigate(`/countries/${searchParams.country}?year=${searchParams.year}`);
//                       onClose();
//                     }}
//                   />
//                 </Box>
//               </VStack>
//             ) : (
//                               <VStack spacing={3} px={4} pt={8}>
//                 <HStack justify="center" w="full">
//                   <Text color={styles.textColor} fontSize="lg" fontWeight="600">
//                     Welcome to Photomap
//                   </Text>
//                 </HStack>
//                 <ModernLoginButton
//                   onClick={() => {
//                     loginModal.onOpen();
//                     onClose();
//                   }}
//                   w="full"
//                 />
//                 <ModernRegisterButton
//                   onClick={() => {
//                     registerModal.onOpen();
//                     onClose();
//                   }}
//                   w="full"
//                 />
//               </VStack>
//             )}
//           </Box>
//         </Collapse>
//       </Container>

//       {/* Modals */}
//       <PhotoStorageModal
//         isOpen={photoStorageModal.isOpen}
//         onClose={photoStorageModal.onClose}
//         isPremium={isPremium}
//       />
//       <CountriesVisitedModal
//         isOpen={countriesModal.isOpen}
//         onClose={countriesModal.onClose}
//         countryCount={countryCount}
//       />
//       <UserProfileModal
//         isOpen={profileModal.isOpen}
//         onClose={profileModal.onClose}
//         fullname={fullname}
//         email={email}
//         photoCount={photoCount}
//         countryCount={countryCount}
//         isPremium={isPremium}
//       />
//       <PremiumBenefitsModal
//         isOpen={premiumModal.isOpen}
//         onClose={premiumModal.onClose}
//         onUpgrade={handleBecomePremium}
//       />
//       <LoginModal
//         isOpen={loginModal.isOpen}
//         onClose={loginModal.onClose}
//         onSwitchToRegister={() => {
//           loginModal.onClose();
//           registerModal.onOpen();
//         }}
//       />
//       <RegisterModal
//         isOpen={registerModal.isOpen}
//         onClose={registerModal.onClose}
//         onSwitchToLogin={() => {
//           registerModal.onClose();
//           loginModal.onOpen();
//         }}
//       />
//     </Box>
//   );
// }

// export default Header;
