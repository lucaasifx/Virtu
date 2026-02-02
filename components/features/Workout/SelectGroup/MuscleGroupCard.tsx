import React from "react";
import { TouchableOpacity, StyleSheet, Dimensions, View, ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing, FontFamily } from "@/src/constants/theme";
import { MuscleGroup } from "@/src/types/workout";
import { Ionicons } from "@expo/vector-icons";

interface MuscleGroupCardProps {
    muscleGroup: MuscleGroup;
    title: string;
    image: ImageSourcePropType | string;
    isSelected: boolean;
    onPress: () => void;
    exerciseCount?: number;
}

const { width } = Dimensions.get("window");
// Full width minus padding (Spacing.lg * 2)
const CARD_WIDTH = width - Spacing.lg * 2;
// Adjust height to show more image as requested
const CARD_HEIGHT = 220;

export function MuscleGroupCard({ muscleGroup, title, image, isSelected, onPress, exerciseCount }: MuscleGroupCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={styles.container}
        >
            <Image
                source={image}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                // Adding recycling key can help expo-image knowing when to keep/discard
                recyclingKey={muscleGroup}
            />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            />

            <View style={styles.content}>
                {exerciseCount !== undefined && (
                    <Text style={styles.exerciseCount}>
                        {exerciseCount} EXERCÍCIOS
                    </Text>
                )}
                <Text style={styles.title}>
                    {title}
                </Text>
            </View>

            {/* Selection Overlay */}
            {isSelected && (
                <View style={styles.selectionOverlay}>
                    <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={12} color={Colors.background} />
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: Colors.gray[800],
        marginBottom: Spacing.md,
        position: 'relative',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '80%',
        zIndex: 1,
    },
    content: {
        position: 'absolute',
        bottom: Spacing.md,
        left: Spacing.md,
        right: Spacing.md,
        zIndex: 2,
    },
    exerciseCount: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 1,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    title: {
        fontFamily: FontFamily.title.extraBold,
        fontSize: 44,
        lineHeight: 52,
        color: Colors.primary,
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: -2,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    selectionOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 3,
        borderColor: Colors.primary,
        borderRadius: 16,
        zIndex: 3,
        backgroundColor: 'transparent',
    },
    checkBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.background,
    }
});
