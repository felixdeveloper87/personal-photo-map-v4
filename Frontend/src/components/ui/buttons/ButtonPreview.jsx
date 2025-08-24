// import React from 'react';
// import { Box, VStack, HStack, Text, Heading, useColorModeValue } from '@chakra-ui/react';
// import {
//   ModernSearchButton,
//   ModernTimelineButton,
//   CompactSearchButton,
//   CompactTimelineButton
// } from './ModernButtons';

// /**
//  * Componente de demonstração dos botões modernos
//  * Útil para visualizar como ficaram os novos designs
//  */
// export const ButtonPreview = () => {
//   const bgColor = useColorModeValue('gray.50', 'gray.800');
//   const borderColor = useColorModeValue('gray.200', 'gray.600');

//   return (
//     <Box
//       p={8}
//       bg={bgColor}
//       borderRadius="xl"
//       border="1px solid"
//       borderColor={borderColor}
//       maxW="800px"
//       mx="auto"
//     >
//       <VStack spacing={8} align="stretch">
//         <Box textAlign="center">
//           <Heading size="lg" mb={2} color={useColorModeValue('gray.800', 'white')}>
//             Botões Modernos e Elegantes
//           </Heading>
//           <Text color={useColorModeValue('gray.600', 'gray.300')}>
//             Novos designs para Search e Timeline com gradientes, animações e efeitos modernos
//           </Text>
//         </Box>

//         {/* Botões Desktop */}
//         <Box>
//           <Text fontWeight="semibold" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
//             Versão Desktop (Tamanho Médio)
//           </Text>
//           <HStack spacing={4} justify="center" flexWrap="wrap">
//             <ModernSearchButton
//               onClick={() => console.log('Search clicked!')}
//               children="Search Photos"
//             />
//             <ModernTimelineButton
//               onClick={() => console.log('Timeline clicked!')}
//               children="View Timeline"
//             />
//           </HStack>
//         </Box>

//         {/* Botões Mobile */}
//         <Box>
//           <Text fontWeight="semibold" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
//             Versão Mobile (Tamanho Pequeno)
//           </Text>
//           <HStack spacing={4} justify="center" flexWrap="wrap">
//             <CompactSearchButton
//               onClick={() => console.log('Compact Search clicked!')}
//             />
//             <CompactTimelineButton
//               onClick={() => console.log('Compact Timeline clicked!')}
//             />
//           </HStack>
//         </Box>

//         {/* Características dos Botões */}
//         <Box>
//           <Text fontWeight="semibold" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
//             Características dos Novos Botões:
//           </Text>
//           <VStack spacing={2} align="start" pl={4}>
//             <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
//               ✨ Gradientes suaves e modernos
//             </Text>
//             <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
//               🎭 Animações fluidas com framer-motion
//             </Text>
//             <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
//               🌟 Efeitos hover com elevação e sombras
//             </Text>
//             <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
//               📱 Design responsivo para desktop e mobile
//             </Text>
//             <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
//               🎨 Suporte completo para modo claro/escuro
//             </Text>
//             <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
//               ⚡ Transições suaves e feedback visual
//             </Text>
//           </VStack>
//         </Box>
//       </VStack>
//     </Box>
//   );
// };

// export default ButtonPreview;
