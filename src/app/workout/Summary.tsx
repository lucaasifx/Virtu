import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { StatusBar } from 'expo-status-bar';

export default function WorkoutSummaryScreen() {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ComingSoon redirectHref="/(tabs)/Workout" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    }
});
