import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getExerciseById } from '@/src/constants/exercises';
import { getCachedWorkouts, CachedWorkout } from '@/src/lib/workoutSyncService';
import { MuscleGroup } from '@/src/types/workout';

export type ProgressGroupId = 'Peitoral' | 'Costas' | 'Pernas' | 'Ombros';

export interface RadarPoint {
    subject: string;
    value: number;
    fullMark: number;
}

export interface HistoryPoint {
    date: string;
    value: number;
}

export interface GroupInsight {
    totalVolume: string;
    growth: string;
    bestLift: string;
    bestLiftName: string;
    history: HistoryPoint[];
}

export interface DayConsistencyPoint {
    key: string;
    label: string;
    active: boolean;
    isToday: boolean;
}

export interface VolumeDistributionItem {
    label: string;
    percent: number;
    volume: string;
}

export interface PerformanceSummary {
    avgRpe: number;
    avgDurationMinutes: number;
    workoutsLast30Days: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const GROUP_MAP: Record<ProgressGroupId, MuscleGroup> = {
    Peitoral: MuscleGroup.CHEST,
    Costas: MuscleGroup.BACK,
    Pernas: MuscleGroup.LEGS,
    Ombros: MuscleGroup.SHOULDERS,
};

const RADAR_GROUPS: { label: string; groups: MuscleGroup[] }[] = [
    { label: 'Peitoral', groups: [MuscleGroup.CHEST] },
    { label: 'Costas', groups: [MuscleGroup.BACK] },
    { label: 'Pernas', groups: [MuscleGroup.LEGS] },
    { label: 'Ombros', groups: [MuscleGroup.SHOULDERS] },
    { label: 'Braços', groups: [MuscleGroup.BICEPS, MuscleGroup.TRICEPS] },
    { label: 'Core', groups: [MuscleGroup.ABS] },
];

const SELECTOR_GROUPS: ProgressGroupId[] = ['Peitoral', 'Costas', 'Pernas', 'Ombros'];

interface LiftBest {
    weight: number;
    exerciseName: string;
}

interface WorkoutAggregate {
    startedAt: number;
    groupVolumes: Partial<Record<MuscleGroup, number>>;
}

function normalizeDate(value: string): number {
    const date = new Date(value);
    const time = date.getTime();
    return Number.isNaN(time) ? 0 : time;
}

function toVolume(weight: number, reps: number): number {
    const safeWeight = Number.isFinite(weight) ? weight : 0;
    const safeReps = Number.isFinite(reps) ? reps : 0;
    return Math.max(0, safeWeight * safeReps);
}

function formatVolume(total: number): string {
    if (total <= 0) return '0.0t';
    return `${(total / 1000).toFixed(1)}t`;
}

function formatGrowth(current: number, previous: number): string {
    if (previous <= 0) {
        if (current <= 0) return '0%';
        return '+100%';
    }

    const percentage = ((current - previous) / previous) * 100;
    const rounded = Math.round(percentage);
    if (rounded > 0) return `+${rounded}%`;
    return `${rounded}%`;
}

function aggregateWorkouts(workouts: CachedWorkout[]): { records: WorkoutAggregate[]; bestByGroup: Partial<Record<MuscleGroup, LiftBest>> } {
    const bestByGroup: Partial<Record<MuscleGroup, LiftBest>> = {};

    const records = workouts.map((workout) => {
        const groupVolumes: Partial<Record<MuscleGroup, number>> = {};

        workout.exercisesData.forEach((exerciseData) => {
            const exercise = getExerciseById(exerciseData.exerciseId);
            const muscleGroup = exercise?.muscleGroup;
            if (!muscleGroup) {
                return;
            }

            let exerciseVolume = 0;
            exerciseData.sets.forEach((set) => {
                const setVolume = toVolume(set.weight, set.reps);
                exerciseVolume += setVolume;

                const currentBest = bestByGroup[muscleGroup];
                if (!currentBest || set.weight > currentBest.weight) {
                    bestByGroup[muscleGroup] = {
                        weight: set.weight,
                        exerciseName: exercise.name,
                    };
                }
            });

            groupVolumes[muscleGroup] = (groupVolumes[muscleGroup] ?? 0) + exerciseVolume;
        });

        return {
            startedAt: normalizeDate(workout.startedAt),
            groupVolumes,
        };
    });

    return { records, bestByGroup };
}

function sumGroups(record: WorkoutAggregate, groups: MuscleGroup[]): number {
    return groups.reduce((total, group) => total + (record.groupVolumes[group] ?? 0), 0);
}

function buildHistory(records: WorkoutAggregate[], group: MuscleGroup, now: number): HistoryPoint[] {
    const start = now - (6 * WEEK_MS) + DAY_MS;
    const buckets = [0, 0, 0, 0, 0, 0];

    records.forEach((record) => {
        if (record.startedAt < start || record.startedAt > now) {
            return;
        }

        const index = Math.floor((record.startedAt - start) / WEEK_MS);
        if (index < 0 || index > 5) {
            return;
        }

        buckets[index] += record.groupVolumes[group] ?? 0;
    });

    return buckets.map((value, index) => ({
        date: `Sem ${index + 1}`,
        value: Math.round(value),
    }));
}

function dayStart(date: Date): number {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy.getTime();
}

function formatDayLabel(value: number): string {
    const date = new Date(value);
    const label = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').slice(0, 1);
    return label.toUpperCase();
}

export function useProgressInsights() {
    const [workouts, setWorkouts] = useState<CachedWorkout[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadWorkouts = useCallback(async () => {
        try {
            const data = await getCachedWorkouts();
            setWorkouts(data);
        } catch {
            setWorkouts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadWorkouts();
    }, [loadWorkouts]);

    useFocusEffect(
        useCallback(() => {
            loadWorkouts();
        }, [loadWorkouts])
    );

    const insights = useMemo(() => {
        const { records, bestByGroup } = aggregateWorkouts(workouts);
        const now = Date.now();
        const last30Start = now - (30 * DAY_MS);
        const previous30Start = now - (60 * DAY_MS);

        const radarVolumeByLabel = new Map<string, number>();
        RADAR_GROUPS.forEach((item) => radarVolumeByLabel.set(item.label, 0));

        const currentByGroup: Partial<Record<MuscleGroup, number>> = {};
        const previousByGroup: Partial<Record<MuscleGroup, number>> = {};
        let workoutsLast30Days = 0;
        let durationSumLast30 = 0;
        let rpeSumLast30 = 0;
        let rpeCountLast30 = 0;

        records.forEach((record) => {
            const isCurrentWindow = record.startedAt >= last30Start && record.startedAt <= now;
            const isPreviousWindow = record.startedAt >= previous30Start && record.startedAt < last30Start;

            if (isCurrentWindow) {
                RADAR_GROUPS.forEach((radar) => {
                    const value = sumGroups(record, radar.groups);
                    radarVolumeByLabel.set(radar.label, (radarVolumeByLabel.get(radar.label) ?? 0) + value);
                });
            }

            SELECTOR_GROUPS.forEach((selector) => {
                const group = GROUP_MAP[selector];
                const volume = record.groupVolumes[group] ?? 0;
                if (isCurrentWindow) {
                    currentByGroup[group] = (currentByGroup[group] ?? 0) + volume;
                }
                if (isPreviousWindow) {
                    previousByGroup[group] = (previousByGroup[group] ?? 0) + volume;
                }
            });
        });

        workouts.forEach((workout) => {
            const startedAt = normalizeDate(workout.startedAt);
            const isCurrentWindow = startedAt >= last30Start && startedAt <= now;
            if (!isCurrentWindow) {
                return;
            }

            workoutsLast30Days += 1;
            durationSumLast30 += workout.durationSeconds;
            workout.exercisesData.forEach((exerciseData) => {
                exerciseData.sets.forEach((set) => {
                    if (set.rpe > 0) {
                        rpeSumLast30 += set.rpe;
                        rpeCountLast30 += 1;
                    }
                });
            });
        });

        const radarTotals = Array.from(radarVolumeByLabel.values());
        const highestRadarVolume = Math.max(...radarTotals, 1);
        const totalRadarVolume = radarTotals.reduce((total, value) => total + value, 0);
        const radarData: RadarPoint[] = RADAR_GROUPS.map((item) => ({
            subject: item.label,
            value: totalRadarVolume <= 0
                ? 75
                : Math.max(
                    (radarVolumeByLabel.get(item.label) ?? 0) > 0 ? 18 : 8,
                    Math.round((radarVolumeByLabel.get(item.label) ?? 0) / highestRadarVolume * 150)
                ),
            fullMark: 150,
        }));

        const sortedRadar = [...radarData].sort((a, b) => b.value - a.value);
        const strongest = sortedRadar[0]?.subject ?? 'Peitoral';
        const weakest = sortedRadar[sortedRadar.length - 1]?.subject ?? 'Core';

        const consistency: DayConsistencyPoint[] = [];
        const trainedDays = new Set(
            workouts
                .map((workout) => dayStart(new Date(workout.startedAt)))
                .filter((value) => value > 0)
        );

        for (let index = 13; index >= 0; index -= 1) {
            const day = new Date(now - index * DAY_MS);
            const start = dayStart(day);
            consistency.push({
                key: start.toString(),
                label: formatDayLabel(start),
                active: trainedDays.has(start),
                isToday: dayStart(new Date(now)) === start,
            });
        }

        const distributionRaw = RADAR_GROUPS.map((item) => ({
            label: item.label,
            total: radarVolumeByLabel.get(item.label) ?? 0,
        })).filter((item) => item.total > 0);

        const distributionBase = distributionRaw.length > 0 ? distributionRaw : RADAR_GROUPS.map((item) => ({
            label: item.label,
            total: 0,
        }));

        const distributionTotal = distributionBase.reduce((total, item) => total + item.total, 0);
        const volumeDistribution: VolumeDistributionItem[] = distributionBase
            .map((item) => ({
                label: item.label,
                percent: distributionTotal > 0 ? Math.round((item.total / distributionTotal) * 100) : 0,
                volume: formatVolume(item.total),
            }))
            .sort((a, b) => b.percent - a.percent);

        const performanceSummary: PerformanceSummary = {
            avgRpe: rpeCountLast30 > 0 ? Number((rpeSumLast30 / rpeCountLast30).toFixed(1)) : 0,
            avgDurationMinutes: workoutsLast30Days > 0 ? Math.round((durationSumLast30 / workoutsLast30Days) / 60) : 0,
            workoutsLast30Days,
        };

        const groupData = SELECTOR_GROUPS.reduce<Record<ProgressGroupId, GroupInsight>>((acc, selector) => {
            const group = GROUP_MAP[selector];
            const current = currentByGroup[group] ?? 0;
            const previous = previousByGroup[group] ?? 0;
            const bestLift = bestByGroup[group];

            acc[selector] = {
                totalVolume: formatVolume(current),
                growth: formatGrowth(current, previous),
                bestLift: bestLift ? `${Math.round(bestLift.weight)}kg` : '--',
                bestLiftName: bestLift ? bestLift.exerciseName : 'Sem histórico',
                history: buildHistory(records, group, now),
            };
            return acc;
        }, {} as Record<ProgressGroupId, GroupInsight>);

        return {
            radarData,
            strongest,
            weakest,
            groupData,
            consistency,
            volumeDistribution,
            performanceSummary,
        };
    }, [workouts]);

    return {
        isLoading,
        selectorGroups: SELECTOR_GROUPS,
        radarData: insights.radarData,
        strongest: insights.strongest,
        weakest: insights.weakest,
        groupData: insights.groupData,
        consistency: insights.consistency,
        volumeDistribution: insights.volumeDistribution,
        performanceSummary: insights.performanceSummary,
    };
}
