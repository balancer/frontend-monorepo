import Card from '~/components/card/Card';
import { EChartsOption, graphic } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { usePool } from '~/modules/pool/lib/usePool';
import { chartGetPrimaryColor } from '~/modules/pool/detail/components/charts/chart-util';
import { networkConfig } from '~/lib/config/network-config';
import { InfoButton } from '~/components/info-button/InfoButton';
import { Box, HStack, Link, useTheme } from '@chakra-ui/react';
import { ExternalLink } from 'react-feather';
import numeral from 'numeral';

export function ReliquaryCurveChart() {
    const { pool } = usePool();
    const { colors } = useTheme();

    const data = pool.staking?.reliquary?.levels
        ?.map((level) => ({
            level: level.level + 1,
            allocationPoints: level.allocationPoints,
        }))
        // sometimes the levels from the pool data loop around which gives a weird chart, so just always slice out the correct data
        .slice(0, 11);

    const option: EChartsOption = {
        tooltip: {
            show: true,
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999',
                },
            },
            // any -> https://github.com/apache/echarts/issues/14277
            formatter: (params: any) =>
                `Level ${params[0].data[0]}: ${numeral(params[0].data[1]).format('0a')}x maturity boost`,
            confine: true,
        },
        textStyle: {
            color: '#D3D3D3',
        },
        xAxis: {
            name: 'Level',
            nameLocation: 'middle',
            nameGap: 35,
            type: 'category',
            splitLine: { show: false },
            axisTick: { show: false, alignWithLabel: true },
            axisLabel: {
                margin: 16,
            },
            axisLine: { show: false },
        },
        yAxis: {
            name: 'Maturity boost',
            nameLocation: 'middle',
            nameRotate: 90,
            type: 'value',
            axisLine: { show: false },
            splitLine: { show: false },
            axisLabel: {
                show: false,
            },
            axisTick: { show: false },
        },
        grid: {
            bottom: '5%',
            right: '1.5%',
            left: '4.5%',
            top: '10%',
            containLabel: true,
        },
        series: [
            {
                type: 'line',
                smooth: true,
                data: data?.map((item) => [item.level, item.allocationPoints]),
                areaStyle: {
                    opacity: 0.2,
                    color: new graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: chartGetPrimaryColor(networkConfig.chainId, 1) },
                        { offset: 0.5, color: chartGetPrimaryColor(networkConfig.chainId, 1) },
                        { offset: 1, color: chartGetPrimaryColor(networkConfig.chainId, 0) },
                    ]),
                },
                lineStyle: {
                    color: '#05D690',
                },
            },
        ],
    };

    return (
        <Card height="full" px="4" py="4">
            <HStack>
                <InfoButton
                    labelProps={{
                        lineHeight: '1rem',
                        fontWeight: 'semibold',
                        fontSize: 'sm',
                        color: 'beets.base.50',
                    }}
                    label="BEETronix"
                    infoText="This curve shows the maturity boost per level."
                />
                <Link href="https://docs.beets.fi/tokenomics/mabeets" target="_blank">
                    <ExternalLink size="16" />
                </Link>
            </HStack>
            <Box height="full">
                <ReactECharts option={option} style={{ height: '100%' }} />
            </Box>
        </Card>
    );
}
