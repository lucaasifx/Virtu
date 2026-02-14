import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    SlideInRight,
    SlideOutRight,
} from 'react-native-reanimated';
import { Colors } from '@/src/constants/theme';
import { Achievement } from '@/src/types/gamification';

interface AchievementUnlockedToastProps {
    achievement: Achievement | null;
    visible: boolean;
    onComplete?: () => void;
}

export function AchievementUnlockedToast({ achievement, visible, onComplete }: AchievementUnlockedToastProps) {
    const progress = useSharedValue(0);

    useEffect(() => {
        if (visible && achievement) {
            progress.value = 0;
            progress.value = withTiming(1, { duration: 3000 }, (finished) => {
                if (finished && onComplete) {
                    runOnJS(onComplete)();
                }
            });
        }
    }, [achievement, onComplete, progress, visible]);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    if (!visible || !achievement) return null;

    return (
        <Animated.View
            entering={SlideInRight.springify().damping(15)}
            exiting={SlideOutRight.duration(300)}
            style={styles.container}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{achievement.icon}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.label}>CONQUISTA DESBLOQUEADA!</Text>
                <Text style={styles.name}>{achievement.name}</Text>
                <Text style={styles.description}>{achievement.description}</Text>
            </View>

            <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        right: 16,
        left: 16,
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        flexDirection: 'row',
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 9999,
        overflow: 'hidden',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(253, 203, 19, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 28,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.primary,
        letterSpacing: 1,
        marginBottom: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    description: {
        fontSize: 12,
        color: '#888888',
    },
    progressBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#333333',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
    },
});
