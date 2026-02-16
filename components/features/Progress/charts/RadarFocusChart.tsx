import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { Colors, FontFamily } from '@/src/constants/theme';
import { RadarPoint } from '@/src/hooks/progress/useProgressInsights';

interface RadarFocusChartProps {
    data: RadarPoint[];
}

interface Point {
    x: number;
    y: number;
}

function toPoint(cx: number, cy: number, radius: number, index: number, total: number): Point {
    const angle = ((Math.PI * 2) / total) * index - (Math.PI / 2);
    return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
    };
}

function pointsString(points: Point[]): string {
    return points.map((point) => `${point.x},${point.y}`).join(' ');
}

export function RadarFocusChart({ data }: RadarFocusChartProps) {
    const [size, setSize] = React.useState(0);

    const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
        const nextSize = Math.min(event.nativeEvent.layout.width, event.nativeEvent.layout.height);
        if (nextSize > 0) {
            setSize(nextSize);
        }
    }, []);

    const content = React.useMemo(() => {
        if (size <= 0 || data.length === 0) {
            return null;
        }

        const cx = size / 2;
        const cy = size / 2;
        const radius = size * 0.36;
        const levels = 5;

        const axisPoints = data.map((_, index) => toPoint(cx, cy, radius, index, data.length));
        const gridPolygons = Array.from({ length: levels }, (_, level) => {
            const ratio = (level + 1) / levels;
            return axisPoints.map((point) => ({
                x: cx + (point.x - cx) * ratio,
                y: cy + (point.y - cy) * ratio,
            }));
        });

        const dataPoints = data.map((item, index) => {
            const ratio = item.fullMark <= 0 ? 0 : Math.max(0, Math.min(1, item.value / item.fullMark));
            return {
                x: cx + (axisPoints[index].x - cx) * ratio,
                y: cy + (axisPoints[index].y - cy) * ratio,
            };
        });

        return {
            cx,
            cy,
            axisPoints,
            gridPolygons,
            dataPoints,
            radius,
        };
    }, [data, size]);

    return (
        <View onLayout={handleLayout} style={styles.wrapper}>
            {content ? (
                <Svg width={size} height={size}>
                    <G>
                        {content.gridPolygons.map((polygon, index) => (
                            <Polygon
                                key={`grid-${index}`}
                                points={pointsString(polygon)}
                                fill="none"
                                stroke="#F3F4F6"
                                strokeWidth={1}
                            />
                        ))}

                        {content.axisPoints.map((point, index) => (
                            <Line
                                key={`axis-${index}`}
                                x1={content.cx}
                                y1={content.cy}
                                x2={point.x}
                                y2={point.y}
                                stroke="#F3F4F6"
                                strokeWidth={1}
                            />
                        ))}

                        <Polygon
                            points={pointsString(content.dataPoints)}
                            fill={Colors.primary}
                            fillOpacity={0.26}
                            stroke={Colors.primary}
                            strokeWidth={3}
                        />

                        {content.dataPoints.map((point, index) => (
                            <Circle
                                key={`dot-${index}`}
                                cx={point.x}
                                cy={point.y}
                                r={4}
                                fill={Colors.primary}
                            />
                        ))}

                        {content.axisPoints.map((point, index) => {
                            const labelDistance = content.radius + 22;
                            const labelPoint = toPoint(content.cx, content.cy, labelDistance, index, data.length);
                            return (
                                <SvgText
                                    key={`label-${index}`}
                                    x={labelPoint.x}
                                    y={labelPoint.y}
                                    fill="#9CA3AF"
                                    fontSize={10}
                                    fontFamily={FontFamily.title.bold}
                                    fontWeight="800"
                                    textAnchor="middle"
                                    dy={4}
                                >
                                    {data[index].subject}
                                </SvgText>
                            );
                        })}
                    </G>
                </Svg>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        aspectRatio: 1,
    },
});
