import {
    Box,
    Button,
    Slider,
    SliderFilledTrack,
    SliderMark,
    SliderThumb,
    SliderTrack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { BoxProps } from '@chakra-ui/layout';
import { useReliquaryWithdrawState } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState';
import { useReliquaryExitGetProportionalWithdrawEstimate } from '~/modules/reliquary/withdraw/lib/useReliquaryExitGetProportionalWithdrawEstimate';
import { BeetsBox } from '~/components/box/BeetsBox';
import { ReliquaryWithdrawSummary } from '~/modules/reliquary/withdraw/components/ReliquaryWithdrawSummary';
import { useEffectOnce } from '~/lib/util/custom-hooks';
import { ReliquaryWithdrawSettings } from '~/modules/reliquary/withdraw/components/ReliquaryWithdrawSettings';
import ReliquaryTokenBreakdown from '~/modules/reliquary/components/ReliquaryTokensBreakdown';
import { sum } from 'lodash';
import { useGetTokens } from '~/lib/global/useToken';

interface Props extends BoxProps {
    onShowPreview: () => void;
}

export function ReliquaryWithdrawProportional({ onShowPreview, ...rest }: Props) {
    const { setProportionalPercent, proportionalPercent, setProportionalWithdraw, setProportionalAmounts } =
        useReliquaryWithdrawState();
    const { priceForAmount } = useGetTokens();

    useEffectOnce(() => {
        setProportionalWithdraw();
    });

    const { data, isLoading } = useReliquaryExitGetProportionalWithdrawEstimate();
    const proportionalAmounts = data || [];

    const totalWithdrawValue = sum(proportionalAmounts.map(priceForAmount));

    return (
        <VStack p="4" spacing="4" {...rest}>
            <Box width="full">
                <Text>Drag the slider to configure your withdraw amount.</Text>
                <Slider mt="12" aria-label="slider-ex-1" value={proportionalPercent} onChange={setProportionalPercent}>
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={4} />
                    <SliderMark
                        value={proportionalPercent}
                        textAlign="center"
                        bg="beets.base.500"
                        color="white"
                        mt="-10"
                        ml="-30px"
                        w="12"
                        fontSize="md"
                        width="60px"
                        borderRadius="md"
                    >
                        {proportionalPercent}%
                    </SliderMark>
                </Slider>
            </Box>
            <BeetsBox p="2" width="full">
                <ReliquaryTokenBreakdown />
            </BeetsBox>
            <ReliquaryWithdrawSummary totalWithdrawValue={totalWithdrawValue} width="full" />
            <ReliquaryWithdrawSettings width="full" />
            <Button
                variant="primary"
                width="full"
                mt="8"
                onClick={() => {
                    setProportionalAmounts(proportionalAmounts);
                    onShowPreview();
                }}
            >
                Preview
            </Button>
        </VStack>
    );
}
