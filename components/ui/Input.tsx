import { TextInput, TextInputProps, View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Colors, Spacing } from "@/src/constants/theme";
import { ThemedText as Text } from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: StyleProp<ViewStyle>;
    icon?: keyof typeof Ionicons.glyphMap;
}

export function Input({ label, error, style, containerStyle, icon, ...rest }: InputProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text variant="caption" style={styles.label}>
                    {label}
                </Text>
            )}
            <View style={[styles.inputContainer, error ? styles.inputError : null]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={Colors.text.secondary}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={Colors.text.secondary}
                    {...rest}
                />
            </View>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: Colors.surface,
        borderRadius: Spacing.sm,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.surface,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: Colors.text.primary,
        fontFamily: "Inter_400Regular",
    },
    icon: {
        marginRight: Spacing.sm,
    },
    inputError: {
        borderColor: Colors.error,
    },
    errorText: {
        color: Colors.error,
        marginTop: Spacing.xs,
    },
});
