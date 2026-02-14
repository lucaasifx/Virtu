import { useState, useEffect, useCallback } from 'react';
import { getCachedWorkouts, CachedWorkout } from '@/src/lib/workoutSyncService';
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface WeeklyStats {
    totalWorkouts: number;
    totalVolume: number;
    avgRpe: number;
    daysActivity: boolean[];
}

export interface DayActivity {
    date: Date;
    hasWorkout: boolean;
    isToday: boolean;
    dayLabel: string;
}

export function useWorkoutStats() {
    const [workouts, setWorkouts] = useState<CachedWorkout[]>([]);
    const [loading, setLoading] = useState(true);

    const [weeklyActivity, setWeeklyActivity] = useState<DayActivity[]>(() => {
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 0 });
        const end = endOfWeek(now, { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end }).map(day => ({
            date: day,
            hasWorkout: false,
            isToday: isSameDay(day, now),
            dayLabel: format(day, 'EEEEE', { locale: ptBR }).toUpperCase()
        }));
    });

    const [stats, setStats] = useState<WeeklyStats>({
        totalWorkouts: 0,
        totalVolume: 0,
        avgRpe: 0,
        daysActivity: Array(7).fill(false)
    });

    const fetchStats = useCallback(async () => {
        try {
            const data = await getCachedWorkouts();
            setWorkouts(data);
            calculateStats(data);
        } catch (error) {
            console.error('Failed to fetch workout stats', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const calculateStats = (data: CachedWorkout[]) => {
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 0 });
        const end = endOfWeek(now, { weekStartsOn: 0 });

        const days = eachDayOfInterval({ start, end });
        const activityMap = days.map(day => {
            const hasWorkout = data.some(w => isSameDay(new Date(w.startedAt), day));
            return {
                date: day,
                hasWorkout,
                isToday: isSameDay(day, now),
                dayLabel: format(day, 'EEEEE', { locale: ptBR }).toUpperCase()
            };
        });
        setWeeklyActivity(activityMap);
        const weekWorkouts = data.filter(w => {
            const date = new Date(w.startedAt);
            return date >= start && date <= end;
        });

        let totalRpe = 0;
        let setsWithRpe = 0;
        const recentWorkouts = data.slice(0, 5);

        recentWorkouts.forEach(w => {
            w.exercisesData.forEach(ex => {
                ex.sets.forEach(s => {
                    if (s.rpe > 0) {
                        totalRpe += s.rpe;
                        setsWithRpe++;
                    }
                });
            });
        });

        const avgRpe = setsWithRpe > 0 ? Number((totalRpe / setsWithRpe).toFixed(1)) : 0;

        setStats({
            totalWorkouts: weekWorkouts.length,
            totalVolume: weekWorkouts.reduce((acc, curr) => acc + curr.totalVolume, 0),
            avgRpe,
            daysActivity: activityMap.map(d => d.hasWorkout)
        });
    };

    const getPredictedLoad = (group: string) => {
        const lastWorkout = workouts.find(w => w.muscleGroups.includes(group));
        if (!lastWorkout) return 0;
        return Math.round(lastWorkout.totalVolume / 1000);
    };

    return {
        workouts,
        loading,
        weeklyActivity,
        stats,
        getPredictedLoad,
        refresh: fetchStats
    };
}
