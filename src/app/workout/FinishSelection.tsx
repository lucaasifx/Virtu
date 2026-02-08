import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WorkoutCountdown } from '@/components/features/Workout/Countdown/WorkoutCountdown';

export default function FinishSelectionScreen() {
    return (
        <View style={styles.container}>
            <WorkoutCountdown />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
});
