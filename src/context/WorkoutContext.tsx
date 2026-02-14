import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { ImageSourcePropType } from 'react-native';
import { MuscleGroup } from '../types/workout';
import { MUSCLE_GROUPS } from '../constants/muscleGroups';
import { getExerciseById } from '../constants/exercises';
import { useAuth } from './AuthContext';
import {
    createWorkoutRoutine,
    fetchWorkoutRoutines,
    updateWorkoutRoutine,
    WorkoutRoutineRecord,
} from '../lib/workoutRoutineService';

export interface WorkoutRoutine {
    id: string;
    title: string;
    category: string;
    estimatedMinutes: number;
    exercises: string[];
    exerciseCount: number;
    muscleGroups: MuscleGroup[];
    musclesLabel: string;
    image: ImageSourcePropType;
    coverMuscleGroup: MuscleGroup;
}

const GROUP_LABEL_MAP: Record<MuscleGroup, string> = {
    [MuscleGroup.CHEST]: 'Peito',
    [MuscleGroup.BACK]: 'Costas',
    [MuscleGroup.LEGS]: 'Pernas',
    [MuscleGroup.SHOULDERS]: 'Ombros',
    [MuscleGroup.BICEPS]: 'Bíceps',
    [MuscleGroup.TRICEPS]: 'Tríceps',
    [MuscleGroup.ABS]: 'Abdômen',
    [MuscleGroup.CARDIO]: 'Cardio',
    [MuscleGroup.FULL_BODY]: 'Full Body',
    [MuscleGroup.OTHER]: 'Outros',
};

interface WorkoutContextData {
    selectedGroups: MuscleGroup[];
    setSelectedGroups: (groups: MuscleGroup[]) => void;
    selections: Partial<Record<MuscleGroup, string[]>>;
    toggleExerciseSelection: (group: MuscleGroup, exerciseId: string) => void;
    resetWorkout: () => void;
    getExercisesForGroup: (group: MuscleGroup) => string[];
    clearExercisesForGroup: (group: MuscleGroup) => void;
    workoutCategory: string;
    setWorkoutCategory: (category: string) => void;
    routines: WorkoutRoutine[];
    isLoadingRoutines: boolean;
    isSavingRoutine: boolean;
    lastRoutineError: string | null;
    createRoutineFromSelection: () => Promise<WorkoutRoutine | null>;
    pendingStartRoutine: WorkoutRoutine | null;
    queueRoutineStart: (routineId: string) => void;
    clearPendingStartRoutine: () => void;
    getRoutineById: (routineId: string) => WorkoutRoutine | null;
    startRoutineEdit: (routineId: string) => boolean;
    editingRoutineId: string | null;
}

const WorkoutContext = createContext<WorkoutContextData | undefined>(undefined);

function estimateMinutes(exerciseCount: number): number {
    return Math.max(20, Math.min(95, Math.round(10 + exerciseCount * 7.5)));
}

function buildRoutineViewModel(record: WorkoutRoutineRecord): WorkoutRoutine {
    const exerciseCount = record.exerciseIds.length;
    const estimatedMinutes = estimateMinutes(exerciseCount);
    const groupLabels = record.muscleGroups.map((group) => GROUP_LABEL_MAP[group]);
    const musclesLabel = groupLabels.slice(0, 3).join(' • ');
    const image = MUSCLE_GROUPS.find((group) => group.id === record.coverMuscleGroup)?.image ?? MUSCLE_GROUPS[0].image;

    return {
        id: record.id,
        title: record.title,
        category: record.category,
        estimatedMinutes,
        exercises: record.exerciseIds,
        exerciseCount,
        muscleGroups: record.muscleGroups,
        musclesLabel,
        image,
        coverMuscleGroup: record.coverMuscleGroup,
    };
}

function buildSelectionsFromExerciseIds(
    exerciseIds: string[],
    fallbackGroups: MuscleGroup[]
): { groups: MuscleGroup[]; selections: Partial<Record<MuscleGroup, string[]>> } {
    const nextGroups: MuscleGroup[] = [];
    const nextSelections: Partial<Record<MuscleGroup, string[]>> = {};

    for (const exerciseId of exerciseIds) {
        const definition = getExerciseById(exerciseId);
        const group = definition?.muscleGroup;

        if (!group) {
            continue;
        }

        if (!nextGroups.includes(group)) {
            nextGroups.push(group);
        }

        const groupSelection = nextSelections[group] ?? [];
        nextSelections[group] = [...groupSelection, exerciseId];
    }

    const resolvedGroups = nextGroups.length > 0 ? nextGroups : fallbackGroups;
    return { groups: resolvedGroups, selections: nextSelections };
}

function isGroupValue(value: string): value is MuscleGroup {
    return Object.values(MuscleGroup).includes(value as MuscleGroup);
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [selectedGroups, setSelectedGroupsState] = useState<MuscleGroup[]>([]);
    const [selections, setSelections] = useState<Partial<Record<MuscleGroup, string[]>>>({});
    const [workoutCategory, setWorkoutCategory] = useState('Hipertrofia');
    const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
    const [isLoadingRoutines, setIsLoadingRoutines] = useState(false);
    const [isSavingRoutine, setIsSavingRoutine] = useState(false);
    const [lastRoutineError, setLastRoutineError] = useState<string | null>(null);
    const [pendingStartRoutine, setPendingStartRoutine] = useState<WorkoutRoutine | null>(null);
    const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            if (!user) {
                if (active) {
                    setRoutines([]);
                    setPendingStartRoutine(null);
                    setEditingRoutineId(null);
                }
                return;
            }

            setIsLoadingRoutines(true);
            try {
                const fetched = await fetchWorkoutRoutines(user.id);
                if (active) {
                    setRoutines(fetched.map(buildRoutineViewModel));
                }
            } catch {
                if (active) {
                    setRoutines([]);
                }
            } finally {
                if (active) {
                    setIsLoadingRoutines(false);
                }
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [user]);

    const setSelectedGroups = useCallback((groups: MuscleGroup[]) => {
        setSelectedGroupsState(groups);
    }, []);

    const toggleExerciseSelection = useCallback((group: MuscleGroup, exerciseId: string) => {
        setSelections((prev) => {
            const groupSelections = prev[group] ?? [];
            const isSelected = groupSelections.includes(exerciseId);
            const nextGroupSelections = isSelected
                ? groupSelections.filter((id) => id !== exerciseId)
                : [...groupSelections, exerciseId];

            return {
                ...prev,
                [group]: nextGroupSelections,
            };
        });
    }, []);

    const getExercisesForGroup = useCallback((group: MuscleGroup) => {
        return selections[group] ?? [];
    }, [selections]);

    const clearExercisesForGroup = useCallback((group: MuscleGroup) => {
        setSelections((prev) => {
            const nextSelections = { ...prev };
            delete nextSelections[group];
            return nextSelections;
        });
    }, []);

    const resetWorkout = useCallback(() => {
        setSelectedGroupsState([]);
        setSelections({});
        setWorkoutCategory('Hipertrofia');
        setEditingRoutineId(null);
    }, []);

    const createRoutineFromSelection = useCallback(async () => {
        setLastRoutineError(null);
        if (!user || selectedGroups.length === 0) {
            setLastRoutineError('Usuário não autenticado ou sem grupos selecionados.');
            return null;
        }

        const validGroups = selectedGroups.filter((group) => {
            return isGroupValue(group) && (selections[group]?.length ?? 0) > 0;
        });

        const exercises = validGroups.flatMap((group) => selections[group] ?? []);
        if (exercises.length === 0) {
            setLastRoutineError('Selecione ao menos um exercício para salvar a rotina.');
            return null;
        }

        const groupsLabel = validGroups.map((group) => GROUP_LABEL_MAP[group]);
        const title = groupsLabel.length > 1
            ? `${groupsLabel[0]} & ${groupsLabel[1]}`
            : groupsLabel[0];
        const coverMuscleGroup = validGroups[0] ?? MuscleGroup.CHEST;

        setIsSavingRoutine(true);

        try {
            const payload = {
                title,
                category: workoutCategory,
                muscleGroups: validGroups,
                exerciseIds: exercises,
                coverMuscleGroup,
            };

            let saved: WorkoutRoutineRecord;

            if (editingRoutineId) {
                saved = await updateWorkoutRoutine(editingRoutineId, user.id, payload);
                const mapped = buildRoutineViewModel(saved);
                setRoutines((prev) => prev.map((routine) => routine.id === mapped.id ? mapped : routine));
                setPendingStartRoutine((prev) => prev?.id === mapped.id ? mapped : prev);
            } else {
                saved = await createWorkoutRoutine(user.id, payload);
                const mapped = buildRoutineViewModel(saved);
                setRoutines((prev) => [mapped, ...prev]);
            }

            const routine = buildRoutineViewModel(saved);
            resetWorkout();
            return routine;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Falha ao salvar rotina.';
            setLastRoutineError(message);
            console.error('[WorkoutRoutine] save error:', message);
            return null;
        } finally {
            setIsSavingRoutine(false);
        }
    }, [editingRoutineId, resetWorkout, selections, selectedGroups, user, workoutCategory]);

    const queueRoutineStart = useCallback((routineId: string) => {
        setPendingStartRoutine(() => routines.find((routine) => routine.id === routineId) ?? null);
    }, [routines]);

    const clearPendingStartRoutine = useCallback(() => {
        setPendingStartRoutine(null);
    }, []);

    const getRoutineById = useCallback((routineId: string) => {
        return routines.find((routine) => routine.id === routineId) ?? null;
    }, [routines]);

    const startRoutineEdit = useCallback((routineId: string) => {
        const routine = routines.find((item) => item.id === routineId);
        if (!routine) {
            return false;
        }

        const { groups, selections: mappedSelections } = buildSelectionsFromExerciseIds(
            routine.exercises,
            routine.muscleGroups
        );

        setWorkoutCategory(routine.category);
        setSelectedGroupsState(groups);
        setSelections(mappedSelections);
        setEditingRoutineId(routineId);
        return true;
    }, [routines]);

    const contextValue = useMemo(() => ({
        selectedGroups,
        setSelectedGroups,
        selections,
        toggleExerciseSelection,
        resetWorkout,
        getExercisesForGroup,
        clearExercisesForGroup,
        workoutCategory,
        setWorkoutCategory,
        routines,
        isLoadingRoutines,
        isSavingRoutine,
        lastRoutineError,
        createRoutineFromSelection,
        pendingStartRoutine,
        queueRoutineStart,
        clearPendingStartRoutine,
        getRoutineById,
        startRoutineEdit,
        editingRoutineId,
    }), [
        selectedGroups,
        setSelectedGroups,
        selections,
        toggleExerciseSelection,
        resetWorkout,
        getExercisesForGroup,
        clearExercisesForGroup,
        workoutCategory,
        routines,
        isLoadingRoutines,
        isSavingRoutine,
        lastRoutineError,
        createRoutineFromSelection,
        pendingStartRoutine,
        queueRoutineStart,
        clearPendingStartRoutine,
        getRoutineById,
        startRoutineEdit,
        editingRoutineId,
    ]);

    return (
        <WorkoutContext.Provider value={contextValue}>
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkoutCreation() {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkoutCreation must be used within a WorkoutProvider');
    }
    return context;
}
