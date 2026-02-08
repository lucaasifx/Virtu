import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { Colors } from '@/src/constants/theme';

interface ProgressRingProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    children?: React.ReactNode;
}

export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 10,
    children
}: ProgressRingProps) {
    const animatedProgress = useSharedValue(0);

    React.useEffect(() => {
        animatedProgress.value = withTiming(progress / 100, { duration: 800 });
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${animatedProgress.value * 100}%`,
    }));

    const trackSize = size - strokeWidth * 2;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View style={[styles.trackOuter, { borderRadius: size / 2, borderWidth: strokeWidth }]}>
                <View style={[styles.trackInner, { width: trackSize, height: trackSize, borderRadius: trackSize / 2 }]}>
                    <View style={styles.content}>
                        {children}
                    </View>
                </View>
            </View>

            <View style={[styles.progressContainer, { width: size, height: size }]}>
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, animatedStyle]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackOuter: {
        borderColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackInner: {
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        position: 'absolute',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 8,
    },
    progressTrack: {
        width: '80%',
        height: 4,
        backgroundColor: '#2A2A2A',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
});
