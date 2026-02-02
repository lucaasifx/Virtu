import { Exercise, ExerciseType, MuscleGroup } from "@/src/types/workout";

const createExercise = (
    id: string,
    name: string,
    muscleGroup: MuscleGroup,
    type: ExerciseType = ExerciseType.STRENGTH
): Exercise => ({
    id,
    name,
    muscleGroup,
    type,
    sets: [],
});

export const EXERCISES_BY_GROUP: Record<MuscleGroup, Exercise[]> = {
    [MuscleGroup.CHEST]: [
        createExercise('chest_1', 'Supino Reto com Barra', MuscleGroup.CHEST),
        createExercise('chest_2', 'Supino Inclinado com Halteres', MuscleGroup.CHEST),
        createExercise('chest_3', 'Crucifixo na Máquina (Peck Deck)', MuscleGroup.CHEST),
        createExercise('chest_4', 'Flexão de Braços', MuscleGroup.CHEST),
        createExercise('chest_5', 'Crossover com Polia Alta', MuscleGroup.CHEST),
        createExercise('chest_6', 'Supino Declinado', MuscleGroup.CHEST),
    ],
    [MuscleGroup.BACK]: [
        createExercise('back_1', 'Puxada Aberta (Pulldown)', MuscleGroup.BACK),
        createExercise('back_2', 'Remada Curvada com Barra', MuscleGroup.BACK),
        createExercise('back_3', 'Remada Baixa (Sentado)', MuscleGroup.BACK),
        createExercise('back_4', 'Barra Fixa', MuscleGroup.BACK),
        createExercise('back_5', 'Serrote (Remada Unilateral)', MuscleGroup.BACK),
        createExercise('back_6', 'Levantamento Terra', MuscleGroup.BACK),
    ],
    [MuscleGroup.LEGS]: [
        createExercise('legs_1', 'Agachamento Livre', MuscleGroup.LEGS),
        createExercise('legs_2', 'Leg Press 45º', MuscleGroup.LEGS),
        createExercise('legs_3', 'Cadeira Extensora', MuscleGroup.LEGS),
        createExercise('legs_4', 'Mesa Flexora', MuscleGroup.LEGS),
        createExercise('legs_5', 'Stiff', MuscleGroup.LEGS),
        createExercise('legs_6', 'Elevação de Panturrilha', MuscleGroup.LEGS),
        createExercise('legs_7', 'Afundo (Lunge)', MuscleGroup.LEGS),
    ],
    [MuscleGroup.SHOULDERS]: [
        createExercise('shoulders_1', 'Desenvolvimento Militar', MuscleGroup.SHOULDERS),
        createExercise('shoulders_2', 'Elevação Lateral', MuscleGroup.SHOULDERS),
        createExercise('shoulders_3', 'Elevação Frontal', MuscleGroup.SHOULDERS),
        createExercise('shoulders_4', 'Crucifixo Inverso', MuscleGroup.SHOULDERS),
        createExercise('shoulders_5', 'Desenvolvimento Arnold', MuscleGroup.SHOULDERS),
    ],
    [MuscleGroup.BICEPS]: [
        createExercise('biceps_1', 'Rosca Direta com Barra', MuscleGroup.BICEPS),
        createExercise('biceps_2', 'Rosca Alternada com Halteres', MuscleGroup.BICEPS),
        createExercise('biceps_3', 'Rosca Martelo', MuscleGroup.BICEPS),
        createExercise('biceps_4', 'Rosca Scott', MuscleGroup.BICEPS),
        createExercise('biceps_5', 'Rosca Concentrada', MuscleGroup.BICEPS),
    ],
    [MuscleGroup.TRICEPS]: [
        createExercise('triceps_1', 'Tríceps Polia (Corda)', MuscleGroup.TRICEPS),
        createExercise('triceps_2', 'Tríceps Testa', MuscleGroup.TRICEPS),
        createExercise('triceps_3', 'Mergulho em Paralelas', MuscleGroup.TRICEPS),
        createExercise('triceps_4', 'Tríceps Francês', MuscleGroup.TRICEPS),
        createExercise('triceps_5', 'Tríceps Banco', MuscleGroup.TRICEPS),
    ],
    [MuscleGroup.ABS]: [
        createExercise('abs_1', 'Abdominal Supra (Crunch)', MuscleGroup.ABS),
        createExercise('abs_2', 'Prancha Isométrica', MuscleGroup.ABS),
        createExercise('abs_3', 'Elevação de Pernas', MuscleGroup.ABS),
        createExercise('abs_4', 'Abdominal Bicicleta', MuscleGroup.ABS),
        createExercise('abs_5', 'Roda Abdominal', MuscleGroup.ABS),
    ],
    [MuscleGroup.CARDIO]: [
        createExercise('cardio_1', 'Esteira Corrida', MuscleGroup.CARDIO, ExerciseType.CARDIO),
        createExercise('cardio_2', 'Bicicleta Ergométrica', MuscleGroup.CARDIO, ExerciseType.CARDIO),
        createExercise('cardio_3', 'Elíptico', MuscleGroup.CARDIO, ExerciseType.CARDIO),
        createExercise('cardio_4', 'Pular Corda', MuscleGroup.CARDIO, ExerciseType.CARDIO),
        createExercise('cardio_5', 'Remo Indoor', MuscleGroup.CARDIO, ExerciseType.CARDIO),
    ],
    [MuscleGroup.FULL_BODY]: [
        createExercise('full_1', 'Burpees', MuscleGroup.FULL_BODY),
        createExercise('full_2', 'Kettlebell Swing', MuscleGroup.FULL_BODY),
        createExercise('full_3', 'Thruster', MuscleGroup.FULL_BODY),
    ],
    [MuscleGroup.OTHER]: [
        createExercise('other_1', 'Alongamento', MuscleGroup.OTHER),
        createExercise('other_2', 'Mobilidade', MuscleGroup.OTHER),
    ],
};
