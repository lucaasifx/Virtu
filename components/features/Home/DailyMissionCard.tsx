import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { FontFamily } from '@/src/constants/theme';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function DailyMissionCard() {
    return (
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.heroSection}>
            <View style={styles.heroHeader}>
                <View>
                    <Text style={styles.sectionLabel}>MISSÃO DE HOJE</Text>
                    <Text style={styles.heroTitle}>
                        LEG DAY{'\n'}
                        <Text style={styles.heroSubtitle}>INFERIORES</Text>
                    </Text>
                </View>
                <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>60 MIN</Text>
                </View>
            </View>

            <TouchableOpacity activeOpacity={0.9} style={styles.heroCard}>
                <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                    style={styles.heroImage}
                    imageStyle={{ borderRadius: 28, opacity: 0.8 }}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
                        style={styles.heroGradient}
                    >
                        <View style={styles.heroTopRow}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>HIPERTROFIA</Text>
                            </View>
                            <View style={styles.arrowButton}>
                                <Feather name="arrow-up-right" size={20} color="#FFF" />
                            </View>
                        </View>

                        <View style={styles.heroBottomRow}>
                            <View style={styles.divider} />
                            <View style={styles.statsRow}>
                                <View style={[styles.statItem, styles.statBorderRight]}>
                                    <View style={styles.statValueRow}>
                                        <Text style={styles.statNumber}>6</Text>
                                        <MaterialCommunityIcons name="dumbbell" size={12} color="#FDCB13" />
                                    </View>
                                    <Text style={styles.statLabel}>EXERCÍCIOS</Text>
                                </View>
                                {/* Stat 2 */}
                                <View style={[styles.statItem, styles.statBorderRight, { paddingLeft: 16 }]}>
                                    <View style={styles.statValueRow}>
                                        <Text style={[styles.statNumber, { fontSize: 20 }]}>High</Text>
                                        <Ionicons name="flame" size={12} color="#F97316" />
                                    </View>
                                    <Text style={styles.statLabel}>INTENSIDADE</Text>
                                </View>
                                {/* Stat 3 */}
                                <View style={[styles.statItem, { paddingLeft: 16 }]}>
                                    <View style={styles.statValueRow}>
                                        <Text style={[styles.statNumber, { fontSize: 20 }]}>0%</Text>
                                        <View style={styles.pulseContainer}>
                                            <View style={styles.pulseDot} />
                                        </View>
                                    </View>
                                    <Text style={styles.statLabel}>NÃO INICIADO</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    heroSection: {
        marginBottom: 40,
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 10,
        fontFamily: FontFamily.title.extraBold,
        color: '#9CA3AF',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 36,
        fontFamily: FontFamily.title.extraBold,
        color: '#111',
        fontStyle: 'italic',
        lineHeight: 32,
        letterSpacing: -1,
        textTransform: 'uppercase',
    },
    heroSubtitle: {
        color: '#FDCB13',
    },
    durationBadge: {
        backgroundColor: '#000',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    durationText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: FontFamily.body.semiBold,
        letterSpacing: 1,
    },
    heroCard: {
        height: 208,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    heroImage: {
        flex: 1,
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: '#111827',
    },
    heroGradient: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    tag: {
        backgroundColor: '#FDCB13',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        shadowColor: '#EAB308',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    tagText: {
        fontSize: 9,
        fontFamily: FontFamily.title.extraBold,
        color: '#000',
        textTransform: 'uppercase',
    },
    arrowButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    heroBottomRow: {
        marginTop: 'auto',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
    },
    statBorderRight: {
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.1)',
        paddingRight: 16,
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    statNumber: {
        fontSize: 24,
        fontFamily: FontFamily.title.extraBold,
        color: '#FFF',
        lineHeight: 24,
    },
    statLabel: {
        fontSize: 9,
        fontFamily: FontFamily.body.semiBold,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    pulseContainer: {
        width: 8,
        height: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
    },
});
