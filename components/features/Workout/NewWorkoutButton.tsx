import { Colors, Spacing } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../ui/Button";

const TAB_BAR_HEIGHT = 60;

export default function NewWorkoutButton() {
    const insets = useSafeAreaInsets();
    const bottomOffset = TAB_BAR_HEIGHT + insets.bottom + Spacing.md;

    return (
        <View style={[styles.container, { bottom: bottomOffset }]}>
            <Button
                title="INICIAR TREINO"
                onPress={() => router.push("/workout/Selection")}
                icon={<Ionicons name="play" size={20} color={Colors.secondary} />}
                style={styles.fabButton}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    fabButton: {
        borderRadius: 32,
        paddingHorizontal: 32,
        height: 56,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
});