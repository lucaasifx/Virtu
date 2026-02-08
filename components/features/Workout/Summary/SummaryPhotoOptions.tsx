import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Ionicons } from '@expo/vector-icons';

interface SummaryPhotoOptionsProps {
    visible: boolean;
    onClose: () => void;
    onTakePhoto: () => void;
    onChooseFromLibrary: () => void;
    onRemovePhoto: () => void;
    hasPhoto: boolean;
}

export function SummaryPhotoOptions({
    visible,
    onClose,
    onTakePhoto,
    onChooseFromLibrary,
    onRemovePhoto,
    hasPhoto
}: SummaryPhotoOptionsProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

                <View style={styles.content}>
                    <Text style={styles.title}>Foto do Treino</Text>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.option} onPress={onTakePhoto}>
                            <View style={[styles.iconContainer, { backgroundColor: Colors.primary }]}>
                                <Ionicons name="camera" size={24} color="#000" />
                            </View>
                            <Text style={styles.optionText}>Tirar Nova Foto</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.option} onPress={onChooseFromLibrary}>
                            <View style={[styles.iconContainer, { backgroundColor: '#333' }]}>
                                <Ionicons name="images" size={24} color="#FFF" />
                            </View>
                            <Text style={styles.optionText}>Escolher da Galeria</Text>
                        </TouchableOpacity>

                        {hasPhoto && (
                            <TouchableOpacity style={styles.option} onPress={onRemovePhoto}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 59, 48, 0.2)' }]}>
                                    <Ionicons name="trash" size={24} color={Colors.error} />
                                </View>
                                <Text style={[styles.optionText, { color: Colors.error }]}>Remover Foto</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.lg,
        paddingBottom: Spacing.xl + 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    optionsContainer: {
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2E',
        padding: Spacing.md,
        borderRadius: 16,
        gap: Spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    cancelText: {
        color: Colors.gray[400],
        fontSize: 16,
        fontWeight: '600',
    }
});
