import { Exercise, ExerciseType, MuscleGroup, WorkoutDTO, StrengthSet, CardioSet } from "../types/workout";

const createExercise = (
    id: string,
    name: string,
    muscleGroup: MuscleGroup,
    setsCount: number,
    reps: number,
    weight: number
): Exercise => ({
    id,
    name,
    type: ExerciseType.STRENGTH,
    muscleGroup,
    sets: Array(setsCount).fill({
        id: Math.random().toString(36).substr(2, 9),
        reps,
        weight,
        completed: true,
        rpe: 8
    } as StrengthSet).map((s, i) => ({ ...s, id: `${id}_s${i}` }))
});

export const MOCK_WORKOUTS: WorkoutDTO[] = [
    {
        id: "1",
        title: "Treino de Peito (A)",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        duration: 4500,
        totalVolume: 4500,
        exercises: [
            createExercise("ex1", "Supino Reto", MuscleGroup.CHEST, 4, 10, 80),
            createExercise("ex2", "Supino Inclinado", MuscleGroup.CHEST, 4, 12, 60),
            createExercise("ex3", "Crucifixo", MuscleGroup.CHEST, 3, 15, 12),
        ]
    },
    {
        id: "2",
        title: "Treino de Costas (B)",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        duration: 3300,
        totalVolume: 3800,
        exercises: [
            createExercise("ex4", "Puxada Alta", MuscleGroup.BACK, 4, 12, 55),
            createExercise("ex5", "Remada Curvada", MuscleGroup.BACK, 4, 10, 60),
        ]
    },
    {
        id: "3",
        title: "Pernas Completo (C)",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        duration: 5400,
        totalVolume: 6200,
        exercises: [
            createExercise("ex6", "Agachamento Livre", MuscleGroup.LEGS, 4, 8, 100),
            createExercise("ex7", "Leg Press", MuscleGroup.LEGS, 4, 12, 200),
            createExercise("ex8", "Cadeira Extensora", MuscleGroup.LEGS, 3, 15, 40),
        ]
    },
    {
        id: "4",
        title: "Ombros e Braços (D)",
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        duration: 3000,
        totalVolume: 2100,
        exercises: [
            createExercise("ex9", "Desenvolvimento Halteres", MuscleGroup.SHOULDERS, 4, 10, 22),
            createExercise("ex10", "Rosca Direta", MuscleGroup.BICEPS, 3, 12, 15),
            createExercise("ex11", "Tríceps Testa", MuscleGroup.TRICEPS, 3, 12, 10),
        ]
    },
    {
        id: "5",
        title: "Cardio",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        duration: 1800,
        totalVolume: 0,
        exercises: [
            {
                id: "ex12",
                name: "Corrida na Esteira",
                type: ExerciseType.CARDIO,
                muscleGroup: MuscleGroup.CARDIO,
                sets: [
                    { id: "s1", duration: 1200, rpe: 7, completed: true } as CardioSet,
                    { id: "s2", duration: 600, rpe: 6, completed: true } as CardioSet
                ]
            }
        ]
    }
];
