import { ScrollView, View } from "react-native";
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Colors, Spacing } from "@/src/constants/theme";
import { router } from "expo-router";

export default function Playground() {
    return (
        <ScrollView
            contentContainerStyle={{
                padding: Spacing.lg,
                gap: Spacing.xl,
                paddingTop: 60,
            }}
        >
            <View>
                <Text variant="h1">Design System</Text>
                <Text variant="body" color={Colors.text.secondary}>
                    Playground para validação visual.
                </Text>
            </View>

            <View style={{ gap: Spacing.md }}>
                <Text variant="h2">Tipografia</Text>
                <Card>
                    <Text variant="h1">Heading 1</Text>
                    <Text variant="h2">Heading 2</Text>
                    <Text variant="h3">Heading 3</Text>
                    <Text variant="body">Body text: O rato roeu a roupa do rei de Roma.</Text>
                    <Text variant="caption">Caption text: Detalhes pequenos.</Text>
                </Card>
            </View>

            <View style={{ gap: Spacing.md }}>
                <Text variant="h2">Botões</Text>
                <Button title="Ir para o App (Tabs)" onPress={() => router.push("/(tabs)/Home")} />
                <Button title="Primary Action" onPress={() => { }} />
                <Button title="Outline Action" variant="outline" onPress={() => { }} />
                <Button title="Loading" isLoading onPress={() => { }} />
                <Button title="Disabled" disabled onPress={() => { }} />
            </View>

            <View style={{ gap: Spacing.md }}>
                <Text variant="h2">Inputs</Text>
                <Input label="Email" placeholder="exemplo@smartfit.com.br" />
                <Input
                    label="Senha"
                    placeholder="******"
                    secureTextEntry
                    error="Senha muito fraca"
                />
            </View>
        </ScrollView>
    );
}
