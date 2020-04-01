import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  Grid,
  Table,
  Link,
  Card,
  Checkbox,
  Flex
} from '@makerdao/ui-components-core';
import useStore from '../../hooks/useStore';
import useMaker from '../../hooks/useMaker';
import { TextBlock } from '../Typography';
import LoadingToggle from '../LoadingToggle';
import { addToastWithTimeout } from '../Toast';
import { prettifyNumber } from '../../utils/ui';
import { SAI, DAI } from '../../maker';
import AmountInputCard from '../AmountInputCard';

export default ({ onNext, onPrev, showErrorMessageAndAllowExiting, setTxHash }) => {
  let [{saiBalance = SAI(0)}, dispatch] = useStore();
  const { maker, account } = useMaker();
  const [hasReadTOS, setHasReadTOS] = useState(false);
  const [tapApprovePending, setTapApprovePending] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1)
  const [redemptionInitiated, setRedemptionInitiated] = useState(false);
  const [proxyDetails, setProxyDetails] = useState({});
  const [saiAmountToRedeem, setSaiAmountToRedeem] = useState(SAI(0));
  const [valid, setValid] = useState(true);
  const saiTapContractAddress = maker
    .service('smartContract')
    .getContract('SAI_TAP').address;
  const max = saiBalance

  if (!maker) return null;

  const validate = value => {
    let msg;
    if (value.lte(0)) msg = 'Amount must be greater than 0';
    else if (value.gt(saiBalance)) msg = 'Insufficient Sai balance';
    setValid(!msg);
    return msg;
  };

  const giveProxyTapAllowance = async () => {
    setTapApprovePending(true);
    try {
      await maker
        .getToken('DAI')
        .approveUnlimited(saiTapContractAddress);
      setProxyDetails(proxyDetails => ({
        ...proxyDetails,
        hasTapAllowance: true
      }));
    } catch (err) {
      const message = err.message ? err.message : err;
      const errMsg = `unlock tap tx failed ${message}`;
      console.error(errMsg);
      addToastWithTimeout(errMsg, dispatch);
    }
    setTapApprovePending(false);
  };

  const redeemSai = async () => {
    try {
      setRedemptionInitiated(true);
      const migration = await maker.service('migration').getMigration('redeem-sai');
      // The following should be removed when approval ui is in place
      // await maker.getToken('DAI').approveUnlimited(migration._tap.address);
      const redeemTxObject = migration.redeemSai(saiAmountToRedeem);
      maker.service('transactionManager').listen(redeemTxObject, {
        pending: tx => {
          setTxHash(tx.hash);
          onNext();
        },
        error: () => showErrorMessageAndAllowExiting()
      });
      redeemTxObject.then(onNext)
    } catch (err) {
      const message = err.message ? err.message : err;
      const errMsg = `migrate tx failed ${message}`;
      console.error(errMsg);
      addToastWithTimeout(errMsg, dispatch);
    }
  };

  useEffect(() => {
    (async () => {
      if (maker) {
        const xRate = await maker.service('migration').getMigration('redeem-sai').getRate();
        setExchangeRate(xRate)
      }
    })()
  }, [maker]);

  useEffect(() => {
    (async () => {
      if (maker && account) {
        const connectedWalletAllowance = await maker
          .getToken('DAI')
          .allowance(account.address, saiTapContractAddress);
        const hasTapAllowance = connectedWalletAllowance.gte(
          saiAmountToRedeem.toBigNumber().times(1.05)
        );
        setProxyDetails({ hasTapAllowance });
      }
    })();
  }, [account, maker, saiAmountToRedeem]);

  return (
    <Grid maxWidth="912px" gridRowGap="m" px={['s', 0]}>
      <Text.h2 textAlign="center">Redeem Sai for Collateral</Text.h2>
      <Text.p
        textAlign="center"
        t="body"
        fontSize="1.8rem"
        m="0 auto"
        display={{ s: 'none', m: 'block' }}
      >
        Redeem your SAI for a proportional amount of ETH from the Single-Collateral Dai system.
      </Text.p>
      <Grid
        gridTemplateColumns={{ s: 'minmax(0, 1fr)', l: '2fr 1fr' }}
        gridGap="m"
        mt={{ s: 'xs', l: 'm' }}
        mb={{ s: 'xs', l: 'xs' }}
      >
        <AmountInputCard
          max={max}
          unit={SAI}
          update={setSaiAmountToRedeem}
          validate={validate}
          title="Enter the amount you would like to redeem."
        >
          <Box>
            <Text t="subheading">Sai Balance</Text>
            <Text
              t="caption"
              display="inline-block"
              ml="s"
              color="darkLavender"
            >
              {saiBalance ? prettifyNumber(saiBalance) : '...'}
            </Text>
          </Box>
        </AmountInputCard>
        <Card px={{ s: 'm', m: 'l' }} py={{ s: 'm', m: 'l' }}>
          <Grid gridRowGap="m">
            <Grid gridRowGap="xs">
              <TextBlock t="h5" lineHeight="normal">
                SAI Balance
              </TextBlock>
              <TextBlock t="body">{`${saiBalance}`}</TextBlock>
            </Grid>
            <Grid gridRowGap="xs">
              <TextBlock t="h5" lineHeight="normal">
                Exchange Rate
              </TextBlock>
              <TextBlock t="body">{`1 SAI : ${exchangeRate} ETH`}</TextBlock>
            </Grid>
            <Grid gridRowGap="xs">
              <TextBlock t="h5" lineHeight="normal">
                SAI Balance in ETH
              </TextBlock>
              <TextBlock t="body">
                {saiBalance.toNumber() * exchangeRate}
              </TextBlock>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Card>
        <Grid mx={'xl'} px={'xl'} py={'m'}>
          <LoadingToggle
            completeText={'SAI unlocked'}
            loadingText={'Unlocking SAI'}
            defaultText={'Unlock SAI to continue'}
            tokenDisplayName={'SAI'}
            isLoading={tapApprovePending}
            isComplete={proxyDetails.hasTapAllowance}
            onToggle={giveProxyTapAllowance}
            disabled={proxyDetails.hasTapAllowance}
            testId="allowance-toggle"
            mx={'xl'}
            px={'xl'}
          />
        </Grid>
      </Card>
      <Flex
        alignItems="center"
        gridTemplateColumns="auto 1fr"
        flexDirection="row"
        justifyContent="center"
        pb={'m'}
      >
        <Checkbox
          mr="s"
          fontSize="l"
          checked={hasReadTOS}
          onChange={() => setHasReadTOS(!hasReadTOS)}
        />
        <Text
          t="caption"
          color="steel"
          data-testid="terms"
          onClick={() => setHasReadTOS(!hasReadTOS)}
        >
          I have read and accept the{' '}
          <Link target="_blank" href="/terms">
            Terms of Service
          </Link>
          .
        </Text>
      </Flex>
      <Grid
        justifySelf="center"
        justifyContent="center"
        gridTemplateColumns="auto auto"
        gridColumnGap="m"
      >
        <Button variant="secondary-outline" onClick={onPrev}>
          Cancel
        </Button>
        <Button
          disabled={
            !hasReadTOS ||
            !proxyDetails.hasTapAllowance ||
            redemptionInitiated ||
            !saiAmountToRedeem.toNumber() ||
            !valid
          }
          onClick={() => {
            dispatch({ type: 'assign', payload: { saiAmountToRedeem } });
            redeemSai()
          }}
        >
          Continue
        </Button>
      </Grid>
    </Grid>
  );
};
