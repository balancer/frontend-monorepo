import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';
import useReliquary from '../../lib/useReliquary';
import { relicGetMaturityProgress } from '../../lib/reliquary-helpers';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import { Box } from '@chakra-ui/react';

interface Props {}

export default function RelicMaturityBarChart({}: Props) {
    const { maturityThresholds, isLoading, selectedRelic } = useReliquary();
    const { entryDate } = relicGetMaturityProgress(selectedRelic, maturityThresholds);

    const weekInSeconds = 7 * 24 * 60 * 60;
    const totalMaturityInSeconds = 10 * weekInSeconds;
    const timePassed = differenceInSeconds(Date.now(), entryDate);
    const timeToGo = totalMaturityInSeconds - timePassed;

    const chartOption: EChartsOption = useMemo(() => {
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                },
                // any -> https://github.com/apache/echarts/issues/14277
                formatter: (params: any) => {
                    return `Level ${params[0].dataIndex + 1}<br>Maturity date: ${params[0].name}`;
                },
            },
            grid: {
                left: '-2%',
                bottom: '60%',
                right: '2%',
                top: '-50%',
                containLabel: true,
            },
            xAxis: {
                type: 'value',
                show: true,
                axisLabel: {
                    formatter: function (value: any) {
                        return Math.floor(value / weekInSeconds) + 1;
                    },
                    showMaxLabel: true,
                    margin: -40,
                },
                boundaryGap: false,
                splitLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                max: 10 * weekInSeconds,
                interval: weekInSeconds,
            },
            yAxis: {
                show: false,
                type: 'category',
            },
            series: [
                {
                    name: 'passed',
                    type: 'bar',
                    stack: 'total',
                    data: [timePassed],
                    barWidth: '10%',
                },
                {
                    name: 'togo',
                    type: 'bar',
                    stack: 'total',
                    data: [timeToGo],
                    barWidth: '10%',
                },
            ],
        };
    }, [isLoading, selectedRelic]);

    return (
        <Box w="full" pt="2 " pb="4" h="30%">
            <ReactECharts showLoading={isLoading} option={chartOption} style={{ height: '100%' }} />
        </Box>
    );
}
