import { View, StyleSheet } from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { Colors } from '@/src/constants/theme';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function Workout() {
    return (
        <ComingSoon />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
});
