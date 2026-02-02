import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from "@/src/constants/theme";
import { ComingSoon } from "@/components/ui/ComingSoon";
import Animated, {
    useAnimatedStyle,
    interpolate
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

import { useCountdownController } from '../../../../src/hooks/workout/useCountdownController';
import { CountdownBackground } from './CountdownBackground';
import { CountdownDisplay } from './CountdownDisplay';

const { width, height } = Dimensions.get('window');
const MAX_RADIUS = Math.sqrt(width * width + height * height);

export function WorkoutCountdown() {
    const { count, phase, circleScale, contentOpacity } = useCountdownController();

    const finalCircleStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: interpolate(circleScale.value, [0, 1], [0, MAX_RADIUS / 20]) }],
        };
    });

    const contentStyle = useAnimatedStyle(() => {
        return {
            opacity: contentOpacity.value
        };
    });

    if (phase === 'completed') {
        return <ComingSoon />;
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" translucent backgroundColor="transparent" />

            <CountdownBackground />

            <Animated.View style={[styles.transitionCircle, finalCircleStyle]} />

            <Animated.View style={[styles.content, contentStyle]}>
                <CountdownDisplay count={count} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    content: {
        alignItems: 'center',
        zIndex: 10,
    },
    transitionCircle: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        zIndex: 100,
    },
});
