import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, FontFamily } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { WorkoutDTO } from "@/src/types/workout";

const formatDuration = (seconds?: number) => {
    if (!seconds) return "-";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

const formatVolume = (volume?: number) => {
    if (!volume) return "-";
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}t`;
    return `${volume}kg`;
};

const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    if (isToday) return "Hoje";

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return "Ontem";

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
};

interface SessionCardProps {
    workout: WorkoutDTO;
}

export function WorkoutSessionCard({ workout }: SessionCardProps) {
    return (
        <View style={styles.sessionCard}>
            <View style={styles.sessionIcon}>
                <Ionicons name="barbell" size={20} color={Colors.primary} />
            </View>

            <View style={styles.sessionContent}>
                <Text style={styles.cardTitle}>{workout.title}</Text>
                <Text style={styles.cardSubtitle}>
                    {formatDate(workout.date).toUpperCase()} • {formatDuration(workout.duration).toUpperCase()} • {formatVolume(workout.totalVolume)}
                </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={Colors.gray[200]} />
        </View>
    );
}

const styles = StyleSheet.create({
    sessionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
        gap: 16,
    },
    sessionIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: Colors.gray[800],
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionContent: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    cardTitle: {
        fontFamily: FontFamily.body.semiBold,
        fontSize: 16,
        color: Colors.gray[800],
    },
    cardSubtitle: {
        fontFamily: FontFamily.body.medium,
        fontSize: 12,
        color: Colors.gray[400],
        letterSpacing: 0.5,
    },
});
