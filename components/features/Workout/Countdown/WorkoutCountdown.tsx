import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from "@/src/constants/theme";
import Animated, {
    useAnimatedStyle,
    interpolate
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useActiveWorkout } from '@/src/context/ActiveWorkoutContext';
import { useWorkoutCreation } from '@/src/context/WorkoutContext';
import { useCountdownController } from '@/src/hooks/workout/useCountdownController';
import { CountdownBackground } from './CountdownBackground';
import { CountdownDisplay } from './CountdownDisplay';

const { width, height } = Dimensions.get('window');
const MAX_RADIUS = Math.sqrt(width * width + height * height);

export function WorkoutCountdown() {
    const { count, phase, circleScale, contentOpacity } = useCountdownController();
    const router = useRouter();
    const { startWorkout } = useActiveWorkout();
    const { selectedGroups, selections } = useWorkoutCreation();

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

    useEffect(() => {
        if (phase === 'completed') {
            const allExercises = selectedGroups.flatMap(group => selections[group] || []);
            startWorkout(allExercises, selectedGroups);
            router.replace('/workout/Execution');
        }
    }, [phase]);


    if (phase === 'completed') {
        return (
            <View style={styles.container} />
        );
    }

    return (
        <View style={styles.container}>
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
