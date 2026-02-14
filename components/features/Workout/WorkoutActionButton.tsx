import React from "react";
import { TouchableOpacity, StyleSheet, Text, TouchableOpacityProps, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Colors, FontFamily } from "@/src/constants/theme";

interface WorkoutActionButtonProps extends Omit<TouchableOpacityProps, "style"> {
    title: string;
    containerStyle?: ViewStyle;
}

export default function WorkoutActionButton({
    title,
    disabled,
    containerStyle,
    ...rest
}: WorkoutActionButtonProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={disabled}
            style={[styles.container, disabled && styles.disabledContainer, containerStyle]}
            {...rest}
        >
            <LinearGradient
                colors={[Colors.primary, "#FFEF9A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <Text style={styles.title}>{title}</Text>
                <Feather name="chevron-right" size={20} color={Colors.gray[900]} />
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 30,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    disabledContainer: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    gradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 18,
        borderRadius: 30,
    },
    title: {
        color: Colors.gray[900],
        fontFamily: FontFamily.title.bold,
        fontSize: 16,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
});
