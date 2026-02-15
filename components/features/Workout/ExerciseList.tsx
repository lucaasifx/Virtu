import React, { ReactElement } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Exercise } from "@/src/types/workout";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withSpring, interpolateColor, useDerivedValue } from "react-native-reanimated";

interface ExerciseListProps {
    exercises: Exercise[];
    selectedIds: string[];
    onToggle: (id: string) => void;
    listHeaderComponent?: ReactElement;
}

const CHECKBOX_SIZE = 24;

const ExerciseItem = React.memo(({
    item,
    isSelected,
    onToggle
}: {
    item: Exercise;
    isSelected: boolean;
    onToggle: () => void;
}) => {
    const scale = useDerivedValue(() => {
        return withSpring(isSelected ? 1 : 0);
    }, [isSelected]);

    const checkboxStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const containerAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            scale.value,
            [0, 1],
            [Colors.background, Colors.surface]
        );
        return { backgroundColor };
    });

    return (
        <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.7}
            style={styles.itemWrapper}
        >
            <Animated.View style={[styles.itemContainer, containerAnimatedStyle]}>
                <View style={styles.textContainer}>
                    <Text variant="body" style={isSelected ? styles.selectedText : styles.text}>
                        {item.name}
                    </Text>
                </View>

                <View style={[styles.checkboxBase, isSelected && styles.checkboxSelectedBase]}>
                    {isSelected && (
                        <Animated.View style={checkboxStyle}>
                            <Ionicons name="checkmark" size={16} color={Colors.background} />
                        </Animated.View>
                    )}
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
});
ExerciseItem.displayName = 'ExerciseItem';

export default function ExerciseList({
    exercises,
    selectedIds,
    onToggle,
    listHeaderComponent
}: ExerciseListProps) {
    const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

    const renderItem = React.useCallback(({ item }: { item: Exercise }) => (
        <ExerciseItem
            item={item}
            isSelected={selectedSet.has(item.id)}
            onToggle={() => onToggle(item.id)}
        />
    ), [onToggle, selectedSet]);

    const itemSeparator = React.useCallback(() => <View style={styles.separator} />, []);

    return (
        <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={listHeaderComponent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            ItemSeparatorComponent={itemSeparator}
            initialNumToRender={14}
            windowSize={9}
            maxToRenderPerBatch={16}
            removeClippedSubviews
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: Spacing.xxl + 40,
        paddingHorizontal: Spacing.lg,
    },
    itemWrapper: {
        marginBottom: Spacing.xs,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: Spacing.sm,
    },
    textContainer: {
        flex: 1,
        marginRight: Spacing.md,
    },
    text: {
        color: Colors.text.primary,
        fontSize: 16,
    },
    selectedText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    checkboxBase: {
        width: CHECKBOX_SIZE,
        height: CHECKBOX_SIZE,
        borderRadius: CHECKBOX_SIZE / 2,
        borderWidth: 2,
        borderColor: Colors.gray[300],
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelectedBase: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.gray[100],
        marginLeft: Spacing.lg,
    }
});
