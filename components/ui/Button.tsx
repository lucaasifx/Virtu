import React from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator, TouchableOpacityProps, View } from "react-native";
import { Colors, Spacing } from "@/src/constants/theme";
import { ThemedText as Text } from "./ThemedText";

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: "primary" | "outline" | "ghost";
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export function Button({ title, variant = "primary", isLoading, style, disabled, icon, ...rest }: ButtonProps) {
    const isPrimary = variant === "primary";
    const isOutline = variant === "outline";

    return (
        <TouchableOpacity
            style={[
                styles.container,
                isPrimary && styles.primaryContainer,
                isOutline && styles.outlineContainer,
                disabled && styles.disabledContainer,
                style,
            ]}
            disabled={disabled || isLoading}
            activeOpacity={0.7}
            {...rest}
        >
            {isLoading ? (
                <ActivityIndicator color={isPrimary ? Colors.secondary : Colors.primary} />
            ) : (
                <View style={styles.contentContainer}>
                    {icon}
                    <Text
                        variant="body"
                        style={{
                            color: isPrimary ? Colors.secondary : Colors.text.primary,
                            fontFamily: "Montserrat_700Bold",
                            fontWeight: "bold",
                        }}
                    >
                        {title.toUpperCase()}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 56,
        borderRadius: Spacing.sm,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: Spacing.lg,
    },
    contentContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    primaryContainer: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    outlineContainer: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    disabledContainer: {
        opacity: 0.5,
    },
});
