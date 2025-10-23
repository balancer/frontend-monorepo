import { useMemo } from 'react';
import { EChartsOption, graphic } from 'echarts';
import { format } from 'date-fns';
import { numberFormatUSDValue } from '~/lib/util/number-formats';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@chakra-ui/react';
import { chartGetPrimaryColor, chartGetSecondaryColor } from '~/modules/pool/detail/components/charts/chart-util';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import numeral from 'numeral';

interface Props {
    data: { timestamp: number; relicCount: string }[];
}

export function ReliquaryRelicsCountChart({ data }: Props) {
    const networkConfig = useNetworkConfig();
    const { colors } = useTheme();

    const option = useMemo<EChartsOption>(
        () => ({
            tooltip: {
                trigger: 'axis',
                type: 'shadow',
                backgroundColor: colors.beets.base['700'],
                borderColor: 'transparent',
                borderRadius: 8,
                textStyle: {
                    color: 'white',
                },
                padding: 16,
                axisPointer: {
                    animation: false,
                    type: 'cross',
                    lineStyle: {
                        color: colors.beets.base['100'],
                        width: 2,
                        opacity: 1,
                    },
                },
                // any -> https://github.com/apache/echarts/issues/14277
                formatter: (params: any) => `# of relics: ${numeral(params[0].data[1]).format('0a')}`,
            },
            textStyle: {
                color: '#D3D3D3',
            },
            xAxis: {
                show: true,
                type: 'time',
                offset: 0,
                minorSplitLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    formatter: (value: number, index: number) => {
                        return index % 2 === 0 ? format(new Date(value), 'MMM d') : '';
                    },
                    color: colors.gray['200'],
                    showMaxLabel: false,
                    showMinLabel: false,
                },
                axisPointer: {
                    type: 'line',
                    label: {
                        formatter: (params) => {
                            return format(new Date(params.value), 'MMM d');
                        },
                    },
                },
                axisLine: { show: false },
            },
            yAxis: {
                show: false,
                scale: true,
                splitLine: { show: false },
                offset: 0,
            },
            grid: {
                left: 0,
                right: 0,
                top: '5%',
                bottom: '7.5%',
                containLabel: false,
            },
            series: [
                {
                    type: 'line',
                    smooth: true,
                    name: 'Relics',
                    showSymbol: false,
                    data: data.map((item) => [item.timestamp * 1000, parseInt(item.relicCount)]),
                    itemStyle: {
                        color: chartGetSecondaryColor(networkConfig.chainId, 1),
                    },
                    areaStyle: {
                        opacity: networkConfig.chainId === '10' ? 0.75 : 0.2,
                        color: new graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: chartGetPrimaryColor(networkConfig.chainId, 1) },
                            { offset: 0.5, color: chartGetPrimaryColor(networkConfig.chainId, 1) },
                            { offset: 1, color: chartGetPrimaryColor(networkConfig.chainId, 0) },
                        ]),
                    },
                    axisLine: { show: false },
                    minorSplitLine: { show: false },
                    splitLine: { show: false },

                    tooltip: {
                        valueFormatter: (value) => numberFormatUSDValue(value as number),
                    },
                },
            ],
        }),
        [JSON.stringify(data)],
    );

    return <ReactECharts option={option} style={{ height: '100%' }} />;
}
