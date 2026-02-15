import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily } from '@/src/constants/theme';
import { ProgressGroupId, useProgressInsights } from '@/src/hooks/progress/useProgressInsights';
import { RadarFocusChart } from './charts/RadarFocusChart';
import { VolumeEvolutionChart } from './charts/VolumeEvolutionChart';
import { CoachTip } from '@/components/ui/CoachTip';

export function ProgressDashboard() {
    const {
        isLoading,
        selectorGroups,
        radarData,
        strongest,
        weakest,
        groupData,
        consistency,
        volumeDistribution,
        performanceSummary
    } = useProgressInsights();
    const [activeGroup, setActiveGroup] = React.useState<ProgressGroupId>('Peitoral');

    const groupStats = groupData[activeGroup] ?? groupData.Peitoral;

    if (isLoading) {
        return (
            <View style={styles.loadingWrapper}>
                <ActivityIndicator color="#000000" />
            </View>
        );
    }

    return (
        <View>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.overline}>Performance Corporal</Text>
                    <Text style={styles.title}>
                        Sua <Text style={styles.titleAccent}>Evolução.</Text>
                    </Text>
                </View>
            </View>

            <View style={styles.block}>
                <View style={styles.card}>
                    <View style={styles.cardCenterHeader}>
                        <Text style={styles.cardHeaderText}>Simetria & Foco</Text>
                    </View>

                    <View style={styles.radarWrapper}>
                        <RadarFocusChart data={radarData} />
                    </View>

                    <View style={styles.radarStatsRow}>
                        <View style={styles.radarStat}>
                            <Text style={styles.radarStatLabel}>Ponto Forte</Text>
                            <Text style={styles.radarStatValue}>{strongest}</Text>
                        </View>
                        <View style={styles.radarStat}>
                            <Text style={styles.radarStatLabel}>Atenção</Text>
                            <Text style={styles.radarStatValue}>{weakest}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.blockSmall}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupSelector}>
                    {selectorGroups.map((group) => {
                        const isActive = activeGroup === group;
                        return (
                            <Pressable
                                key={group}
                                onPress={() => setActiveGroup(group)}
                                style={[styles.groupChip, isActive ? styles.groupChipActive : styles.groupChipIdle]}
                            >
                                <Text style={[styles.groupChipText, isActive ? styles.groupChipTextActive : styles.groupChipTextIdle]}>
                                    {group}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={styles.block}>
                <View style={styles.card}>
                    <View style={styles.volumeHeaderRow}>
                        <View>
                            <Text style={styles.volumeLabel}>Evolução de Carga</Text>
                            <Text style={styles.volumeTitle}>Volume Total</Text>
                        </View>
                        <View style={styles.growthBlock}>
                            <Text style={styles.growthValue}>{groupStats.growth}</Text>
                            <Text style={styles.growthLabel}>vs. mês anterior</Text>
                        </View>
                    </View>

                    <VolumeEvolutionChart data={groupStats.history} />

                    <View style={styles.divider} />

                    <View style={styles.metricsGrid}>
                        <View style={styles.metricCell}>
                            <Text style={styles.metricLabel}>Melhor Marca</Text>
                            <View style={styles.metricValueRow}>
                                <Ionicons name="trophy" size={14} color={Colors.primary} />
                                <Text style={styles.metricValue}>{groupStats.bestLift}</Text>
                            </View>
                            <Text style={styles.metricSub}>{groupStats.bestLiftName}</Text>
                        </View>

                        <View style={styles.metricCell}>
                            <Text style={styles.metricLabel}>Volume Acumulado</Text>
                            <View style={styles.metricValueRow}>
                                <Ionicons name="flash" size={14} color="#000000" />
                                <Text style={styles.metricValue}>{groupStats.totalVolume}</Text>
                            </View>
                            <Text style={styles.metricSub}>Últimos 30 dias</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.block}>
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>Consistência</Text>
                    <Text style={styles.sectionTitle}>Últimos 14 dias</Text>

                    <View style={styles.consistencyRow}>
                        {consistency.map((day) => (
                            <View key={day.key} style={styles.dayItem}>
                                <View style={[
                                    styles.dayDot,
                                    day.active ? styles.dayDotActive : styles.dayDotIdle,
                                    day.isToday && styles.dayDotToday,
                                ]} />
                                <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>{day.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryKpi}>{performanceSummary.workoutsLast30Days}</Text>
                            <Text style={styles.summaryLabel}>treinos / 30 dias</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryKpi}>{performanceSummary.avgDurationMinutes} min</Text>
                            <Text style={styles.summaryLabel}>duração média</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryKpi}>{performanceSummary.avgRpe.toFixed(1)}</Text>
                            <Text style={styles.summaryLabel}>RPE médio</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.block}>
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>Distribuição</Text>
                    <Text style={styles.sectionTitle}>Volume por grupamento</Text>

                    <View style={styles.distributionList}>
                        {volumeDistribution.map((item) => (
                            <View key={item.label} style={styles.distributionItem}>
                                <View style={styles.distributionHeader}>
                                    <Text style={styles.distributionName}>{item.label}</Text>
                                    <Text style={styles.distributionMeta}>{item.volume} • {item.percent}%</Text>
                                </View>
                                <View style={styles.distributionTrack}>
                                    <View style={[styles.distributionFill, { width: `${Math.max(4, item.percent)}%` }]} />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            <CoachTip
                tip={`Seu ${weakest.toLowerCase()} está abaixo do seu ponto forte (${strongest.toLowerCase()}). Ajuste o volume dessa região no próximo bloco de treino.`}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    loadingWrapper: {
        paddingTop: 24,
        paddingBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    overline: {
        fontSize: 10,
        fontFamily: FontFamily.title.bold,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    title: {
        fontSize: 32,
        lineHeight: 34,
        fontFamily: FontFamily.title.extraBold,
        color: '#111111',
        letterSpacing: -1,
    },
    titleAccent: {
        color: Colors.primary,
    },
    block: {
        marginBottom: 24,
    },
    blockSmall: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        padding: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardCenterHeader: {
        alignItems: 'center',
        marginTop: 2,
    },
    cardHeaderText: {
        fontSize: 12,
        fontFamily: FontFamily.title.extraBold,
        color: '#111827',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    radarWrapper: {
        marginTop: 6,
        marginBottom: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radarStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 4,
    },
    radarStat: {
        alignItems: 'center',
    },
    radarStatLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: FontFamily.title.bold,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    radarStatValue: {
        fontSize: 14,
        color: '#000000',
        fontFamily: FontFamily.title.extraBold,
    },
    groupSelector: {
        gap: 8,
        paddingBottom: 2,
    },
    groupChip: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    groupChipActive: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    groupChipIdle: {
        backgroundColor: '#FFFFFF',
        borderColor: '#F3F4F6',
    },
    groupChipText: {
        fontSize: 12,
        fontFamily: FontFamily.title.extraBold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    groupChipTextActive: {
        color: '#FFFFFF',
    },
    groupChipTextIdle: {
        color: '#9CA3AF',
    },
    volumeHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    volumeLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: FontFamily.title.bold,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 3,
    },
    volumeTitle: {
        fontSize: 28,
        lineHeight: 30,
        color: '#000000',
        fontFamily: FontFamily.title.extraBold,
        letterSpacing: -0.8,
    },
    growthBlock: {
        alignItems: 'flex-end',
    },
    growthValue: {
        fontSize: 24,
        color: Colors.primary,
        fontFamily: FontFamily.title.extraBold,
    },
    growthLabel: {
        fontSize: 9,
        color: '#9CA3AF',
        fontFamily: FontFamily.title.bold,
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginTop: 8,
        marginBottom: 14,
    },
    metricsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    metricCell: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 9,
        color: '#9CA3AF',
        fontFamily: FontFamily.title.bold,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    metricValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 16,
        color: '#000000',
        fontFamily: FontFamily.title.extraBold,
    },
    metricSub: {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: FontFamily.body.medium,
    },
    sectionLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: FontFamily.title.bold,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 24,
        lineHeight: 26,
        color: '#000000',
        fontFamily: FontFamily.title.extraBold,
        marginBottom: 14,
        letterSpacing: -0.5,
    },
    consistencyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dayItem: {
        alignItems: 'center',
        gap: 6,
    },
    dayDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    dayDotIdle: {
        backgroundColor: '#E5E7EB',
    },
    dayDotActive: {
        backgroundColor: Colors.primary,
    },
    dayDotToday: {
        borderWidth: 2,
        borderColor: '#111111',
    },
    dayLabel: {
        fontSize: 9,
        color: '#9CA3AF',
        fontFamily: FontFamily.title.bold,
        textTransform: 'uppercase',
    },
    dayLabelToday: {
        color: '#111111',
    },
    summaryGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 14,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryKpi: {
        fontSize: 18,
        color: '#111111',
        fontFamily: FontFamily.title.extraBold,
        marginBottom: 2,
    },
    summaryLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: FontFamily.body.medium,
        textTransform: 'lowercase',
    },
    summaryDivider: {
        width: 1,
        height: 34,
        backgroundColor: '#F3F4F6',
    },
    distributionList: {
        gap: 10,
    },
    distributionItem: {
        gap: 6,
    },
    distributionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    distributionName: {
        fontSize: 12,
        color: '#111111',
        fontFamily: FontFamily.title.bold,
        textTransform: 'uppercase',
    },
    distributionMeta: {
        fontSize: 11,
        color: '#6B7280',
        fontFamily: FontFamily.body.semiBold,
    },
    distributionTrack: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F3F4F6',
        overflow: 'hidden',
    },
    distributionFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
});
