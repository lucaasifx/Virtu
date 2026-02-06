import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing } from "@/src/constants/theme";
import { MuscleGroup } from "@/src/types/workout";
import { MuscleGroupCard } from "@/components/features/Workout/SelectGroup/MuscleGroupCard";
import SelectionHeader from "@/components/features/Workout/SelectionHeader";
import { useWorkoutCreation } from "@/src/context/WorkoutContext";
import { MUSCLE_GROUPS } from "@/src/constants/muscleGroups";

export default function SelectionScreen() {
    const [search, setSearch] = useState("");
    const { selectedGroups, setSelectedGroups, clearExercisesForGroup } = useWorkoutCreation();



    const onToggle = (group: MuscleGroup) => {
        if (selectedGroups.includes(group)) {
            setSelectedGroups(selectedGroups.filter(g => g !== group));
            clearExercisesForGroup(group);
        } else {
            setSelectedGroups([...selectedGroups, group]);
        }
    };

    const filteredGroups = MUSCLE_GROUPS.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase())
    );

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

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={styles.listContainer} edges={['bottom']}>
                <FlatList
                    key="list-1-col"
                    data={filteredGroups}
                    extraData={selectedGroups}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.gridContent}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={false}
                    initialNumToRender={4}
                    maxToRenderPerBatch={4}
                    windowSize={5}
                    ListHeaderComponent={
                        <SelectionHeader
                            search={search}
                            onSearchChange={setSearch}
                        />
                    }
                    renderItem={renderItem}
                />
                <View style={styles.footer}>
                    <Button
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
    listContainer: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: Colors.background,
    },
    gridContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl + 20,
    },
    gridColumn: {
        justifyContent: 'space-between',
    },
    footer: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
    }
});
