import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { FontFamily } from '@/src/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Greetings() {
    const now = new Date();
    const dateStr = format(now, "EEEE, d MMM", { locale: ptBR }).toUpperCase();

    const hour = now.getHours();
    let greeting = 'Bom dia';
    if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
    else if (hour >= 18) greeting = 'Boa noite';

    return (
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
            <Text style={styles.dateLabel}>{dateStr}</Text>
            <View style={styles.greetingRow}>
                <Text style={styles.greetingText}>
                    {greeting}, <Text style={styles.highlightText}>Atleta.</Text>
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 24,
    },
    dateLabel: {
        fontSize: 10,
        fontFamily: FontFamily.body.semiBold,
        color: '#9CA3AF',
        letterSpacing: 1.5,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    greetingText: {
        fontSize: 30,
        fontFamily: FontFamily.title.extraBold,
        color: '#111',
        letterSpacing: -1,
    },
    highlightText: {
        color: '#FDCB13',
    },
});
