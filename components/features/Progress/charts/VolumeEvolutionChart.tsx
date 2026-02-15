import React from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Stop, Text as SvgText, Circle } from 'react-native-svg';
import { Colors, FontFamily } from '@/src/constants/theme';
import { HistoryPoint } from '@/src/hooks/progress/useProgressInsights';

interface VolumeEvolutionChartProps {
    data: HistoryPoint[];
}

interface ChartPoint {
    x: number;
    y: number;
    label: string;
    value: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function buildLinePath(points: ChartPoint[]): string {
    if (points.length <= 1) {
        return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
    }

    const segmentCount = points.length - 1;
    const d: number[] = new Array(segmentCount);
    const m: number[] = new Array(points.length);

    for (let index = 0; index < segmentCount; index += 1) {
        const h = points[index + 1].x - points[index].x;
        d[index] = h === 0 ? 0 : (points[index + 1].y - points[index].y) / h;
    }

    m[0] = d[0];
    m[points.length - 1] = d[segmentCount - 1];

    for (let index = 1; index < points.length - 1; index += 1) {
        const dPrev = d[index - 1];
        const dNext = d[index];
        if (dPrev === 0 || dNext === 0 || dPrev * dNext < 0) {
            m[index] = 0;
        } else {
            m[index] = (2 * dPrev * dNext) / (dPrev + dNext);
        }
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let index = 0; index < segmentCount; index += 1) {
        const p0 = points[index];
        const p1 = points[index + 1];
        const h = p1.x - p0.x;
        const cp1x = p0.x + h / 3;
        const cp1y = p0.y + (m[index] * h) / 3;
        const cp2x = p1.x - h / 3;
        const cp2y = p1.y - (m[index + 1] * h) / 3;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    return path;
}

function buildAreaPath(points: ChartPoint[], bottomY: number): string {
    if (points.length === 0) {
        return '';
    }
    const linePath = buildLinePath(points);
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
}

export function VolumeEvolutionChart({ data }: VolumeEvolutionChartProps) {
    const [size, setSize] = React.useState({ width: 0, height: 0 });
    const [activeIndex, setActiveIndex] = React.useState(Math.max(0, data.length - 1));
    const lastIndexRef = React.useRef(activeIndex);
    const rafRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        setActiveIndex(Math.max(0, data.length - 1));
    }, [data.length]);

    React.useEffect(() => {
        lastIndexRef.current = activeIndex;
    }, [activeIndex]);

    React.useEffect(() => {
        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, []);

    const onLayout = React.useCallback((event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        const height = event.nativeEvent.layout.height;
        if (width > 0 && height > 0) {
            setSize({ width, height });
        }
    }, []);

    const chart = React.useMemo(() => {
        if (size.width <= 0 || size.height <= 0 || data.length === 0) {
            return null;
        }

        const left = 14;
        const right = 14;
        const top = 10;
        const bottom = 34;
        const innerWidth = Math.max(1, size.width - left - right);
        const innerHeight = Math.max(1, size.height - top - bottom);
        const maxValue = Math.max(...data.map((item) => item.value), 1);
        const points = data.map((item, index) => {
            const x = left + (innerWidth * index) / Math.max(1, data.length - 1);
            const y = top + (1 - item.value / maxValue) * innerHeight;
            return { x, y, label: item.date, value: item.value };
        });

        const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
            y: top + ratio * innerHeight,
        }));

        return {
            left,
            right,
            top,
            bottom,
            innerHeight,
            points,
            grid,
            linePath: buildLinePath(points),
            areaPath: buildAreaPath(points, top + innerHeight),
        };
    }, [data, size.height, size.width]);

    const activePoint = chart?.points[Math.min(activeIndex, Math.max(0, (chart?.points.length ?? 1) - 1))];

    const updateFromTouch = React.useCallback((touchX: number) => {
        if (!chart || data.length === 0) {
            return;
        }

        const width = Math.max(1, size.width - chart.left - chart.right);
        const relativeX = clamp(touchX - chart.left, 0, width);
        const ratio = relativeX / width;
        const index = clamp(Math.round(ratio * Math.max(0, data.length - 1)), 0, Math.max(0, data.length - 1));
        if (lastIndexRef.current === index) {
            return;
        }

        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            if (lastIndexRef.current !== index) {
                setActiveIndex(index);
            }
        });
    }, [chart, data.length, size.width]);

    const panResponder = React.useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            const horizontalIntent = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) + 3;
            const enoughMovement = Math.abs(gestureState.dx) > 4;
            return horizontalIntent && enoughMovement;
        },
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
            const horizontalIntent = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) + 3;
            const enoughMovement = Math.abs(gestureState.dx) > 4;
            return horizontalIntent && enoughMovement;
        },
        onPanResponderGrant: (event) => {
            updateFromTouch(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
            updateFromTouch(event.nativeEvent.locationX);
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
    }), [updateFromTouch]);

    return (
        <View style={styles.wrapper}>
            {activePoint ? (
                <View style={[styles.tooltip, {
                    left: Math.max(8, Math.min(activePoint.x - 56, size.width - 116)),
                    top: 4,
                }]}>
                    <Text style={styles.tooltipLabel}>{activePoint.label}</Text>
                    <Text style={styles.tooltipValue}>
                        {activePoint.value.toLocaleString()} <Text style={styles.tooltipUnit}>kg/vol</Text>
                    </Text>
                </View>
            ) : null}

            <View style={styles.chartArea} onLayout={onLayout}>
                {chart ? (
                    <View
                        style={styles.touchLayer}
                        onTouchStart={(event) => updateFromTouch(event.nativeEvent.locationX)}
                        {...panResponder.panHandlers}
                    >
                        <Svg width={size.width} height={size.height}>
                            <Defs>
                                <LinearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="5%" stopColor={Colors.primary} stopOpacity={0.56} />
                                    <Stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                                </LinearGradient>
                            </Defs>

                            {chart.grid.map((item, index) => (
                                <Line
                                    key={`grid-${index}`}
                                    x1={chart.left}
                                    x2={size.width - chart.right}
                                    y1={item.y}
                                    y2={item.y}
                                    stroke="#F3F4F6"
                                    strokeWidth={1}
                                    strokeDasharray="4 4"
                                />
                            ))}

                            <Path d={chart.areaPath} fill="url(#volGrad)" />
                            <Path d={chart.linePath} fill="none" stroke={Colors.primary} strokeWidth={4} />

                            {activePoint ? (
                                <>
                                    <Line
                                        x1={activePoint.x}
                                        x2={activePoint.x}
                                        y1={chart.top}
                                        y2={chart.top + chart.innerHeight}
                                        stroke="#E5E7EB"
                                        strokeWidth={1}
                                    />
                                    <Circle cx={activePoint.x} cy={activePoint.y} r={6} fill={Colors.primary} />
                                    <Circle cx={activePoint.x} cy={activePoint.y} r={3} fill="#000000" />
                                </>
                            ) : null}

                            {chart.points.map((point, index) => {
                                const isFirst = index === 0;
                                const isLast = index === chart.points.length - 1;
                                const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
                                const x = isFirst ? point.x - 2 : isLast ? point.x + 2 : point.x;
                                return (
                                <SvgText
                                    key={`label-${point.label}`}
                                    x={x}
                                    y={size.height - 8}
                                    fill="#D1D5DB"
                                    fontSize={9}
                                    fontFamily={FontFamily.body.semiBold}
                                    textAnchor={anchor}
                                >
                                    {point.label}
                                </SvgText>
                                );
                            })}
                        </Svg>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        height: 220,
        justifyContent: 'flex-end',
    },
    tooltip: {
        position: 'absolute',
        width: 108,
        backgroundColor: '#000000',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#1F2937',
        zIndex: 10,
    },
    tooltipLabel: {
        color: '#9CA3AF',
        fontSize: 9,
        fontFamily: FontFamily.title.bold,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    tooltipValue: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: FontFamily.title.extraBold,
    },
    tooltipUnit: {
        color: Colors.primary,
    },
    chartArea: {
        marginHorizontal: -16,
        width: undefined,
        height: 190,
    },
    touchLayer: {
        width: '100%',
        height: '100%',
    },
});
