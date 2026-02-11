import React from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { Colors, Spacing, FontFamily } from '@/src/constants/theme';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export interface HeaderStats {
    level: number;
    streak: number;
    xp: number;
    maxXp: number;
}

interface HeaderProps {
    stats: HeaderStats;
}

export function Header({ stats }: HeaderProps) {
    const insets = useSafeAreaInsets();
    const xpPercentage = Math.min(100, Math.max(0, (stats.xp / stats.maxXp) * 100));

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <BlurView intensity={80} tint="light" style={styles.blurBackground} />

            <View style={styles.content}>
                <View style={styles.topRow}>
                    <View style={styles.levelContainer}>
                        <View style={styles.levelIconBox}>
                            <Ionicons name="trophy" size={14} color="#FDCB13" />
                        </View>
                        <Text style={styles.levelText}>Nível {stats.level}</Text>
                    </View>

                    {/* Right: Profile */}
                    <View style={styles.profileContainer}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop' }}
                            style={styles.profileImage}
                        />
                    </View>
                </View>

                {/* Absolute Center: Streak (Moved out of topRow to guarantee screen centering) */}
                <View style={styles.streakContainer}>
                    <View style={styles.streakContent}>
                        <View style={styles.streakTopRow}>
                            <Ionicons name="flame" size={20} color="#FDCB13" />
                            <Text style={styles.streakValue}>{stats.streak}</Text>
                        </View>
                        <View style={styles.streakBottomRow}>
                            <Text style={styles.streakLabel}>
                                {stats.streak === 1 ? 'DIA' : 'DIAS'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Row: XP Bar */}
                <View style={styles.xpSection}>
                    <View style={styles.xpLabels}>
                        <Text style={styles.xpLabel}>PROGRESSO</Text>
                        <Text style={styles.xpValues}>
                            {stats.xp} <Text style={styles.xpMax}>/ {stats.maxXp} XP</Text>
                        </Text>
                    </View>

                    <View style={styles.xpTrack}>
                        <View style={[styles.xpFill, { width: `${xpPercentage}%` }]}>
                            <View style={styles.shine} />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    blurBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 12,
        paddingTop: 12,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    // Level
    levelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    levelIconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelText: {
        fontSize: 14,
        fontFamily: FontFamily.title.extraBold,
        color: '#111827',
    },
    streakContainer: {
        position: 'absolute',
        top: 12,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    streakContent: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        paddingVertical: 4,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 0,
        width: 'auto',
    },
    streakTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginBottom: -2,
    },
    streakBottomRow: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    streakValue: {
        fontSize: 20,
        fontFamily: FontFamily.title.extraBold,
        color: '#111827',
        lineHeight: 24,
    },
    streakLabel: {
        fontSize: 9,
        fontFamily: FontFamily.body.semiBold,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 4,
        width: '100%',
        paddingLeft: 4,
    },
    profileContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
    },
    xpSection: {
        gap: 6,
    },
    xpLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    xpLabel: {
        fontSize: 9,
        fontFamily: FontFamily.body.semiBold,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    xpValues: {
        fontSize: 10,
        fontFamily: FontFamily.title.extraBold,
        color: '#111827',
    },
    xpMax: {
        color: '#9CA3AF',
        fontFamily: FontFamily.body.semiBold,
    },
    xpTrack: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    xpFill: {
        height: '100%',
        backgroundColor: '#FDCB13',
        borderRadius: 4,
    },
    shine: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 2,
        backgroundColor: 'rgba(255,255,255,0.5)',
    }
});


