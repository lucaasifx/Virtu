import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import {
    useSharedValue,
    withTiming,
    Easing,
    runOnJS
} from 'react-native-reanimated';

export type Phase = 'counting' | 'transition' | 'completed';

export function useCountdownController() {
    const [count, setCount] = useState(3);
    const [phase, setPhase] = useState<Phase>('counting');

    const circleScale = useSharedValue(0);
    const contentOpacity = useSharedValue(1);

    useEffect(() => {
        if (phase === 'counting') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const timer = setTimeout(() => {
                if (count > 1) {
                    setCount(prev => prev - 1);
                } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setPhase('transition');
                    startTransition();
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [count, phase]);

    const startTransition = () => {
        circleScale.value = withTiming(1, {
            duration: 600,
            easing: Easing.out(Easing.exp),
        });

        contentOpacity.value = withTiming(0, { duration: 200 });

        setTimeout(() => {
            setPhase('completed');
        }, 800);
    };

    return {
        count,
        phase,
        circleScale,
        contentOpacity
    };
}
