import React from "react";
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/theme";
import { router } from "expo-router";

interface BackButtonProps {
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    color?: string;
}

export function BackButton({ onPress, style, color = Colors.text.primary }: BackButtonProps) {
    const handlePress = () => {
        if (onPress) onPress(); else router.back();
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.container, style]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons name="arrow-back" size={24} color={color} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
});
