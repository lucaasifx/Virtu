import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MuscleGroup } from '../types/workout';

interface WorkoutContextData {
    selectedGroups: MuscleGroup[];
    setSelectedGroups: (groups: MuscleGroup[]) => void;
    selections: Record<MuscleGroup, string[]>;
    toggleExerciseSelection: (group: MuscleGroup, exerciseId: string) => void;
    resetWorkout: () => void;
    getExercisesForGroup: (group: MuscleGroup) => string[];
    clearExercisesForGroup: (group: MuscleGroup) => void;
}

const WorkoutContext = createContext<WorkoutContextData | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
    const [selectedGroups, setSelectedGroupsState] = useState<MuscleGroup[]>([]);
    const [selections, setSelections] = useState<Record<MuscleGroup, string[]>>({} as any);

    const setSelectedGroups = (groups: MuscleGroup[]) => {
        setSelectedGroupsState(groups);
    };

    const toggleExerciseSelection = (group: MuscleGroup, exerciseId: string) => {
        setSelections(prev => {
            const groupSelections = prev[group] || [];
            const isSelected = groupSelections.includes(exerciseId);
            let newGroupSelections;
            if (isSelected)
                newGroupSelections = groupSelections.filter(id => id !== exerciseId);
            else
                newGroupSelections = [...groupSelections, exerciseId];
            return {
                ...prev,
                [group]: newGroupSelections
            };
        });
    };

    const getExercisesForGroup = (group: MuscleGroup) => {
        return selections[group] || [];
    };

    const clearExercisesForGroup = (group: MuscleGroup) => {
        setSelections(prev => {
            const newSelections = { ...prev };
            delete newSelections[group];
            return newSelections;
        });
    };

    const resetWorkout = () => {
        setSelectedGroupsState([]);
        setSelections({} as any);
    };

    const contextValue = React.useMemo(() => ({
        selectedGroups,
        setSelectedGroups,
        selections,
        toggleExerciseSelection,
        resetWorkout,
        getExercisesForGroup,
        clearExercisesForGroup
    }), [selectedGroups, selections]);

    return (
        <WorkoutContext.Provider value={contextValue}>
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkoutCreation() {
    const context = useContext(WorkoutContext);
    if (!context)
        throw new Error('useWorkoutCreation must be used within a WorkoutProvider');
    return context;
}
