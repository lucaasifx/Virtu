import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText as Text } from "./ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Href, router, Stack, useSegments } from "expo-router";
import { BackButton } from "./BackButton";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

interface ComingSoonProps {
    redirectHref?: Href;
}

export function ComingSoon({ redirectHref }: ComingSoonProps) {
    const segments = useSegments();
    // verifica se é uma tab
    const isTab = segments.some(segment => segment === "(tabs)");

    const handleRedirect = () => {
        if (redirectHref) {
            router.dismissAll();
            router.replace(redirectHref);
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.container, !isTab && styles.fullScreenContainer]}>
            {!isTab && (
                <>
                    <Stack.Screen options={{ headerShown: false }} />
                    <View style={styles.header}>
                        <BackButton onPress={handleRedirect} />
                    </View>
                </>
            )}

            <View style={styles.content}>
                <Animated.View
                    entering={ZoomIn.duration(600).springify()}
                    style={styles.iconWrapper}
                >

                    <View style={[styles.bracket, styles.bracketTopLeft]} />
                    <View style={[styles.bracket, styles.bracketBottomRight]} />

                    <View style={styles.iconCircle}>
                        <Ionicons name="construct" size={64} color={Colors.primary} />
                    </View>

                    <Animated.View
                        entering={ZoomIn.delay(300).springify()}
                        style={styles.gearBadge}
                    >
                        <Ionicons name="settings-sharp" size={20} color={Colors.secondary} />
                    </Animated.View>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(200).duration(500)}
                    style={styles.textContainer}
                >
                    <Text variant="h2" style={styles.title}>
                        PÁGINA EM{"\n"}CONSTRUÇÃO
                    </Text>
                    <View style={styles.separator} />
                    <Text variant="body" style={styles.description}>
                        Nossos engenheiros estão ajustando as anilhas. Essa funcionalidade estará disponível em breve.
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: "center",
        padding: Spacing.lg,
    },
    fullScreenContainer: {
        paddingTop: 60,
    },
    header: {
        position: 'absolute',
        top: 60,
        left: Spacing.lg,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xl,
    },
    iconWrapper: {
        position: "relative",
        width: 180,
        height: 180,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.lg,
    },
    bracket: {
        position: "absolute",
        width: 40,
        height: 40,
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    bracketTopLeft: {
        top: 0,
        left: 0,
        borderBottomWidth: 0,
        borderRightWidth: 0,
    },
    bracketBottomRight: {
        bottom: 0,
        right: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.gray[800],
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    gearBadge: {
        position: "absolute",
        bottom: 20,
        left: 20,
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    textContainer: {
        alignItems: "center",
        gap: Spacing.md,
        width: "100%",
        paddingHorizontal: Spacing.md,
    },
    title: {
        textAlign: "center",
        color: Colors.gray[800],
        letterSpacing: 0.5,
    },
    separator: {
        width: 60,
        height: 4,
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
    description: {
        textAlign: "center",
        color: Colors.text.secondary,
        lineHeight: 24,
    },
});
