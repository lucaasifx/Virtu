import { Tabs } from "expo-router";
import { TabBar } from "@/components/ui/TabBar";

export default function TabLayout() {
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
