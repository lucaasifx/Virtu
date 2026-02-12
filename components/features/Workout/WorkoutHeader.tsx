import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontFamily } from '@/src/constants/theme';

export function WorkoutHeader() {
    return (
        <View style={styles.mainHeader}>
            <View>
                <Text style={styles.subHeaderTitle}>Suas Rotinas</Text>
                <Text style={styles.mainHeaderTitle}>
                    Meus <Text style={{ color: '#FDCB13' }}>Treinos.</Text>
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 32,
        marginTop: 10,
    },
    subHeaderTitle: {
        fontSize: 10,
        fontFamily: FontFamily.title.bold,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4,
    },
    mainHeaderTitle: {
        fontSize: 30,
        fontFamily: FontFamily.title.extraBold,
        color: '#111',
        letterSpacing: -1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#000',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
});
