import { Box, Button, Text, Collapse, Alert, Checkbox, useBoolean } from '@chakra-ui/react';
import { useReliquaryWithdrawState } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState';
import { BoxProps } from '@chakra-ui/layout';
import { useReliquaryExitGetSingleAssetWithdrawForBptIn } from '~/modules/reliquary/withdraw/lib/useReliquaryExitGetSingleAssetWithdrawForBptIn';
import { useReliquaryExitGetBptInForSingleAssetWithdraw } from '~/modules/reliquary/withdraw/lib/useReliquaryExitGetBptInForSingleAssetWithdraw';
import { useEffect } from 'react';
import { ReliquaryWithdrawSummary } from '~/modules/reliquary/withdraw/components/ReliquaryWithdrawSummary';
import { ReliquaryWithdrawSettings } from '~/modules/reliquary/withdraw/components/ReliquaryWithdrawSettings';
import { BeetsTokenInputWithSlider } from '~/components/inputs/BeetsTokenInputWithSlider';
import { usePool } from '~/modules/pool/lib/usePool';
import { useHasBatchRelayerApproval } from '~/lib/util/useHasBatchRelayerApproval';
import { useGetTokens } from '~/lib/global/useToken';

interface Props extends BoxProps {
    onShowPreview: () => void;
}

export function ReliquaryWithdrawSingleAsset({ onShowPreview, ...rest }: Props) {
    const { allTokens, pool, requiresBatchRelayerOnExit } = usePool();
    const { data: hasBatchRelayerApproval } = useHasBatchRelayerApproval();
    const { singleAssetWithdraw, setSingleAssetWithdrawAmount, setSingleAssetWithdraw } = useReliquaryWithdrawState();
    const singleAssetWithdrawForBptIn = useReliquaryExitGetSingleAssetWithdrawForBptIn();
    const { hasHighPriceImpact, formattedPriceImpact } = useReliquaryExitGetBptInForSingleAssetWithdraw();
    const [acknowledgeHighPriceImpact, { toggle: toggleAcknowledgeHighPriceImpact }] = useBoolean(false);
    const { priceForAmount } = useGetTokens();

    useEffect(() => {
        const defaultSingleAsset = pool.withdrawConfig.options[0]?.tokenOptions[0]?.address;

        if (!singleAssetWithdraw && defaultSingleAsset) {
            setSingleAssetWithdraw(defaultSingleAsset);
        }
    }, [singleAssetWithdraw]);

    const withdrawToken = allTokens.find((token) => token.address === singleAssetWithdraw?.address);

    if (!singleAssetWithdraw || !withdrawToken) {
        return null;
    }

    const tokenOptions = pool.withdrawConfig.options.map((option) => option.tokenOptions).flat();
    const selectedTokenOption =
        tokenOptions.find((tokenOption) => tokenOption.address === singleAssetWithdraw.address) || tokenOptions[0];
    const maxAmount = singleAssetWithdrawForBptIn.data?.tokenAmount || '0';

    //TODO: precision
    const isValid =
        parseFloat(singleAssetWithdraw.amount) > 0 &&
        parseFloat(singleAssetWithdraw.amount) <= parseFloat(maxAmount) &&
        (!hasHighPriceImpact || acknowledgeHighPriceImpact) &&
        (!requiresBatchRelayerOnExit || hasBatchRelayerApproval);

    return (
        <Box pt={4} {...rest}>
            <Box mb="4">
                <Text>
                    Select your desired asset, then drag the slider or enter an amount to configure your withdraw.
                </Text>
            </Box>
            <BeetsTokenInputWithSlider
                tokenOptions={tokenOptions}
                selectedTokenOption={selectedTokenOption}
                balance={maxAmount}
                setInputAmount={(amount) =>
                    setSingleAssetWithdrawAmount({ address: selectedTokenOption.address, amount })
                }
                value={singleAssetWithdraw.amount}
                setSelectedTokenOption={setSingleAssetWithdraw}
                isWithdraw
            />
            <ReliquaryWithdrawSummary totalWithdrawValue={priceForAmount(singleAssetWithdraw)} mt="6" />
            <ReliquaryWithdrawSettings mt="6" />
            <Collapse in={hasHighPriceImpact} animateOpacity>
                <Alert status="error" borderRadius="md" mt="4">
                    <Checkbox
                        id="high-price-impact-acknowledge"
                        isChecked={acknowledgeHighPriceImpact}
                        colorScheme="red"
                        onChange={toggleAcknowledgeHighPriceImpact}
                        mt="1"
                        mr="2"
                    />
                    <Box>
                        I confirm that my single asset withdraw will result in a {formattedPriceImpact} price impact,
                        subjecting me to fees.
                    </Box>
                </Alert>
            </Collapse>
            <Button variant="primary" width="full" mt="8" onClick={onShowPreview} isDisabled={!isValid}>
                Preview
            </Button>
        </Box>
    );
}
