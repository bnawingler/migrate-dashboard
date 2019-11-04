import React from 'react';
import {
  Text,
  Grid,
  Card,
  Button,
  Radio,
  Overflow,
  Link
} from '@makerdao/ui-components-core';


const RADIO_WIDTH = '2rem';
const RADIO_CONTAINER_WIDTH = '4rem';
const AESTHETIC_ROW_PADDING = '4rem';

export default ({ onNext, onPrev, cdps, saiAvailable }) => {
  const cdpComponents = cdps.map((cdp, index) => {
    return (
      <Card px="l" py="m" key={index}>
        <Grid
          gridTemplateColumns={`${RADIO_CONTAINER_WIDTH} repeat(5, 1fr) ${AESTHETIC_ROW_PADDING}`}
          gridColumnGap="m"
          alignItems="center"
          fontSize="m"
          color="darkPurple"
          css={`
            white-space: nowrap;
          `}
        >
          <Radio disabled={cdp.debtValue > saiAvailable} fontSize={RADIO_WIDTH} />
          <span>{cdp.id}</span>
          {/* Collateralization */}
          <span>{cdp.collateralizationRatio}%</span>
          {/* Debt Value */}
          <span>{cdp.debtValue} DAI</span>
          {/* Fee in DAI */}
          <span>{cdp.govFeeDai} DAI</span>
          {/* Fee in MKR */}
          <span>{cdp.govFeeMKR} MKR</span>
        </Grid>
      </Card>
    )
  })
  return (
    <Grid maxWidth="912px" gridRowGap="m">
      <Text.h2 textAlign="center">Select CDP to Migrate</Text.h2>
      <Text.p
        textAlign="center"
        t="body"
        fontSize="1.8rem"
        maxWidth="498px"
        m="0 auto"
      >
        Select a CDP and pay back the stability fee in DAI or MKR to migrate it
        to Multi-collateral Dai and the new CDP Portal.
      </Text.p>
      <Overflow x="scroll" y="visible">
        <Grid gridRowGap="s" mt="xs" pb="m">
          <Grid
            p="l"
            pb="0"
            gridTemplateColumns={`${RADIO_CONTAINER_WIDTH} repeat(5, 1fr) ${AESTHETIC_ROW_PADDING}`}
            gridColumnGap="m"
            alignItems="center"
            fontWeight="medium"
            color="steelLight"
            css={`
              white-space: nowrap;
            `}
          >
            <span />
            <Text t="subheading">CDP ID</Text>
            <Text t="subheading">Current Ratio</Text>
            <Text t="subheading">Dai Debt</Text>
            <Text t="subheading">Fee In DAI</Text>
            <Text t="subheading">Fee in MKR</Text>
          </Grid>
          {cdpComponents}
        </Grid>
      </Overflow>
      <Grid
        color="steelLight"
        textAlign="center"
      >
        <Link>Why can't I select some CDPs?</Link>
      </Grid>
      <Grid
        justifySelf="center"
        gridTemplateColumns="auto auto"
        gridColumnGap="m"
      >
        <Button variant="secondary-outline" onClick={onPrev}>
          Cancel
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </Grid>
    </Grid>
  );
};
