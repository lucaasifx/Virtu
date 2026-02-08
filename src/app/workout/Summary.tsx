import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing } from '@/src/constants/theme';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SummaryPhotoOptions } from '@/components/features/Workout/Summary/SummaryPhotoOptions';

export default function WorkoutSummaryScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);

    const duration = parseInt(params.duration as string || '0');
    const volume = parseInt(params.volume as string || '0');

    // Mock Data for "History" until we have persistence
    const streakDays = 12;

    // Format Duration elegantly (1h 20m)
    const formatDuration = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}min`;
    };

    const handleFinish = () => {
        router.dismissAll();
        // @ts-ignore
        router.replace('/(tabs)/Home');
    };

    const handlePhotoPress = () => {
        if (image) {
            setShowPhotoOptions(true);
        } else {
            setShowPhotoOptions(true); // Open options even if empty? Or just camera? 
            // User requested "customizar a caixa de diálogo". 
            // Let's open options for both cases to give choice (Camera vs Library)
        }
    };

    const pickImage = async () => {
        setShowPhotoOptions(false);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 5],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const takePhoto = async () => {
        setShowPhotoOptions(false);
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) return;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 5],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const removePhoto = () => {
        setImage(null);
        setShowPhotoOptions(false);
    };

    return (
        <View style={styles.container}>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>

                    {/* 1. Header: V9 Balanced */}
                    <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
                        <Text style={styles.title}>TREINO</Text>
                        <Text style={[styles.title, styles.titleSubtitle]}>CONCLUÍDO</Text>
                        <Text style={styles.date}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</Text>
                    </Animated.View>

                    {/* 2. Hero: V9 Balanced Frame (Increased Margins) */}
                    <Animated.View entering={ZoomIn.delay(400).springify()} style={styles.photoContainer}>
                        <TouchableOpacity style={styles.photoFrame} onPress={handlePhotoPress} activeOpacity={0.9}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.photo} resizeMode="cover" />
                            ) : (
                                <View style={styles.placeholder}>
                                    <View style={styles.iconContainer}>
                                        <MaterialCommunityIcons name="camera-plus" size={48} color="#000000" />
                                    </View>
                                    <Text style={styles.placeholderTitle}>REGISTRAR PUMP</Text>
                                    <Text style={styles.placeholderSubtitle}>Toque para adicionar foto</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* 3. Stats: Overlapping Sticker */}
                    <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.statsWrapper}>
                        <View style={styles.statsContainer}>

                            {/* Days Active */}
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>SEQUÊNCIA</Text>
                                <View style={styles.statValueRow}>
                                    <MaterialCommunityIcons name="fire" size={20} color={Colors.primary} style={{ marginRight: 4 }} />
                                    <Text style={styles.statValue}>{streakDays} Dias</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Duration */}
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>TEMPO</Text>
                                <View style={styles.statValueRow}>
                                    <MaterialCommunityIcons name="clock-time-four-outline" size={20} color={Colors.primary} style={{ marginRight: 4 }} />
                                    <Text style={styles.statValue}>{formatDuration(duration)}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Volume */}
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>VOLUME</Text>
                                <View style={styles.statValueRow}>
                                    <MaterialCommunityIcons name="weight-kilogram" size={20} color={Colors.primary} style={{ marginRight: 4 }} />
                                    <Text style={styles.statValue}>{(volume / 1000).toFixed(1)}k</Text>
                                </View>
                            </View>

                        </View>
                    </Animated.View>

                    {/* Footer: V9 Intense Branding */}
                    <View style={styles.footer}>

                        {/* Branding Badge: BLACK & BOLD */}
                        <View style={styles.brandingContainer}>
                            <MaterialCommunityIcons name="lightning-bolt" size={22} color="#000000" />
                            <Text style={styles.brandingText}>VIRTU APP</Text>
                        </View>

                        <TouchableOpacity style={styles.shareButton} activeOpacity={0.9}>
                            <Text style={styles.shareButtonText}>COMPARTILHAR NO STORY</Text>
                            <MaterialCommunityIcons name="instagram" size={24} color={Colors.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                            <Text style={styles.finishButtonText}>VOLTAR AO INÍCIO</Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#000000" />
                        </TouchableOpacity>
                    </View>

                </View>
            </SafeAreaView>

            <SummaryPhotoOptions
                visible={showPhotoOptions}
                onClose={() => setShowPhotoOptions(false)}
                onTakePhoto={takePhoto}
                onChooseFromLibrary={pickImage}
                onRemovePhoto={removePhoto}
                hasPhoto={!!image}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary, // Yellow Base
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.md,
        justifyContent: 'space-between',
        paddingVertical: Spacing.md, // V9: Balanced vertical padding (was sm in V8)
    },
    header: {
        alignItems: 'center',
        marginTop: Spacing.sm,
        zIndex: 10,
    },
    title: {
        fontFamily: 'Montserrat-Black',
        fontStyle: 'italic',
        fontSize: 36,
        lineHeight: 36,
        color: '#000000',
        letterSpacing: -1,
        textAlign: 'center',
        textTransform: 'uppercase',
        transform: [{ skewX: '-10deg' }]
    },
    titleSubtitle: {
        fontSize: 42,
        marginTop: -5,
    },
    date: {
        fontFamily: 'Inter-Bold',
        fontSize: 12,
        color: '#000000',
        marginTop: 8,
        opacity: 0.8,
        letterSpacing: 2,
    },

    // Photo Container: V9 (More margin = smaller frame)
    photoContainer: {
        flex: 1,
        marginBottom: Spacing.lg, // Increased from sm (V8) to pull frame up/shrink it
        marginTop: Spacing.md,
        zIndex: 1,
        paddingHorizontal: Spacing.xs, // Slight padding to narrow it
    },
    photoFrame: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#000000',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFBE6',
    },
    iconContainer: {
        marginBottom: Spacing.md,
        transform: [{ rotate: '-12deg' }]
    },
    placeholderTitle: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 22,
        color: '#000000',
        fontStyle: 'italic',
    },
    placeholderSubtitle: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: 'rgba(0,0,0,0.6)',
        marginTop: 4,
    },

    // STATS
    statsWrapper: {
        width: '100%',
        zIndex: 100,
        marginTop: -60, // Deep overlap
        paddingHorizontal: Spacing.sm,
        marginBottom: Spacing.lg, // More breathing room
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#000000',
        borderRadius: 20,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
        transform: [{ rotate: '-2deg' }],
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statLabel: {
        fontFamily: 'Inter-Black',
        fontSize: 10,
        color: Colors.gray[400],
        letterSpacing: 1,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    statValue: {
        fontFamily: 'Montserrat-Black',
        fontStyle: 'italic',
        fontSize: 18,
        color: '#FFFFFF',
        marginLeft: 4,
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: '#444444',
        marginHorizontal: Spacing.xs,
    },

    footer: {
        gap: Spacing.md,
        alignItems: 'center',
        paddingBottom: Spacing.md,
    },

    // BRANDING V9: BOLD
    brandingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 1, // Full visibility
        marginBottom: Spacing.xs,
    },
    brandingText: {
        fontFamily: 'Montserrat-Black', // Thickest font available
        fontSize: 20, // Bigger
        color: '#000000', // Solid Black
        marginLeft: 6,
        letterSpacing: 1,
        fontStyle: 'italic', // Match title
    },
    shareButton: {
        width: '100%',
        height: 64,
        backgroundColor: '#000000',
        borderRadius: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
        borderWidth: 3,
        borderColor: '#000000',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    shareButtonText: {
        color: Colors.primary,
        fontFamily: 'Inter-Black',
        fontSize: 16,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    finishButton: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    finishButtonText: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        color: '#000000',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
