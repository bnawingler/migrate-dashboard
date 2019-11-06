import React from 'react';
import { Box, Text, Button, Grid } from '@makerdao/ui-components-core';


export default ({
  onNext,
  onPrev
}) => {
  return (
    <Box maxWidth="71.8rem" mx={['s', 0]}>
      <Text.h2 textAlign="center" mb="xl">
        Upgrade Single Collateral Dai
      </Text.h2>
      <Grid
        justifySelf="center"
        justifyContent="center"
        gridTemplateColumns="auto auto"
        gridColumnGap="m"
      >
        <Button variant="secondary-outline" onClick={onPrev}>
          Cancel
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </Grid>
    </Box>
  );
};