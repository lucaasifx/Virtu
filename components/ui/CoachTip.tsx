import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { FontFamily } from '@/src/constants/theme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface CoachTipProps {
    tip: string;
}

export function CoachTip({ tip }: CoachTipProps) {
    return (
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.insightCard}>
            <View style={styles.insightIconBox}>
                <Feather name="coffee" size={20} color="#9CA3AF" />
            </View>
            <Text style={styles.insightText}>
                {`"${tip}"`}
            </Text>
            <View style={styles.insightFooter}>
                <View style={styles.insightLine} />
                <Text style={styles.insightLabel}>DICA DO COACH</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    insightCard: {
        marginBottom: 32,
        padding: 24,
        backgroundColor: '#F8F9FA',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        position: 'relative',
    },
    insightIconBox: {
        position: 'absolute',
        top: -12,
        left: 24,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 8,
        borderRadius: 20,
    },
    insightText: {
        fontSize: 14,
        fontFamily: FontFamily.body.medium,
        color: '#4B5563',
        fontStyle: 'italic',
        lineHeight: 24,
    },
    insightFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    insightLine: {
        width: 20,
        height: 1,
        backgroundColor: '#D1D5DB',
    },
    insightLabel: {
        fontSize: 10,
        fontFamily: FontFamily.title.extraBold,
        color: '#9CA3AF',
        textTransform: 'uppercase',
    },
});
