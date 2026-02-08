import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withTiming,
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import { Colors } from '@/src/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface XPGainPopupProps {
    amount: number;
    visible: boolean;
    onComplete?: () => void;
}

export function XPGainPopup({ amount, visible, onComplete }: XPGainPopupProps) {
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);
    const iconRotate = useSharedValue(0);

    useEffect(() => {
        if (visible && amount > 0) {
            translateY.value = -100;
            opacity.value = 0;
            iconRotate.value = 0;
            translateY.value = withSpring(0, {
                damping: 15,
                stiffness: 150,
                mass: 0.8,
            });
            opacity.value = withTiming(1, { duration: 250 });

            iconRotate.value = withDelay(200,
                withSpring(360, { damping: 8, stiffness: 100 })
            );
            translateY.value = withDelay(
                2500,
                withTiming(-100, {
                    duration: 300,
                    easing: Easing.in(Easing.ease),
                }, (finished) => {
                    if (finished) {
                        opacity.value = 0;
                        if (onComplete) {
                            runOnJS(onComplete)();
                        }
                    }
                })
            );
        }
    }, [visible, amount]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${iconRotate.value}deg` }],
    }));

    if (!visible) return null;

    console.log('[XPGainPopup] Rendering with amount:', amount, 'visible:', visible);

    return (
        <View style={[styles.wrapper, { top: insets.top + 80 }]} pointerEvents="none">
            <Animated.View style={[styles.container, containerStyle]}>
                <Animated.View style={[styles.iconWrapper, iconStyle]}>
                    <MaterialCommunityIcons name="arrow-up-bold" size={24} color="#000" />
                </Animated.View>

                <View style={styles.textContainer}>
                    <Animated.Text style={styles.label}>XP GANHO</Animated.Text>
                    <Animated.Text style={styles.amount}>+{amount}</Animated.Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 9999,
        alignItems: 'center',
        elevation: 100,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: Colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 1,
        marginBottom: 2,
    },
    amount: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        fontFamily: 'Montserrat_800ExtraBold',
    },
});
