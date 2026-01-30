import { View, StyleSheet } from "react-native";
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function UserHeader() {
    return (
        <View style={styles.container}>
            <View>
                <Text variant="body" color={Colors.text.secondary}>Quarta, 29 Jan</Text>
                <Text variant="h1">Olá, Lucas</Text>
            </View>
            <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color={Colors.primary} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.gray[800],
        alignItems: 'center',
        justifyContent: 'center',
    },
});