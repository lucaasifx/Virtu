import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, BackHandler } from 'react-native';
import { Colors } from "@/src/constants/theme";
import { useActiveWorkout } from '@/src/context/ActiveWorkoutContext';
import { Redirect, useRouter } from 'expo-router';
import { ExecutionHeader } from '@/components/features/Workout/Execution/ExecutionHeader';
import { WorkoutPlayerBar } from '@/components/features/Workout/Execution/WorkoutPlayerBar';
import { ActiveExerciseHeader } from '@/components/features/Workout/Execution/ActiveExerciseHeader';
import { SetTracker } from '@/components/features/Workout/Execution/SetTracker';
import { HistoryList } from '@/components/features/Workout/Execution/HistoryList';
import { UpNextCard } from '@/components/features/Workout/Execution/UpNextCard';
import { CancelWorkoutModal } from '@/components/features/Workout/Execution/CancelWorkoutModal';
import { getExerciseById } from '@/src/constants/exercises';

export default function ExecutionScreen() {
    const { session, getActiveExercise, cancelWorkout } = useActiveWorkout();
    const router = useRouter();
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => {
        const backAction = () => {
            setShowCancelModal(true);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    if (!session) {
        return <Redirect href="/" />;
    }

    const handleEdit = () => {
        const activeEx = getActiveExercise();
        if (activeEx) {
            const def = getExerciseById(activeEx.exerciseId);
            if (def && def.muscleGroup) {
                router.push({
                    pathname: '/workout/ExerciseSelection',
                    params: { mode: 'edit', muscleGroup: def.muscleGroup }
                });
            }
        }
    };

    return (
        <View style={styles.container}>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <ExecutionHeader onEditPress={handleEdit} />
                <ActiveExerciseHeader />
                <SetTracker key={getActiveExercise()?.exerciseId} />
                <HistoryList />
                <UpNextCard />
            </ScrollView>

            <WorkoutPlayerBar />

            <CancelWorkoutModal
                visible={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={() => {
                    setShowCancelModal(false);
                    cancelWorkout();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 150,
    }
});
