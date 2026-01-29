import { View, StyleSheet, ViewProps } from "react-native";
import { Colors, Spacing } from "@/src/constants/theme";

interface CardProps extends ViewProps {
    variant?: "elevated" | "outlined" | "flat";
}

export function Card({ style, variant = "elevated", ...rest }: CardProps) {
    return (
        <View
            style={[
                styles.container,
                variant === "elevated" && styles.elevated,
                variant === "outlined" && styles.outlined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        borderRadius: Spacing.md,
        padding: Spacing.md,
    },
    elevated: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    outlined: {
        borderWidth: 1,
        borderColor: Colors.surface,
    },
});
