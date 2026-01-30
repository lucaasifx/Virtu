import { TextInput, TextInputProps, View, StyleSheet } from "react-native";
import { Colors, Spacing } from "@/src/constants/theme";
import { ThemedText as Text } from "./ThemedText";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export function Input({ label, error, style, ...rest }: InputProps) {
    return (
        <View style={styles.container}>
            {label && (
                <Text variant="caption" style={styles.label}>
                    {label}
                </Text>
            )}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style,
                ]}
                placeholderTextColor={Colors.text.secondary}
                {...rest}
            />
            {error && (
                <Text variant="caption" style={styles.errorText}>
                    {error}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        marginBottom: Spacing.xs,
        color: Colors.text.secondary,
        fontWeight: "600",
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: Colors.surface,
        borderRadius: Spacing.sm,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.surface,
        fontSize: 16,
        color: Colors.text.primary,
        fontFamily: "Inter_400Regular",
    },
    inputError: {
        borderColor: Colors.error,
    },
    errorText: {
        color: Colors.error,
        marginTop: Spacing.xs,
    },
});
