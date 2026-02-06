import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmButtonColor?: string;
    cancelButtonColor?: string;
}

export function ConfirmationModal({
    visible,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onClose,
    confirmButtonColor = '#000000',
    cancelButtonColor = Colors.primary
}: ConfirmationModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>
                        {message}
                    </Text>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: cancelButtonColor }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: cancelButtonColor === Colors.primary ? '#000000' : '#FFFFFF' }]}>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: confirmButtonColor }]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: Spacing.xl,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#71717A',
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 24,
    },
    footer: {
        flexDirection: 'column',
        gap: Spacing.md,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
    }
});
