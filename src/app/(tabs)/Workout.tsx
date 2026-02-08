import { View, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing } from '@/src/constants/theme';
import { WeeklySummary } from '@/components/features/Workout/WeeklySummary';
import { History } from '@/components/features/Workout/History';
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
                    <History workouts={MOCK_WORKOUTS} />
                </View>


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
        paddingBottom: 100,
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
});
