import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { Colors, Typography as TypoArgs, FontFamily } from "@/src/constants/theme";

interface ThemedTextProps extends TextProps {
    variant?: "h1" | "h2" | "h3" | "body" | "caption";
    color?: string;
    weight?: keyof typeof FontFamily.body | keyof typeof FontFamily.title;
}

export function ThemedText({
    style,
    variant = "body",
    color = Colors.text.primary,
    ...rest
}: ThemedTextProps) {
    return (
        <RNText
            style={[
                styles.base,
                TypoArgs[variant],
                { color },
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    base: {
        includeFontPadding: false,
    },
});
