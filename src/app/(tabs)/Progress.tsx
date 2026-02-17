import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Header } from '@/components/ui/Header';
import { useGamification } from '@/src/context/GamificationContext';
import { Colors } from '@/src/constants/theme';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function Progress() {
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
            <ComingSoon />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
});
