import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontFamily } from '@/src/constants/theme';

interface GoalSelectorProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export function GoalSelector({ categories, selectedCategory, onSelectCategory }: GoalSelectorProps) {
    return (
        <View style={styles.mb6}>
            <Text style={styles.label}>Objetivo</Text>
            <View style={styles.pillContainer}>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => onSelectCategory(cat)}
                        style={[
                            styles.pillButton,
                            selectedCategory === cat ? styles.pillSelected : styles.pillUnselected
                        ]}
                    >
                        <Text style={[
                            styles.pillText,
                            selectedCategory === cat ? { color: '#FFF' } : { color: '#9CA3AF' }
                        ]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mb6: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontFamily: FontFamily.title.bold,
        color: '#111',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    pillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    pillButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
    },
    pillSelected: {
        backgroundColor: '#111',
        borderColor: '#111',
    },
    pillUnselected: {
        backgroundColor: '#FFF',
        borderColor: '#E5E7EB',
    },
    pillText: {
        fontSize: 12,
        fontFamily: FontFamily.body.semiBold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
