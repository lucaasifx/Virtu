import { MuscleGroup } from "@/src/types/workout";
import { EXERCISES_BY_GROUP } from "./exercises";

export interface MuscleGroupDef {
    id: MuscleGroup;
    title: string;
    image: any;
    exerciseCount: number;
}

export const MUSCLE_GROUPS: MuscleGroupDef[] = [
    {
        id: MuscleGroup.CHEST,
        title: "Peito",
        image: require('@/assets/workout/chest.jpg'),
        exerciseCount: EXERCISES_BY_GROUP[MuscleGroup.CHEST]?.length || 0
    },
    {
        id: MuscleGroup.BACK,
        title: "Costas",
        image: require('@/assets/workout/back.jpg'),
        exerciseCount: EXERCISES_BY_GROUP[MuscleGroup.BACK]?.length || 0
    },
    {
        id: MuscleGroup.LEGS,
        title: "Pernas",
        image: require('@/assets/workout/legs.jpg'),
        exerciseCount: EXERCISES_BY_GROUP[MuscleGroup.LEGS]?.length || 0
    },
    {
        id: MuscleGroup.SHOULDERS,
        title: "Ombros",
        image: require('@/assets/workout/shoulders.jpg'),
        exerciseCount: EXERCISES_BY_GROUP[MuscleGroup.SHOULDERS]?.length || 0
    },
    {
        id: MuscleGroup.BICEPS,
        title: "Bíceps",
        image: require('@/assets/workout/biceps.jpg'),
        exerciseCount: EXERCISES_BY_GROUP[MuscleGroup.BICEPS]?.length || 0
    },
    {
        id: MuscleGroup.TRICEPS,
        title: "Tríceps",
        image: require('@/assets/workout/triceps.jpg'),
        exerciseCount: EXERCISES_BY_GROUP[MuscleGroup.TRICEPS]?.length || 0
    },
    {
        id: MuscleGroup.ABS,
        title: "Abdômen",
        image: require('@/assets/workout/abdomen.jpg'),
        exerciseCount: EXERCISES_BY_GROUP[MuscleGroup.ABS]?.length || 0
    },
    {
        id: MuscleGroup.CARDIO,
        title: "Cardio",
        image: require('@/assets/workout/cardio.jpg'),
        exerciseCount: EXERCISES_BY_GROUP[MuscleGroup.CARDIO]?.length || 0
    },
    {
        id: MuscleGroup.FULL_BODY,
        title: "Full Body",
        image: require('@/assets/workout/fullbody.jpg'),
        exerciseCount: EXERCISES_BY_GROUP[MuscleGroup.FULL_BODY]?.length || 0
    },
    {
        id: MuscleGroup.OTHER,
        title: "Outros",
        image: require('@/assets/workout/other.jpg'),
        exerciseCount: EXERCISES_BY_GROUP[MuscleGroup.OTHER]?.length || 0
    }
];
