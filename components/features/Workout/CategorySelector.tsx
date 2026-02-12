import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontFamily } from '@/src/constants/theme';

interface CategorySelectorProps {
    categories: string[];
    activeCategory: string;
    onSelectCategory: (category: string) => void;
}

export function CategorySelector({ categories, activeCategory, onSelectCategory }: CategorySelectorProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
            style={styles.categoriesContainer}
        >
            {categories.map((cat) => (
                <TouchableOpacity
                    key={cat}
                    onPress={() => onSelectCategory(cat)}
                    style={styles.categoryTab}
                >
                    <Text style={[
                        styles.categoryText,
                        activeCategory === cat ? { color: '#000' } : { color: '#9CA3AF' }
                    ]}>{cat}</Text>
                    {activeCategory === cat && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    categoriesContainer: {
        marginBottom: 32,
    },
    categoriesScroll: {
        gap: 24,
        paddingBottom: 4,
        paddingRight: 24,
    },
    categoryTab: {
        paddingBottom: 12,
        position: 'relative',
    },
    categoryText: {
        fontSize: 12,
        fontFamily: FontFamily.title.extraBold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#FDCB13',
        borderRadius: 1,
    },
});
