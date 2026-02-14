import React, { useEffect } from 'react';
import { StyleSheet, Modal, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withDelay,
    withTiming,
    FadeIn,
    ZoomIn,
} from 'react-native-reanimated';
import { Colors } from '@/src/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LevelInfo } from '@/src/types/gamification';

interface LevelUpModalProps {
    visible: boolean;
    levelInfo: LevelInfo;
    onClose: () => void;
}

export function LevelUpModal({ visible, levelInfo, onClose }: LevelUpModalProps) {
    const starScale = useSharedValue(0);
    const badgeRotate = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            starScale.value = 0;
            badgeRotate.value = 0;

            starScale.value = withDelay(
                300,
                withSequence(
                    withSpring(1.5, { damping: 6 }),
                    withSpring(1, { damping: 8 })
                )
            );

            badgeRotate.value = withDelay(
                500,
                withSequence(
                    withTiming(-10, { duration: 100 }),
                    withTiming(10, { duration: 100 }),
                    withTiming(-5, { duration: 80 }),
                    withTiming(5, { duration: 80 }),
                    withTiming(0, { duration: 60 })
                )
            );
        }
    }, [badgeRotate, starScale, visible]);

    const starStyle = useAnimatedStyle(() => ({
        transform: [{ scale: starScale.value }],
    }));

    const badgeStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${badgeRotate.value}deg` }],
    }));

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Animated.View
                    entering={ZoomIn.duration(300).springify()}
                    style={styles.container}
                >
                    <Animated.View style={[styles.starContainer, starStyle]}>
                        <MaterialCommunityIcons name="star-four-points" size={80} color={Colors.primary} />
                    </Animated.View>

                    <Animated.Text entering={FadeIn.delay(200)} style={styles.levelUpText}>
                        LEVEL UP!
                    </Animated.Text>

                    <Animated.View style={[styles.levelBadge, badgeStyle]}>
                        <Animated.Text entering={FadeIn.delay(400)} style={styles.levelNumber}>
                            {levelInfo.level}
                        </Animated.Text>
                    </Animated.View>

                    <Animated.Text entering={FadeIn.delay(500)} style={styles.titleText}>
                        {levelInfo.title}
                    </Animated.Text>

                    <Animated.Text entering={FadeIn.delay(600)} style={styles.subtitleText}>
                        Continue evoluindo!
                    </Animated.Text>

                    <Animated.View entering={FadeIn.delay(800)}>
                        <Pressable style={styles.button} onPress={onClose}>
                            <Animated.Text style={styles.buttonText}>CONTINUAR</Animated.Text>
                        </Pressable>
                    </Animated.View>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
        width: '85%',
        maxWidth: 340,
    },
    starContainer: {
        marginBottom: 16,
    },
    levelUpText: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.primary,
        letterSpacing: 4,
        marginBottom: 20,
    },
    levelBadge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 15,
    },
    levelNumber: {
        fontSize: 48,
        fontWeight: '900',
        color: '#000000',
    },
    titleText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 16,
        color: '#888888',
        marginBottom: 24,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000000',
        letterSpacing: 1,
    },
});
