import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate, FadeIn } from 'react-native-reanimated';
import { Colors, Spacing } from '@/src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
    Home: { active: 'map', inactive: 'map-outline' },
    Workout: { active: 'barbell', inactive: 'barbell-outline' },
    Progress: { active: 'stats-chart', inactive: 'stats-chart-outline' },
    Health: { active: 'heart', inactive: 'heart-outline' },
    Evolution: { active: 'trophy', inactive: 'trophy-outline' },
};

const TabIcon = ({
    name,
    isFocused,
    onPress,
    onLongPress
}: {
    name: string;
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
}) => {
    const scale = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        scale.value = withSpring(isFocused ? 1 : 0, { damping: 10, stiffness: 100 });
    }, [isFocused, scale]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: interpolate(scale.value, [0, 1], [1, 1.2]) },
                { translateY: interpolate(scale.value, [0, 1], [0, -4]) }
            ],
        };
    });

    const iconName = isFocused ? ICONS[name]?.active : ICONS[name]?.inactive;

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
        >
            <Animated.View style={[animatedStyle, styles.iconContainer]}>
                <Ionicons
                    name={iconName || 'help-circle'}
                    size={24}
                    color={isFocused ? Colors.primary : '#666'}
                />
                {isFocused && (
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        style={styles.activeDot}
                    />
                )}
            </Animated.View>
        </Pressable>
    );
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
            <BlurView
                intensity={80}
                tint="dark"
                style={[styles.blurContainer]}
            >
                <View style={styles.content}>
                    {state.routes.map((route, index) => {
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                navigation.navigate(route.name, route.params);
                            }
                        };

                        const onLongPress = () => {
                            navigation.emit({
                                type: 'tabLongPress',
                                target: route.key,
                            });
                        };

                        return (
                            <TabIcon
                                key={route.key}
                                name={route.name}
                                isFocused={isFocused}
                                onPress={onPress}
                                onLongPress={onLongPress}
                            />
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    blurContainer: {
        width: '100%',
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(17, 17, 17, 0.85)', // Colors.gray[900] with opacity
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: Spacing.md,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary,
        position: 'absolute',
        bottom: -8,
    },
});
