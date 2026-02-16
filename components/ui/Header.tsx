import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Image, Modal, Pressable, TouchableOpacity } from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { Colors, FontFamily } from '@/src/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { getUserClass, USER_CLASSES } from '@/src/constants/classes';

import Animated, {
    cancelAnimation,
    Easing,
    FadeInDown,
    SlideInRight,
    SlideOutRight,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { useAuth } from '@/src/context/AuthContext';
import { Href, useRouter } from 'expo-router';
import { ThemeMode, useAppTheme } from '@/src/context/ThemeContext';

export interface HeaderStats {
    level: number;
    streak: number;
    xp: number;
    maxXp: number;
}

interface HeaderProps {
    stats: HeaderStats;
}

type MenuItem = {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    route?: Href;
    disabled?: boolean;
};

type ThemeOption = {
    id: ThemeMode;
    title: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
};



const MENU_ITEMS: MenuItem[] = [
    {
        id: 'workout',
        title: 'Area de Treino',
        subtitle: 'Ir para rotinas e execucao',
        icon: 'barbell-outline',
        route: '/(tabs)/Workout',
    },
    {
        id: 'home',
        title: 'Inicio',
        subtitle: 'Resumo e missao diaria',
        icon: 'home-outline',
        route: '/(tabs)/Home',
    },
    {
        id: 'settings',
        title: 'Configuracoes',
        subtitle: 'Preferencias da conta',
        icon: 'settings-outline',
        disabled: true,
    },
    {
        id: 'support',
        title: 'Suporte',
        subtitle: 'Ajuda e feedback',
        icon: 'help-circle-outline',
        disabled: true,
    },
];

const THEME_OPTIONS: ThemeOption[] = [
    {
        id: 'light',
        title: 'Claro',
        icon: 'sunny-outline',
    },
    {
        id: 'dark',
        title: 'Escuro',
        icon: 'moon-outline',
    },
    {
        id: 'system',
        title: 'Sistema',
        icon: 'phone-portrait-outline',
    },
];



function HeaderComponent({ stats }: HeaderProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { themeMode, resolvedTheme, setThemeMode } = useAppTheme();
    const [menuVisible, setMenuVisible] = useState(false);
    const [levelCardVisible, setLevelCardVisible] = useState(false);
    const badgePulse = useSharedValue(1);
    const beamTranslateX = useSharedValue(-120);

    const isDarkTheme = resolvedTheme === 'dark';
    const palette = useMemo(() => {
        if (isDarkTheme) {
            return {
                headerBg: 'rgba(16,16,18,0.86)',
                headerBorder: '#202026',
                menuBg: '#101114',
                menuBorder: '#23242B',
                menuHeaderBorder: '#23242B',
                cardBg: '#161820',
                cardBgMuted: '#191B23',
                cardBorder: '#2A2E3B',
                iconShellBg: '#1C1F28',
                iconShellBorder: '#2E3442',
                textPrimary: '#F9FAFB',
                textSecondary: '#AAB0BE',
                textMuted: '#8D95A7',
                overlay: 'rgba(0,0,0,0.58)',
                badgeBorder: '#101114',
                logoutBg: '#FDCB13',
                logoutBorder: '#F4BE00',
                logoutText: '#111827',
                chevron: '#AAB0BE',
                trackBg: '#2A2E3B',
                streakLabel: '#8D95A7',
                profileBg: '#1C1F28',
                profileBorder: '#2E3442',
                levelBoxBg: '#1C1F28',
                levelBoxBorder: '#2E3442',
                soonBg: '#2A2E3B',
                soonText: '#E5E7EB',
            };
        }

        return {
            headerBg: 'rgba(255,255,255,0.85)',
            headerBorder: '#F3F4F6',
            menuBg: '#FFFFFF',
            menuBorder: '#E5E7EB',
            menuHeaderBorder: '#F3F4F6',
            cardBg: '#FCFCFC',
            cardBgMuted: '#F7F7F8',
            cardBorder: '#ECEFF3',
            iconShellBg: '#FFFFFF',
            iconShellBorder: '#E5E7EB',
            textPrimary: '#111827',
            textSecondary: '#6B7280',
            textMuted: '#9CA3AF',
            overlay: 'rgba(0,0,0,0.32)',
            badgeBorder: '#FFFFFF',
            logoutBg: '#111827',
            logoutBorder: '#000000',
            logoutText: '#FFFFFF',
            chevron: '#6B7280',
            trackBg: '#E5E7EB',
            streakLabel: '#9CA3AF',
            profileBg: '#F3F4F6',
            profileBorder: '#E5E7EB',
            levelBoxBg: '#F9FAFB',
            levelBoxBorder: '#E5E7EB',
            soonBg: '#E5E7EB',
            soonText: '#374151',
        };
    }, [isDarkTheme]);

    const xpPercentage = Math.min(100, Math.max(0, (stats.xp / stats.maxXp) * 100));
    const xpRemaining = Math.max(0, stats.maxXp - stats.xp);
    const streakGoal = stats.streak < 7 ? 7 : stats.streak + 3;
    const userClass = useMemo(() => {
        const level = stats.level;
        const currentClass = getUserClass(level);

        const sorted = [...USER_CLASSES].sort((a, b) => a.minLevel - b.minLevel);
        const currentIndex = sorted.findIndex((item) => item.title === currentClass.title);
        const next = currentIndex >= 0 && currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;
        return { current: currentClass, next, currentIndex };
    }, [stats.level]);
    const email = user?.email ?? 'atleta@virtu.app';

    const displayName = useMemo(() => {
        const candidate = user?.user_metadata?.full_name;
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
            return candidate;
        }
        return email.split('@')[0];
    }, [email, user?.user_metadata?.full_name]);

    const avatarUrl = useMemo(() => {
        const candidate = user?.user_metadata?.avatar_url;
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
            return candidate;
        }
        return 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop';
    }, [user?.user_metadata?.avatar_url]);

    const initials = useMemo(() => {
        const words = displayName.trim().split(/\s+/).filter(Boolean);
        const raw = words.slice(0, 2).map(word => word[0]?.toUpperCase() ?? '').join('');
        return raw || 'V';
    }, [displayName]);

    const closeMenu = () => setMenuVisible(false);

    const handleMenuRoute = (route?: Href, disabled?: boolean) => {
        if (disabled || !route) {
            return;
        }
        closeMenu();
        router.push(route);
    };

    const handleSignOut = async () => {
        closeMenu();
        await signOut();
    };

    const handleThemeModeChange = (mode: ThemeMode) => {
        setLevelCardVisible(false);
        closeMenu();
        requestAnimationFrame(() => {
            setThemeMode(mode);
        });
    };
    const nextClassLabel = userClass.next ? `${userClass.next.title} (Nv ${userClass.next.minLevel})` : 'Classe maxima';
    const rankProgressPercent = Math.round(xpPercentage);

    useEffect(() => {
        if (!levelCardVisible) {
            cancelAnimation(badgePulse);
            cancelAnimation(beamTranslateX);
            badgePulse.value = 1;
            beamTranslateX.value = -120;
            return;
        }

        badgePulse.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
                withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );

        beamTranslateX.value = withRepeat(
            withSequence(
                withTiming(300, { duration: 1800, easing: Easing.linear }),
                withTiming(-120, { duration: 0 })
            ),
            -1,
            false
        );
    }, [badgePulse, beamTranslateX, levelCardVisible]);

    const nodeGlowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: badgePulse.value }]
    }));

    const beamStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: beamTranslateX.value }]
    }));

    return (
        <>
            <View style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    backgroundColor: palette.headerBg,
                    borderBottomColor: palette.headerBorder
                },
                levelCardVisible && {
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                    paddingBottom: 24,
                    borderBottomWidth: 0,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    elevation: 10,
                }
            ]}>
                <View style={[
                    StyleSheet.absoluteFill,
                    levelCardVisible && {
                        borderBottomLeftRadius: 32,
                        borderBottomRightRadius: 32,
                        overflow: 'hidden',
                    }
                ]}>
                    <BlurView
                        intensity={80}
                        tint={isDarkTheme ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                </View>

                <View style={styles.content}>
                    <View style={styles.topRow}>
                        <View style={styles.levelContainer}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => setLevelCardVisible((prev) => !prev)}
                                style={[styles.levelTouch, { backgroundColor: palette.levelBoxBg, borderColor: palette.levelBoxBorder }]}
                            >
                                <View style={[styles.levelIconBox, { backgroundColor: palette.levelBoxBg, borderColor: palette.levelBoxBorder }]}>
                                    <Ionicons name="trophy" size={14} color="#FDCB13" />
                                </View>
                                <Text style={[styles.levelText, { color: palette.textPrimary }]}>Nivel {stats.level}</Text>
                                <Ionicons
                                    name={levelCardVisible ? 'chevron-up' : 'chevron-down'}
                                    size={14}
                                    color={palette.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.profileContainer, { backgroundColor: palette.profileBg, borderColor: palette.profileBorder }]}
                            activeOpacity={0.85}
                            onPress={() => setMenuVisible(true)}
                        >
                            <Image
                                source={{ uri: avatarUrl }}
                                style={styles.profileImage}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.streakContainer} pointerEvents="none">
                        <View style={styles.streakContent}>
                            <View style={styles.streakTopRow}>
                                <Ionicons name="flame" size={20} color="#FDCB13" />
                                <Text style={[styles.streakValue, { color: palette.textPrimary }]}>{stats.streak}</Text>
                            </View>
                            <View style={styles.streakBottomRow}>
                                <Text style={[styles.streakLabel, { color: palette.streakLabel }]}>
                                    {stats.streak === 1 ? 'DIA' : 'DIAS'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.xpSection}>
                        <View style={styles.xpLabels}>
                            <Text style={[styles.xpLabel, { color: palette.textMuted }]}>PROGRESSO</Text>
                            <Text style={[styles.xpValues, { color: palette.textPrimary }]}>
                                {stats.xp} <Text style={[styles.xpMax, { color: palette.textMuted }]}>/ {stats.maxXp} XP</Text>
                            </Text>
                        </View>

                        <View style={[styles.xpTrack, { backgroundColor: palette.trackBg }]}>
                            <View style={[styles.xpFill, { width: `${xpPercentage}%` }]}>
                                <View style={styles.shine} />
                            </View>
                        </View>
                    </View>

                    {levelCardVisible ? (
                        <Animated.View
                            entering={FadeInDown.duration(220)}
                            style={[styles.levelCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
                        >

                            <View style={styles.hudStatusRow}>

                                <View style={styles.hudRing}>
                                    <Svg width={72} height={72} style={styles.hudRingSvg}>
                                        <Circle cx={36} cy={36} r={31} stroke={palette.trackBg} strokeWidth={5} fill="none" />
                                        <Circle cx={36} cy={36} r={31} stroke={Colors.primary} strokeWidth={5} fill="none" strokeDasharray={`${2 * Math.PI * 31}`} strokeDashoffset={`${2 * Math.PI * 31 * (1 - xpPercentage / 100)}`} strokeLinecap="round" transform="rotate(-90 36 36)" />
                                    </Svg>
                                    <View style={[styles.hudRingInner, { backgroundColor: palette.cardBg }]}>
                                        <MaterialCommunityIcons name={userClass.current.icon} size={24} color={Colors.primary} />
                                    </View>
                                </View>


                                <View style={styles.hudClassInfo}>
                                    <Text style={[styles.hudClassTag, { color: palette.textMuted }]}>CLASSE ATUAL</Text>
                                    <Text style={[styles.hudClassName, { color: palette.textPrimary }]}>Lv {stats.level}: {userClass.current.title}</Text>
                                    <Text style={[styles.hudClassSummary, { color: palette.textSecondary }]} numberOfLines={2}>{userClass.current.summary}</Text>

                                    <View style={styles.hudXpBarRow}>
                                        <View style={[styles.hudXpTrack, { backgroundColor: palette.trackBg }]}>
                                            <View style={[styles.hudXpFill, { width: `${xpPercentage}%` }]}>
                                                <Animated.View style={[styles.hudXpBeam, beamStyle]} />
                                            </View>
                                        </View>
                                        <Text style={[styles.hudXpLabel, { color: palette.textMuted }]}>{rankProgressPercent}%</Text>
                                    </View>
                                </View>
                            </View>


                            <View style={[styles.hudRoadmap, { backgroundColor: palette.cardBgMuted, borderColor: palette.cardBorder }]}>
                                <Text style={[styles.hudRoadmapTitle, { color: palette.textMuted }]}>JORNADA DE CLASSES</Text>
                                <View style={styles.hudRoadmapTrack}>
                                    {USER_CLASSES.map((cls, index) => {
                                        const isCompleted = index < userClass.currentIndex;
                                        const isCurrent = index === userClass.currentIndex;
                                        const isLast = index === USER_CLASSES.length - 1;

                                        return (
                                            <View key={cls.title} style={styles.hudRoadmapNodeGroup}>

                                                <View style={styles.hudRoadmapNodeCol}>
                                                    {isCurrent ? (
                                                        <Animated.View style={[styles.hudRoadmapCurrentNode, nodeGlowStyle]}>
                                                            <View style={styles.hudRoadmapCurrentNodeInner}>
                                                                <MaterialCommunityIcons name={cls.icon} size={14} color="#111827" />
                                                            </View>
                                                        </Animated.View>
                                                    ) : (
                                                        <View style={[
                                                            styles.hudRoadmapNode,
                                                            isCompleted
                                                                ? styles.hudRoadmapNodeDone
                                                                : { borderColor: palette.trackBg, backgroundColor: 'transparent' }
                                                        ]}>
                                                            {isCompleted ? (
                                                                <Ionicons name="checkmark" size={10} color="#111827" />
                                                            ) : (
                                                                <MaterialCommunityIcons name={cls.icon} size={10} color={palette.textMuted} />
                                                            )}
                                                        </View>
                                                    )}
                                                    <Text style={[
                                                        styles.hudRoadmapLabel,
                                                        { color: isCurrent ? Colors.primary : isCompleted ? palette.textSecondary : palette.textMuted }
                                                    ]} numberOfLines={1}>{cls.title.split(' ')[0]}</Text>
                                                </View>


                                                {!isLast && (
                                                    <View style={[
                                                        styles.hudRoadmapLine,
                                                        { backgroundColor: isCompleted ? Colors.primary : palette.trackBg }
                                                    ]} />
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>


                            <View style={[styles.hudStatRow, { borderColor: palette.cardBorder }]}>
                                <View style={styles.hudStatItem}>
                                    <View style={styles.hudStatValueRow}>
                                        <Ionicons name="flame" size={16} color={Colors.primary} />
                                        <Text style={[styles.hudStatNumber, { color: palette.textPrimary }]}>{stats.streak}</Text>
                                    </View>
                                    <Text style={[styles.hudStatLabel, { color: palette.textMuted }]}>{stats.streak === 1 ? 'DIA' : 'DIAS'} STREAK</Text>
                                </View>
                                <View style={[styles.hudStatDivider, { backgroundColor: palette.cardBorder }]} />
                                <View style={styles.hudStatItem}>
                                    <View style={styles.hudStatValueRow}>
                                        <Ionicons name="flash" size={16} color={Colors.primary} />
                                        <Text style={[styles.hudStatNumber, { color: palette.textPrimary }]}>{xpRemaining}</Text>
                                    </View>
                                    <Text style={[styles.hudStatLabel, { color: palette.textMuted }]}>XP RESTANTE</Text>
                                </View>
                                <View style={[styles.hudStatDivider, { backgroundColor: palette.cardBorder }]} />
                                <View style={styles.hudStatItem}>
                                    <View style={styles.hudStatValueRow}>
                                        <Ionicons name="flag" size={16} color={Colors.primary} />
                                        <Text style={[styles.hudStatNumber, { color: palette.textPrimary }]}>{streakGoal}</Text>
                                    </View>
                                    <Text style={[styles.hudStatLabel, { color: palette.textMuted }]}>META STREAK</Text>
                                </View>
                            </View>


                            <View style={[styles.hudMission, { backgroundColor: isDarkTheme ? '#1A1A1A' : '#111827' }]}>
                                <View style={styles.hudMissionHeader}>
                                    <Ionicons name="flash" size={14} color={Colors.primary} />
                                    <Text style={styles.hudMissionTag}>MISSÃO ATIVA</Text>
                                </View>
                                <Text style={styles.hudMissionText}>
                                    Complete <Text style={styles.hudMissionHighlight}>1 rotina completa</Text> para manter sua streak e subir rumo a {nextClassLabel}.
                                </Text>
                            </View>
                        </Animated.View>
                    ) : null}
                </View>
            </View>

            <Modal
                visible={menuVisible}
                transparent
                animationType="none"
                onRequestClose={closeMenu}
                statusBarTranslucent
                navigationBarTranslucent
            >
                <View style={styles.menuLayer}>
                    <View style={styles.overlay}>
                        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: palette.overlay }]} onPress={closeMenu} />
                    </View>

                    <Animated.View
                        entering={SlideInRight.duration(180)}
                        exiting={SlideOutRight.duration(150)}
                        style={[
                            styles.menuPanel,
                            {
                                paddingTop: insets.top + 18,
                                paddingBottom: insets.bottom + 18,
                                backgroundColor: palette.menuBg,
                                borderLeftColor: palette.menuBorder
                            }
                        ]}
                    >
                        <View style={[styles.menuHeader, { borderBottomColor: palette.menuHeaderBorder }]}>
                            <View style={[styles.menuAvatarShell, { backgroundColor: palette.textPrimary }]}>
                                <Image source={{ uri: avatarUrl }} style={styles.menuAvatar} />
                                <View style={[styles.menuBadge, { borderColor: palette.badgeBorder }]}>
                                    <Text style={styles.menuBadgeText}>{initials}</Text>
                                </View>
                            </View>

                            <View style={styles.menuUserBlock}>
                                <Text numberOfLines={1} style={[styles.menuUserName, { color: palette.textPrimary }]}>{displayName}</Text>
                                <Text numberOfLines={1} style={[styles.menuUserEmail, { color: palette.textSecondary }]}>{email}</Text>
                            </View>
                        </View>

                        <View style={styles.menuSection}>
                            {MENU_ITEMS.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.menuItem,
                                        { backgroundColor: item.disabled ? palette.cardBgMuted : palette.cardBg, borderColor: palette.cardBorder },
                                        item.disabled && styles.menuItemDisabled
                                    ]}
                                    activeOpacity={item.disabled ? 1 : 0.82}
                                    onPress={() => handleMenuRoute(item.route, item.disabled)}
                                >
                                    <View style={[styles.menuIconShell, { backgroundColor: palette.iconShellBg, borderColor: palette.iconShellBorder }, item.disabled && styles.menuIconShellDisabled]}>
                                        <Ionicons name={item.icon} size={18} color={item.disabled ? palette.textMuted : palette.textPrimary} />
                                    </View>

                                    <View style={styles.menuTextBlock}>
                                        <Text style={[styles.menuItemTitle, { color: palette.textPrimary }, item.disabled && styles.menuItemTitleDisabled]}>
                                            {item.title}
                                        </Text>
                                        <Text style={[styles.menuItemSubtitle, { color: palette.textSecondary }]}>{item.subtitle}</Text>
                                    </View>

                                    {item.disabled ? (
                                        <View style={[styles.soonBadge, { backgroundColor: palette.soonBg }]}>
                                            <Text style={[styles.soonBadgeText, { color: palette.soonText }]}>Em breve</Text>
                                        </View>
                                    ) : (
                                        <Ionicons name="chevron-forward" size={16} color={palette.chevron} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={[styles.themeSection, { borderTopColor: palette.menuHeaderBorder }]}>
                            <Text style={[styles.themeTitle, { color: palette.textMuted }]}>Tema do app</Text>
                            <View style={styles.themeOptions}>
                                {THEME_OPTIONS.map(option => {
                                    const isSelected = themeMode === option.id;
                                    return (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.themeOption,
                                                {
                                                    backgroundColor: isSelected ? Colors.primary : palette.cardBg,
                                                    borderColor: isSelected ? Colors.primary : palette.cardBorder
                                                }
                                            ]}
                                            activeOpacity={0.88}
                                            onPress={() => handleThemeModeChange(option.id)}
                                        >
                                            <Ionicons
                                                name={option.icon}
                                                size={16}
                                                color={isSelected ? '#111827' : palette.textSecondary}
                                            />
                                            <Text style={[styles.themeOptionText, { color: isSelected ? '#111827' : palette.textSecondary }]}>
                                                {option.title}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: palette.logoutBg, borderColor: palette.logoutBorder }]} onPress={handleSignOut} activeOpacity={0.9}>
                            <Ionicons name="log-out-outline" size={18} color={palette.logoutText} />
                            <Text style={[styles.logoutText, { color: palette.logoutText }]}>Encerrar Sessao</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}

export const Header = React.memo(HeaderComponent);

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
    levelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    levelTouch: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderRadius: 18,
        paddingRight: 10,
        overflow: 'hidden',
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
    levelCard: {
        marginTop: 12,
        borderRadius: 18,
        borderWidth: 1,
        padding: 14,
        gap: 14,
    },

    hudStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    hudRing: {
        width: 72,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hudRingSvg: {
        position: 'absolute',
    },
    hudRingInner: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hudClassInfo: {
        flex: 1,
        gap: 3,
    },
    hudClassTag: {
        fontSize: 9,
        fontFamily: FontFamily.title.bold,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    hudClassName: {
        fontSize: 20,
        fontFamily: FontFamily.title.extraBold,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        lineHeight: 22,
    },
    hudClassSummary: {
        fontSize: 11,
        fontFamily: FontFamily.body.medium,
        lineHeight: 15,
    },
    hudXpBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    hudXpTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    hudXpFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 3,
        overflow: 'hidden',
    },
    hudXpBeam: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 30,
        backgroundColor: 'rgba(255,255,255,0.40)',
    },
    hudXpLabel: {
        fontSize: 10,
        fontFamily: FontFamily.title.extraBold,
        minWidth: 28,
        textAlign: 'right',
    },

    hudRoadmap: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
        gap: 10,
    },
    hudRoadmapTitle: {
        fontSize: 9,
        fontFamily: FontFamily.title.bold,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    hudRoadmapTrack: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    hudRoadmapNodeGroup: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    hudRoadmapNodeCol: {
        alignItems: 'center',
        gap: 4,
        width: 40,
        zIndex: 2,
    },
    hudRoadmapNode: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hudRoadmapNodeDone: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    hudRoadmapCurrentNode: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 6,
    },
    hudRoadmapCurrentNodeInner: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hudRoadmapLabel: {
        fontSize: 8,
        fontFamily: FontFamily.title.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    hudRoadmapLine: {
        height: 2,
        flex: 1,
        borderRadius: 1,
        marginTop: 12,
        marginHorizontal: -4,
        zIndex: 1,
    },

    hudStatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    hudStatItem: {
        flex: 1,
        alignItems: 'center',
        gap: 3,
    },
    hudStatValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    hudStatNumber: {
        fontSize: 18,
        fontFamily: FontFamily.title.extraBold,
        lineHeight: 20,
    },
    hudStatLabel: {
        fontSize: 8,
        fontFamily: FontFamily.title.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    hudStatDivider: {
        width: 1,
        height: 28,
    },

    hudMission: {
        borderRadius: 14,
        padding: 14,
        gap: 6,
    },
    hudMissionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    hudMissionTag: {
        fontSize: 10,
        fontFamily: FontFamily.title.extraBold,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: Colors.primary,
    },
    hudMissionText: {
        fontSize: 12,
        lineHeight: 18,
        fontFamily: FontFamily.body.medium,
        color: '#D1D5DB',
    },
    hudMissionHighlight: {
        color: Colors.primary,
        fontFamily: FontFamily.title.bold,
    },
    menuLayer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    menuPanel: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '84%',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 18,
        borderLeftWidth: 1,
        borderLeftColor: '#E5E7EB',
        shadowColor: '#000000',
        shadowOffset: { width: -6, height: 0 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 14,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingBottom: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuAvatarShell: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#111827',
        padding: 2,
    },
    menuAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 27,
    },
    menuBadge: {
        position: 'absolute',
        right: -5,
        bottom: -4,
        minWidth: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    menuBadgeText: {
        fontSize: 10,
        color: '#111827',
        fontFamily: FontFamily.title.extraBold,
        letterSpacing: 0.3,
    },
    menuUserBlock: {
        flex: 1,
    },
    menuUserName: {
        fontSize: 16,
        color: '#111827',
        fontFamily: FontFamily.title.extraBold,
    },
    menuUserEmail: {
        marginTop: 2,
        fontSize: 12,
        color: '#6B7280',
        fontFamily: FontFamily.body.medium,
    },
    menuSection: {
        marginTop: 16,
        gap: 8,
        flex: 1,
    },
    menuItem: {
        backgroundColor: '#FCFCFC',
        borderWidth: 1,
        borderColor: '#ECEFF3',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    menuItemDisabled: {},
    menuIconShell: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIconShellDisabled: {},
    menuTextBlock: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 14,
        color: '#111827',
        fontFamily: FontFamily.body.semiBold,
    },
    menuItemTitleDisabled: {
        color: '#9CA3AF',
    },
    menuItemSubtitle: {
        marginTop: 1,
        fontSize: 11,
        color: '#6B7280',
        fontFamily: FontFamily.body.medium,
    },
    soonBadge: {
        borderRadius: 9,
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    soonBadgeText: {
        fontSize: 9,
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        fontFamily: FontFamily.title.bold,
    },
    logoutButton: {
        backgroundColor: '#111827',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#000000',
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 13,
        letterSpacing: 0.7,
        textTransform: 'uppercase',
        fontFamily: FontFamily.title.bold,
    },
    themeSection: {
        marginBottom: 12,
        paddingTop: 14,
        borderTopWidth: 1,
    },
    themeTitle: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: FontFamily.title.bold,
        marginBottom: 10,
    },
    themeOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    themeOption: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    themeOptionText: {
        fontSize: 12,
        fontFamily: FontFamily.body.semiBold,
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
