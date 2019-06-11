import React from 'react';
import { Button, Flex, Text } from '@makerdao/ui-components-core';

const IconButton = ({ icon, children, ...props }) => {
  return (
    <Button variant="secondary-outline" width="22.5rem" {...props}>
      <Flex alignItems="center">
        {icon}
        <Text.span m="auto" color="steel">{children}</Text.span>
      </Flex>
    </Button>
  );
};

export default IconButton;
