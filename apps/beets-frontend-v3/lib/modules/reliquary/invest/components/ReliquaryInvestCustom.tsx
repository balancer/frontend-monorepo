import { useReliquaryInvestState } from '~/modules/reliquary/invest/lib/useReliquaryInvestState';
import { usePoolUserTokenBalancesInWallet } from '~/modules/pool/lib/usePoolUserTokenBalancesInWallet';
import { Alert, Box, Button, Checkbox, Collapse, useBoolean } from '@chakra-ui/react';
import { ReliquaryInvestSummary } from '~/modules/reliquary/invest/components/ReliquaryInvestSummary';
import { ReliquaryInvestSettings } from '~/modules/reliquary/invest/components/ReliquaryInvestSettings';

import { useReliquaryInvest } from '~/modules/reliquary/invest/lib/useReliquaryInvest';
import { BeetsTokenInputWithSlider } from '~/components/inputs/BeetsTokenInputWithSlider';
import { usePoolJoinGetBptOutAndPriceImpactForTokensIn } from '~/modules/pool/invest/lib/usePoolJoinGetBptOutAndPriceImpactForTokensIn';
import { useHasBatchRelayerApproval } from '~/lib/util/useHasBatchRelayerApproval';
import { usePool } from '~/modules/pool/lib/usePool';
import React from 'react';

interface Props {
    onShowPreview(): void;
}

export function ReliquaryInvestCustom({ onShowPreview }: Props) {
    const { pool, requiresBatchRelayerOnJoin } = usePool();
    const { inputAmounts, setInputAmount, setSelectedOption } = useReliquaryInvestState();
    const { selectedInvestTokens, hasValidUserInput } = useReliquaryInvest();
    const { userPoolTokenBalances } = usePoolUserTokenBalancesInWallet();
    const { hasHighPriceImpact, formattedPriceImpact } = usePoolJoinGetBptOutAndPriceImpactForTokensIn();
    const [acknowledgeHighPriceImpact, { toggle: toggleAcknowledgeHighPriceImpact }] = useBoolean(false);
    const { data: hasBatchRelayerApproval } = useHasBatchRelayerApproval();

    return (
        <Box>
            <Box p="4">
                <Box mb="4">
                    <ReliquaryInvestSummary />
                </Box>
                {pool.investConfig.options.map((option, index) => {
                    return (
                        <BeetsTokenInputWithSlider
                            tokenOptions={option.tokenOptions}
                            selectedTokenOption={selectedInvestTokens[index]}
                            balance={
                                userPoolTokenBalances.find(
                                    (userBalance) => userBalance.address === selectedInvestTokens[index].address,
                                )?.amount || '0'
                            }
                            setInputAmount={(amount) => setInputAmount(selectedInvestTokens[index].address, amount)}
                            setSelectedTokenOption={(address) => setSelectedOption(option.poolTokenIndex, address)}
                            value={inputAmounts[selectedInvestTokens[index].address]}
                            key={index}
                            mb="4"
                        />
                    );
                })}
                <ReliquaryInvestSettings mt="4" />
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
                            I confirm that my custom investment will result in a {formattedPriceImpact} price impact,
                            subjecting me to fees and possible impermanent loss.
                        </Box>
                    </Alert>
                </Collapse>
                <Button
                    variant="primary"
                    width="full"
                    mt="4"
                    onClick={onShowPreview}
                    isDisabled={!hasValidUserInput || (hasHighPriceImpact && !acknowledgeHighPriceImpact)}
                >
                    Preview
                </Button>
            </Box>
        </Box>
    );
}
