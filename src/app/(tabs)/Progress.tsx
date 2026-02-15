import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';
import { useGamification } from '@/src/context/GamificationContext';
import { ProgressDashboard } from '@/components/features/Progress/ProgressDashboard';
import { Colors } from '@/src/constants/theme';

export default function Progress() {
    const insets = useSafeAreaInsets();
    const { state, xpProgress, levelInfo } = useGamification();

    return (
        <View style={styles.container}>
            <Header
                stats={{
                    level: levelInfo.level,
                    streak: state.streak,
                    xp: xpProgress.current,
                    maxXp: xpProgress.max,
                }}
            />

            <FlatList
                data={[]}
                keyExtractor={(_, index) => `progress-${index}`}
                renderItem={() => null}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 140 }]}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<ProgressDashboard />}
                ListFooterComponent={<View style={styles.footerSpace} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        paddingHorizontal: 24,
    },
    footerSpace: {
        height: 140,
    },
});
