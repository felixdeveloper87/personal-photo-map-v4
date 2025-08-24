import React from 'react';
import { Box } from '@chakra-ui/react';
import { ModernHeaderUserButton } from '../../ui/buttons/HeaderButtons';

const HeaderUser = ({ 
  styles, 
  fullname, 
  isPremium, 
  onProfileClick
}) => {
  return (
    <Box my={2}>
      <ModernHeaderUserButton
        onClick={onProfileClick}
        fullname={fullname}
        isPremium={isPremium}
        styles={styles}
      />
    </Box>
  );
};

export default React.memo(HeaderUser);
