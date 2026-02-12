import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FontFamily } from '@/src/constants/theme';

interface Workout {
    id: number;
    title: string;
    category: string;
    duration: string;
    exercises: number;
    intensity: string;
    muscles: string;
    image: string;
    calories: string;
}

interface WorkoutCardProps {
    workout: Workout;
    onPress?: () => void;
}

export function WorkoutCard({ workout, onPress }: WorkoutCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.95}
            style={styles.workoutCard}
            onPress={onPress}
        >
            <View style={styles.cardImageContainer}>
                <Image source={{ uri: workout.image }} style={styles.cardImage} />
                <LinearGradient
                    colors={['transparent', 'rgba(17,17,17,0.8)', '#111']}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.cardOverlay}>
                    <View style={styles.catBadge}>
                        <Text style={styles.catBadgeText}>{workout.category}</Text>
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>{workout.title}</Text>
                        <Text style={styles.cardSubtitle}>{workout.muscles}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardStats}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <View style={styles.statLabelRow}>
                            <Ionicons name="timer-outline" size={14} color="#FDCB13" />
                            <Text style={styles.statLabel}>Tempo</Text>
                        </View>
                        <Text style={styles.statValue}>{workout.duration}</Text>
                    </View>

                    <View style={styles.verticalDivider} />

                    <View style={styles.statItem}>
                        <View style={styles.statLabelRow}>
                            <FontAwesome5 name="dumbbell" size={12} color="#FDCB13" />
                            <Text style={styles.statLabel}>Exercícios</Text>
                        </View>
                        <Text style={styles.statValue}>{workout.exercises}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.playButton}>
                    <Ionicons name="play" size={20} color="#111" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    workoutCard: {
        width: '100%',
        borderRadius: 32,
        backgroundColor: '#111',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    cardImageContainer: {
        height: 176,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.8,
    },
    cardOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 24,
        justifyContent: 'space-between',
    },
    catBadge: {
        backgroundColor: '#FDCB13',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    catBadgeText: {
        fontSize: 9,
        fontFamily: FontFamily.title.extraBold,
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardTitle: {
        fontSize: 24,
        fontFamily: FontFamily.title.extraBold,
        color: '#FFF',
        textTransform: 'uppercase',
        fontStyle: 'italic',
        letterSpacing: -0.5,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    cardSubtitle: {
        fontSize: 11,
        fontFamily: FontFamily.body.semiBold,
        color: '#D1D5DB',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardStats: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: '#111',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    statItem: {
        gap: 2,
    },
    statLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statLabel: {
        fontSize: 9,
        fontFamily: FontFamily.title.bold,
        color: '#FDCB13',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 18,
        fontFamily: FontFamily.title.extraBold,
        color: '#FFF',
    },
    verticalDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#374151',
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FDCB13',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FDCB13',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 5,
    },
});
