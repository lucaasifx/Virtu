import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing } from "@/src/constants/theme";
import { MuscleGroup } from "@/src/types/workout";
import { MuscleGroupCard } from "@/components/features/Workout/SelectGroup/MuscleGroupCard";
import { BackButton } from "@/components/ui/BackButton";

const MUSCLE_GROUPS = [
    {
        id: MuscleGroup.CHEST,
        title: "Peito",
        image: require("@/assets/testes/chest.jpg"),
        exerciseCount: 12
    },
    {
        id: MuscleGroup.BACK,
        title: "Costas",
        image: require("@/assets/testes/back.jpg"),
        exerciseCount: 15
    },
    {
        id: MuscleGroup.LEGS,
        title: "Pernas",
        image: require("@/assets/testes/legs.jpg"),
        exerciseCount: 18
    },
    {
        id: MuscleGroup.SHOULDERS,
        title: "Ombros",
        image: require("@/assets/testes/shoulders.jpg"),
        exerciseCount: 10
    },
    {
        id: MuscleGroup.BICEPS,
        title: "Bíceps",
        image: require("@/assets/testes/biceps.jpg"),
        exerciseCount: 8
    },
    {
        id: MuscleGroup.TRICEPS,
        title: "Tríceps",
        image: require("@/assets/testes/triceps.jpg"),
        exerciseCount: 8
    },
    {
        id: MuscleGroup.ABS,
        title: "Abdômen",
        image: require("@/assets/testes/abdomen.jpg"),
        exerciseCount: 6
    },
    {
        id: MuscleGroup.CARDIO,
        title: "Cardio",
        image: require("@/assets/testes/cardio.jpg"),
        exerciseCount: 5
    },
    {
        id: MuscleGroup.FULL_BODY,
        title: "Full Body",
        image: require("@/assets/testes/fullbody.jpg"),
        exerciseCount: 4
    },
    {
        id: MuscleGroup.OTHER,
        title: "Outros",
        image: require("@/assets/testes/other.jpg"),
        exerciseCount: 0
    },
];

export default function SelectionScreen() {
    const [search, setSearch] = useState("");
    const [selectedGroups, setSelectedGroups] = useState<MuscleGroup[]>([]);
    const insets = useSafeAreaInsets();

    const toggleSelection = (group: MuscleGroup) => {
        if (selectedGroups.includes(group)) {
            setSelectedGroups(prev => prev.filter(g => g !== group));
        } else {
            setSelectedGroups(prev => [...prev, group]);
        }
    };

    const filteredGroups = MUSCLE_GROUPS.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <BackButton />
                    <Text variant="h3" style={styles.headerTitle}>NOVO TREINO</Text>
                    <View style={{ width: 40 }} />
                </View>

                <Text variant="h1" style={styles.pageTitle}>O que vamos treinar hoje?</Text>
                <Text variant="body" style={styles.subtitle}>Selecione o grupo muscular</Text>

                <Input
                    placeholder="Buscar exercício..."
                    value={search}
                    onChangeText={setSearch}
                    containerStyle={styles.searchContainer}
                    icon="search"
                />
            </View>

            <SafeAreaView style={styles.listContainer} edges={['bottom']}>
                <FlatList
                    key="list-1-col"
                    data={filteredGroups}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.gridContent}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={false}
                    initialNumToRender={4}
                    maxToRenderPerBatch={4}
                    windowSize={5}
                    renderItem={({ item }) => (
                        <MuscleGroupCard
                            muscleGroup={item.id}
                            title={item.title}
                            image={item.image}
                            isSelected={selectedGroups.includes(item.id)}
                            onPress={() => toggleSelection(item.id)}
                            exerciseCount={item.exerciseCount}
                        />
                    )}
                />
                <View style={styles.footer}>
                    <Button
                        title="AVANÇAR"
                        onPress={() => console.log("Avançar")}
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
        marginTop: Spacing.sm,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    headerTitle: {
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: Colors.text.primary,
        fontSize: 16,
    },
    pageTitle: {
        marginBottom: Spacing.xs,
    },
    subtitle: {
        color: Colors.text.secondary,
        marginBottom: Spacing.lg,
    },
    searchContainer: {
        marginBottom: Spacing.sm,
    },
    gridContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
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
