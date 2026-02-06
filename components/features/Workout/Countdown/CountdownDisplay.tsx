import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors } from "@/src/constants/theme";
import Animated, {
    ZoomIn,
    FadeOut
} from 'react-native-reanimated';

interface CountdownDisplayProps {
    count: number;
}

export function CountdownDisplay({ count }: CountdownDisplayProps) {
    return (
        <View style={styles.content}>
            <Text variant="caption" style={styles.supTitle}>PREPARAR</Text>

            <View style={styles.heroContainer}>
                <Animated.Text
                    key={count}
                    entering={ZoomIn.springify().damping(12).stiffness(100)}
                    exiting={FadeOut.duration(200)}
                    style={[styles.heroNumber, { position: 'absolute' }]}
                >
                    {count}
                </Animated.Text>
            </View>

            <Text variant="h3" style={styles.mainTitle}>
                INICIANDO TREINO
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        alignItems: 'center',
        zIndex: 10,
    },
    supTitle: {
        color: Colors.gray[400],
        letterSpacing: 6,
        fontSize: 14,
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    mainTitle: {
        color: Colors.text.light,
        letterSpacing: 4,
        fontSize: 18,
        fontWeight: '300',
        opacity: 0.8,
        marginTop: 40,
    },
    heroContainer: {
        width: 300,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroNumber: {
        fontSize: 180,
        fontFamily: 'Montserrat_800ExtraBold',
        fontStyle: 'italic',
        color: Colors.primary,
        textAlign: 'center',
        includeFontPadding: false,
        zIndex: 20,
        textShadowColor: 'rgba(253, 203, 19, 0.4)',
        textShadowOffset: { width: 0, height: 10 },
        textShadowRadius: 40,
    },
});
