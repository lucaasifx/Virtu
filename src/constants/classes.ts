import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type UserClass = {
    minLevel: number;
    title: string;
    summary: string;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

export const USER_CLASSES: UserClass[] = [
    {
        minLevel: 1,
        title: 'Frango',
        summary: 'Voce esta criando a base. Consistencia vence intensidade no inicio.',
        icon: 'food-drumstick',
    },
    {
        minLevel: 3,
        title: 'Rato de Academia',
        summary: 'Treino virou rotina. Seu corpo ja esta respondendo ao ritmo.',
        icon: 'rodent',
    },
    {
        minLevel: 6,
        title: 'Rumo a Estetica',
        summary: 'Agora voce treina com estrategia. Volume e tecnica fazem diferenca.',
        icon: 'diamond-stone',
    },
    {
        minLevel: 10,
        title: 'Maromba',
        summary: 'Seu progresso e visivel. Forca, foco e disciplina estao alinhados.',
        icon: 'arm-flex',
    },
    {
        minLevel: 14,
        title: 'Monstro',
        summary: 'Nivel avancado. Seu treino ja inspira quem esta comecando.',
        icon: 'fire',
    },
];

export function getUserClass(level: number): UserClass {
    // Find the highest class where minLevel <= level
    return [...USER_CLASSES].reverse().find(c => level >= c.minLevel) ?? USER_CLASSES[0];
}
