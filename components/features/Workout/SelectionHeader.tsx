import { View, StyleSheet } from "react-native";
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Input } from "@/components/ui/Input";
import { BackButton } from "@/components/ui/BackButton";
import { Colors, Spacing } from "@/src/constants/theme";

interface SelectionHeaderProps {
    search: string;
    onSearchChange: (text: string) => void;
    title?: string;
    subtitle?: string;
    placeholder?: string;
}

export default function SelectionHeader({
    search,
    onSearchChange,
    title = "O que vamos treinar hoje?",
    subtitle = "Selecione o grupo muscular",
    placeholder = "Buscar exercício..."
}: SelectionHeaderProps) {
    return (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <BackButton style={{ marginLeft: -Spacing.sm }} />
                <Text variant="h3" style={styles.headerTitle}>NOVO TREINO</Text>
                <View style={{ width: 32 }} />
            </View>

            <Text variant="h1" style={styles.pageTitle}>{title}</Text>
            <Text variant="body" style={styles.subtitle}>{subtitle}</Text>

            <Input
                placeholder={placeholder}
                value={search}
                onChangeText={onSearchChange}
                containerStyle={styles.searchContainer}
                icon="search"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 60,
        paddingBottom: Spacing.md,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    headerTitle: {
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: Colors.text.primary,
        fontSize: 16,
    },
    pageTitle: {
        marginBottom: Spacing.xs,
    },
    subtitle: {
        color: Colors.text.secondary,
        marginBottom: Spacing.lg,
    },
    searchContainer: {
        marginBottom: Spacing.sm,
    },
});