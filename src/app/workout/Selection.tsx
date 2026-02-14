import React from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Colors, FontFamily } from "@/src/constants/theme";
import { MuscleGroup } from "@/src/types/workout";
import { MuscleGroupCard } from "@/components/features/Workout/SelectGroup/MuscleGroupCard";
import { GoalSelector } from "@/components/features/Workout/GoalSelector";
import { useWorkoutCreation } from "@/src/context/WorkoutContext";
import { MUSCLE_GROUPS } from "@/src/constants/muscleGroups";
import WorkoutActionButton from "@/components/features/Workout/WorkoutActionButton";

const FORM_CATEGORIES = ['Hipertrofia', 'Força', 'Cardio', 'Funcional'];

export default function SelectionScreen() {
    const insets = useSafeAreaInsets();
    const {
        selectedGroups,
        setSelectedGroups,
        clearExercisesForGroup,
        workoutCategory,
        setWorkoutCategory
    } = useWorkoutCreation();

    const onToggle = React.useCallback((group: MuscleGroup) => {
        if (selectedGroups.includes(group)) {
            setSelectedGroups(selectedGroups.filter(g => g !== group));
            clearExercisesForGroup(group);
        } else {
            setSelectedGroups([...selectedGroups, group]);
        }
    }, [clearExercisesForGroup, selectedGroups, setSelectedGroups]);

    const renderItem = React.useCallback(({ item }: { item: typeof MUSCLE_GROUPS[0] }) => (
        <MuscleGroupCard
            muscleGroup={item.id}
            title={item.title}
            image={item.image}
            isSelected={selectedGroups.includes(item.id)}
            onPress={() => onToggle(item.id)}
            exerciseCount={item.exerciseCount}
        />
    ), [onToggle, selectedGroups]);

    const handleNext = () => {
        if (selectedGroups.length > 0)
            router.push({ pathname: "/workout/ExerciseSelection", params: { groupIndex: 0 } });
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={styles.content} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-left" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Criar Rotina</Text>
                </View>

                <FlatList
                    data={MUSCLE_GROUPS}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View style={styles.topSection}>
                            <GoalSelector
                                categories={FORM_CATEGORIES}
                                selectedCategory={workoutCategory}
                                onSelectCategory={setWorkoutCategory}
                            />

                            <View style={styles.rowBetween}>
                                <Text style={styles.headerTitle}>Quais grupos iremos treinar?</Text>
                            </View>
                        </View>
                    }
                    renderItem={renderItem}
                />

                <View style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}>
                    <WorkoutActionButton
                        title="AVANÇAR"
                        onPress={handleNext}
                        disabled={selectedGroups.length === 0}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: FontFamily.title.extraBold,
        color: '#111',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    topSection: {
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        fontFamily: FontFamily.title.bold,
        color: '#111',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
    },
});
