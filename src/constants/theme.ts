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
