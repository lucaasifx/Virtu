import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontFamily } from "@/src/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.secondary,
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    backgroundColor: Colors.background,
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    height: 60 + insets.bottom,
                    paddingBottom: 8 + insets.bottom,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontFamily: FontFamily.body.semiBold,
                    fontSize: 10,
                },
            }}
        >
            <Tabs.Screen
                name="Home"
                options={{
                    title: "Início",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Workout"
                options={{
                    title: "Treino",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "barbell" : "barbell-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Progress"
                options={{
                    title: "Progresso",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "stats-chart" : "stats-chart-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Health"
                options={{
                    title: "Saúde",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "heart" : "heart-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Evolution"
                options={{
                    title: "Evoluir",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "trending-up" : "trending-up-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
