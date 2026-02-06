import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    runOnJS,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface RpeSliderProps {
    value: number;
    onValueChange: (val: number) => void;
}

const SLIDER_WIDTH = Dimensions.get('window').width - (Spacing.lg * 2) - 40;
const KNOB_SIZE = 34;

export function RpeSlider({ value, onValueChange }: RpeSliderProps) {
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);
    const isPressed = useSharedValue(false);
    const MAX_X = SLIDER_WIDTH;

    const [isDragging, setIsDragging] = React.useState(false);

    const pan = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-20, 20])
        .onStart(() => {
            startX.value = translateX.value;
            isPressed.value = true;
            runOnJS(setIsDragging)(true);
        })
        .onUpdate((e) => {
            let nextX = startX.value + e.translationX;
            if (nextX < 0) nextX = 0;
            if (nextX > MAX_X) nextX = MAX_X;
            translateX.value = nextX;

            const rpe = Math.round((nextX / MAX_X) * 10);
            const clampedRpe = Math.max(1, rpe);

            runOnJS(onValueChange)(clampedRpe);
        })
        .onFinalize(() => {
            isPressed.value = false;
            runOnJS(setIsDragging)(false);
        });

    useEffect(() => {
        if (!isDragging) {
            const targetPos = (value / 10) * MAX_X;
            translateX.value = withTiming(targetPos, { duration: 200 });
        }
    }, [value, isDragging]);

    const valueScaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isPressed.value ? 1.2 : 1) }]
    }));

    const knobStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: withSpring(isPressed.value ? 1.3 : 1) }
        ],
        shadowOpacity: withSpring(isPressed.value ? 0.4 : 0.2),
    }));

    const activeTrackStyle = useAnimatedStyle(() => ({
        width: translateX.value
    }));

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.label}>ESFORÇO (RPE)</Text>
                <Animated.View style={[styles.ratingContainer, valueScaleStyle]}>
                    <Text style={styles.value}>{value}</Text>
                </Animated.View>
            </View>

            <View style={styles.sliderContainer}>
                <View style={styles.trackBackground} />
                <Animated.View style={[styles.trackActive, activeTrackStyle]} />
                <GestureDetector gesture={pan}>
                    <Animated.View style={[styles.knob, knobStyle]}>
                        <View style={styles.knobInner} />
                    </Animated.View>
                </GestureDetector>
            </View>

            <View style={styles.footerRow}>
                <Text style={styles.scaleLabel}>0 - FÁCIL</Text>
                <Text style={styles.scaleLabel}>FALHA - 10</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: Colors.gray[400],
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    ratingContainer: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    value: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000', // Black as requested
        fontFamily: 'Montserrat_800ExtraBold',
    },
    sliderContainer: {
        height: 48,
        justifyContent: 'center',
        marginBottom: 4,
    },
    trackBackground: {
        height: 4,
        backgroundColor: '#E5E5E5',
        borderRadius: 2,
        width: '100%',
        position: 'absolute',
        left: 0,
        right: 0,
    },
    trackActive: {
        height: 6,
        backgroundColor: Colors.primary,
        borderRadius: 3,
        position: 'absolute',
        top: 21,
        left: 0,
    },
    knob: {
        width: KNOB_SIZE,
        height: KNOB_SIZE,
        borderRadius: KNOB_SIZE / 2,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: (48 - KNOB_SIZE) / 2,
        left: -KNOB_SIZE / 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    knobInner: {
        width: 0,
        height: 0,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    scaleLabel: {
        fontSize: 10,
        color: Colors.gray[400],
        fontWeight: '600',
    }
});
