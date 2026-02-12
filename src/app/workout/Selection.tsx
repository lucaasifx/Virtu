import React, { useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Colors, FontFamily, Spacing } from "@/src/constants/theme";
import { MuscleGroup } from "@/src/types/workout";
import { MuscleGroupCard } from "@/components/features/Workout/SelectGroup/MuscleGroupCard";
import { GoalSelector } from "@/components/features/Workout/GoalSelector";
import { useWorkoutCreation } from "@/src/context/WorkoutContext";
import { MUSCLE_GROUPS } from "@/src/constants/muscleGroups";

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

    const onToggle = (group: MuscleGroup) => {
        if (selectedGroups.includes(group)) {
            setSelectedGroups(selectedGroups.filter(g => g !== group));
            clearExercisesForGroup(group);
        } else {
            setSelectedGroups([...selectedGroups, group]);
        }
    };

    const renderItem = React.useCallback(({ item }: { item: typeof MUSCLE_GROUPS[0] }) => (
        <MuscleGroupCard
            muscleGroup={item.id}
            title={item.title}
            image={item.image}
            isSelected={selectedGroups.includes(item.id)}
            onPress={() => onToggle(item.id)}
            exerciseCount={item.exerciseCount}
        />
    ), [selectedGroups]);

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
                {/* Header */}
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
                                <Text style={styles.label}>Quais grupos iremos treinar?</Text>
                                <Text style={[styles.label, { color: '#FDCB13' }]}>Múltipla Escolha</Text>
                            </View>
                        </View>
                    }
                    renderItem={renderItem}
                />

                <View style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}>
                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={selectedGroups.length === 0}
                        style={[
                            styles.primaryButton,
                            selectedGroups.length === 0 && styles.buttonDisabled
                        ]}
                    >
                        <Text style={[styles.primaryButtonText, selectedGroups.length === 0 && { color: '#9CA3AF' }]}>Avançar</Text>
                        <Feather name="chevron-right" size={18} color={selectedGroups.length > 0 ? "#111" : "#9CA3AF"} />
                    </TouchableOpacity>
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
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    primaryButton: {
        backgroundColor: '#FDCB13',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 30,
        gap: 8,
        shadowColor: '#FDCB13',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#E5E7EB',
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryButtonText: {
        fontSize: 14,
        fontFamily: FontFamily.title.bold,
        color: '#111',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
