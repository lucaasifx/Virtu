import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontFamily } from "@/src/constants/theme";

// MOCK DATA
export const WEEKLY_STATS = [
    { day: "SEG", value: 30 },
    { day: "TER", value: 45 },
    { day: "QUA", value: 60 },
    { day: "QUI", value: 100 },
    { day: "SEX", value: 45 },
    { day: "SÁB", value: 80 },
    { day: "DOM", value: 20 },
];

export function WeeklySummary() {
    return (
        <Card style={styles.summaryCard}>
            <View style={styles.headerColumn}>
                <Text variant="caption" style={styles.cardLabel}>FREQUÊNCIA SEMANAL</Text>
                <View style={styles.bigStatContainer}>
                    <Text style={styles.bigStatNumber}>4</Text>
                    <Text style={styles.bigStatUnit}>TREINOS</Text>
                </View>
            </View>

            <View style={styles.chartContainer}>
                {WEEKLY_STATS.map((stat, index) => (
                    <View key={index} style={styles.barGroup}>
                        <View style={styles.barTrack}>
                            <View
                                style={[
                                    styles.barFill,
                                    {
                                        height: `${stat.value}%`,
                                        backgroundColor: Colors.primary
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.dayLabel}>
                            {stat.day}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.statsFooter}>
                <View style={styles.footerStatItem}>
                    <Text variant="caption" style={styles.footerLabel}>DURAÇÃO</Text>
                    <View style={styles.footerValueContainer}>
                        <Text style={styles.footerValue}>3</Text>
                        <Text style={styles.footerUnit}>H</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.footerStatItem}>
                    <Text variant="caption" style={styles.footerLabel}>CARGA</Text>
                    <View style={styles.footerValueContainer}>
                        <Text style={styles.footerValue}>12.5</Text>
                        <Text style={styles.footerUnit}>TON</Text>
                    </View>
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    summaryCard: {
        padding: Spacing.xl,
        gap: Spacing.lg,
        borderRadius: 24,
    },
    headerColumn: {
        gap: 4,
    },
    cardLabel: {
        color: Colors.gray[400],
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    bigStatContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    bigStatNumber: {
        fontFamily: FontFamily.title.extraBold,
        fontSize: 42,
        color: Colors.gray[800],
        lineHeight: 48,
        letterSpacing: -1,
    },
    bigStatUnit: {
        fontFamily: FontFamily.title.bold,
        fontSize: 16,
        color: Colors.gray[400],
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 140,
        alignItems: 'flex-end',
        marginVertical: Spacing.sm,
    },
    barGroup: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        flex: 1,
        height: '100%',
    },
    barTrack: {
        width: 24,
        flex: 1,
        backgroundColor: Colors.gray[100],
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        justifyContent: 'flex-end',
    },
    barFill: {
        width: '100%',
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    dayLabel: {
        fontSize: 10,
        color: Colors.gray[400],
        fontWeight: 'bold',
    },
    statsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: Spacing.sm,
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: Colors.gray[200],
    },
    footerStatItem: {
        alignItems: 'center',
        gap: 2,
    },
    footerLabel: {
        color: Colors.gray[400],
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    footerValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 3,
    },
    footerValue: {
        fontFamily: FontFamily.title.extraBold,
        fontSize: 24,
        color: Colors.gray[800],
        letterSpacing: -0.5,
    },
    footerUnit: {
        fontFamily: FontFamily.title.bold,
        fontSize: 12,
        color: Colors.gray[400],
    },
});
