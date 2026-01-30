import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/src/constants/theme';
import { WeeklySummary } from '@/components/features/Workout/WeeklySummary';
import { WorkoutSessionCard } from '@/components/features/Workout/WorkoutSessionCard';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import UserHeader from '@/components/ui/UserHeader';
import NewWorkoutButton from '@/components/features/Workout/NewWorkoutButton';

import { MOCK_WORKOUTS } from '@/src/data/mockWorkouts';

export default function Workout() {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.section}>
                    <UserHeader />
                </View>

                <View style={styles.section}>
                    <WeeklySummary />
                </View>

                <View style={styles.section}>
                    <Text variant="h2" style={{ marginBottom: Spacing.xs }}>Histórico Recente</Text>

                    <View>
                        {MOCK_WORKOUTS.map((workout) => (
                            <WorkoutSessionCard
                                key={workout.id}
                                workout={workout}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.heightSpacer} />
            </ScrollView>
            <NewWorkoutButton />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingTop: 60,
        gap: Spacing.lg,
    },
    section: {
        gap: Spacing.sm,
    },
    fabContainer: {
        position: 'absolute',
        bottom: Spacing.lg,
        alignSelf: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    fabButton: {
        borderRadius: 32,
        paddingHorizontal: 32,
        height: 56,
    },
    heightSpacer: {
        height: 100,
    },
});
