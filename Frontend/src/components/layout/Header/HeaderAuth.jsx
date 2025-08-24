import React from 'react';
import { HStack } from '@chakra-ui/react';
import {
  ModernLoginButton,
  ModernRegisterButton,
} from '../../ui/buttons/HeaderButtons';

const HeaderAuth = ({ onLoginClick, onRegisterClick, display, ...props }) => {

  return (
    <HStack display={display} {...props} spacing={0}>
      <ModernLoginButton onClick={onLoginClick} size="md" mr={8} />
      <ModernRegisterButton onClick={onRegisterClick} size="md"  />
    </HStack>
  );
};

export default HeaderAuth;
