import {
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
} from "@expo-google-fonts/inter";

export const Colors = {
    primary: "#FDCB13",
    secondary: "#000000",
    background: "#FFFFFF",
    surface: "#F5F5F5",
    text: {
        primary: "#000000",
        secondary: "#666666",
        light: "#FFFFFF",
    },
    success: "#00C853",
    error: "#FF3D00",
    gray: {
        100: "#F5F7FA",
        200: "#E0E0E0",
        300: "#CCCCCC",
        400: "#9E9E9E",
        500: "#666666",
        800: "#1A1A1A",
        900: "#111111",
    }
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const FontFamily = {
    title: {
        bold: "Montserrat_700Bold",
        extraBold: "Montserrat_800ExtraBold",
    },
    body: {
        regular: "Inter_400Regular",
        medium: "Inter_500Medium",
        semiBold: "Inter_600SemiBold",
    },
};

export const ThemeFonts = {
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
};

export const Typography = {
    h1: {
        fontFamily: FontFamily.title.extraBold,
        fontSize: 32,
        lineHeight: 40,
    },
    h2: {
        fontFamily: FontFamily.title.bold,
        fontSize: 24,
        lineHeight: 32,
    },
    h3: {
        fontFamily: FontFamily.body.semiBold,
        fontSize: 20,
        lineHeight: 28,
    },
    body: {
        fontFamily: FontFamily.body.regular,
        fontSize: 16,
        lineHeight: 24,
    },
    caption: {
        fontFamily: FontFamily.body.medium,
        fontSize: 12,
        lineHeight: 16,
    },
};
