import { Tabs } from "expo-router";
import { TabBar } from "@/components/ui/TabBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name="Home"
                options={{ title: "Início" }}
            />
            <Tabs.Screen
                name="Workout"
                options={{ title: "Treino" }}
            />
            <Tabs.Screen
                name="Progress"
                options={{ title: "Progresso" }}
            />
            <Tabs.Screen
                name="Health"
                options={{ title: "Saúde" }}
            />
            <Tabs.Screen
                name="Evolution"
                options={{ title: "Evoluir" }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    // Removed old styles
});
