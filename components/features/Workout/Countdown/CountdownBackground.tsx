import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    Easing,
    withRepeat
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export function CountdownBackground() {
    const ripple1Scale = useSharedValue(0.5);
    const ripple1Opacity = useSharedValue(0);
    const ripple2Scale = useSharedValue(0.5);
    const ripple2Opacity = useSharedValue(0);
    const ripple3Scale = useSharedValue(0.5);
    const ripple3Opacity = useSharedValue(0);

    useEffect(() => {
        const rippleDuration = 2000;

        ripple1Scale.value = withRepeat(withTiming(2.5, { duration: rippleDuration, easing: Easing.out(Easing.quad) }), -1, false);
        ripple1Opacity.value = withRepeat(withSequence(withTiming(0.4, { duration: rippleDuration / 2 }), withTiming(0, { duration: rippleDuration / 2 })), -1, false);

        setTimeout(() => {
            ripple2Scale.value = withRepeat(withTiming(2.5, { duration: rippleDuration, easing: Easing.out(Easing.quad) }), -1, false);
            ripple2Opacity.value = withRepeat(withSequence(withTiming(0.3, { duration: rippleDuration / 2 }), withTiming(0, { duration: rippleDuration / 2 })), -1, false);
        }, 600);

        setTimeout(() => {
            ripple3Scale.value = withRepeat(withTiming(2.5, { duration: rippleDuration, easing: Easing.out(Easing.quad) }), -1, false);
            ripple3Opacity.value = withRepeat(withSequence(withTiming(0.2, { duration: rippleDuration / 2 }), withTiming(0, { duration: rippleDuration / 2 })), -1, false);
        }, 1200);
    }, []);

    const ripple1Style = useAnimatedStyle(() => ({
        transform: [{ scale: ripple1Scale.value }],
        opacity: ripple1Opacity.value,
    }));

    const ripple2Style = useAnimatedStyle(() => ({
        transform: [{ scale: ripple2Scale.value }],
        opacity: ripple2Opacity.value,
    }));

    const ripple3Style = useAnimatedStyle(() => ({
        transform: [{ scale: ripple3Scale.value }],
        opacity: ripple3Opacity.value,
    }));

    return (
        <>
            <LinearGradient
                colors={['#000000', '#1c1c1c', '#333333']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1.2 }}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.centerContainer}>
                <Animated.View style={[styles.ripple, ripple1Style]} />
                <Animated.View style={[styles.ripple, ripple2Style]} />
                <Animated.View style={[styles.ripple, ripple3Style]} />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ripple: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
});
