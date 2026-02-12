import React from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { Colors, Spacing } from '@/src/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertAction {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message?: string;
    type?: AlertType;
    actions?: AlertAction[];
    onDismiss?: () => void;
}

const alertConfig: Record<AlertType, { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = {
    error: { icon: 'alert-circle', color: '#EF4444' },
    success: { icon: 'check-circle', color: '#22C55E' },
    warning: { icon: 'alert', color: '#F59E0B' },
    info: { icon: 'information', color: Colors.primary },
};

export function CustomAlert({
    visible,
    title,
    message,
    type = 'info',
    actions = [{ text: 'OK' }],
    onDismiss,
}: CustomAlertProps) {
    const config = alertConfig[type];

    const handleAction = (action: AlertAction) => {
        action.onPress?.();
        onDismiss?.();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onDismiss}
        >
            <TouchableWithoutFeedback onPress={onDismiss}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    style={styles.overlay}
                >
                    <TouchableWithoutFeedback>
                        <Animated.View
                            entering={ZoomIn.duration(250).springify()}
                            exiting={ZoomOut.duration(150)}
                            style={styles.container}
                        >
                            {/* Icon */}
                            <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
                                <MaterialCommunityIcons
                                    name={config.icon}
                                    size={32}
                                    color={config.color}
                                />
                            </View>

                            {/* Title */}
                            <Text style={styles.title}>{title}</Text>

                            {/* Message */}
                            {message && <Text style={styles.message}>{message}</Text>}

                            {/* Actions */}
                            <View style={styles.actionsContainer}>
                                {actions.map((action, index) => {
                                    const isDestructive = action.style === 'destructive';
                                    const isCancel = action.style === 'cancel';

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.actionButton,
                                                isCancel && styles.actionButtonCancel,
                                                isDestructive && styles.actionButtonDestructive,
                                                !isCancel && !isDestructive && styles.actionButtonPrimary,
                                                { flex: 1 },
                                            ]}
                                            onPress={() => handleAction(action)}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.actionText,
                                                    isCancel && styles.actionTextCancel,
                                                    isDestructive && styles.actionTextDestructive,
                                                    !isCancel && !isDestructive && styles.actionTextPrimary,
                                                ]}
                                            >
                                                {action.text}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

// Hook for easier usage
interface AlertState {
    visible: boolean;
    title: string;
    message?: string;
    type: AlertType;
    actions: AlertAction[];
}

export function useCustomAlert() {
    const [state, setState] = React.useState<AlertState>({
        visible: false,
        title: '',
        message: undefined,
        type: 'info',
        actions: [],
    });

    const showAlert = React.useCallback((
        title: string,
        message?: string,
        type: AlertType = 'info',
        actions: AlertAction[] = [{ text: 'OK' }]
    ) => {
        setState({
            visible: true,
            title,
            message,
            type,
            actions,
        });
    }, []);

    const hideAlert = React.useCallback(() => {
        setState(prev => ({ ...prev, visible: false }));
    }, []);

    // Convenience methods
    const showError = React.useCallback((title: string, message?: string) => {
        showAlert(title, message, 'error');
    }, [showAlert]);

    const showSuccess = React.useCallback((title: string, message?: string) => {
        showAlert(title, message, 'success');
    }, [showAlert]);

    const showWarning = React.useCallback((title: string, message?: string) => {
        showAlert(title, message, 'warning');
    }, [showAlert]);

    const showInfo = React.useCallback((title: string, message?: string) => {
        showAlert(title, message, 'info');
    }, [showAlert]);

    const confirm = React.useCallback((
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void
    ) => {
        showAlert(title, message, 'warning', [
            { text: 'Cancelar', style: 'cancel', onPress: onCancel },
            { text: 'Confirmar', onPress: onConfirm },
        ]);
    }, [showAlert]);

    return {
        ...state,
        showAlert,
        hideAlert,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        confirm,
        onDismiss: hideAlert,
    };
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    container: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: Spacing.xl,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    message: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.lg,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        width: '100%',
        marginTop: Spacing.sm,
    },
    actionButton: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonPrimary: {
        backgroundColor: Colors.primary,
    },
    actionButtonCancel: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    actionButtonDestructive: {
        backgroundColor: '#EF4444',
    },
    actionText: {
        fontSize: 15,
        fontWeight: '600',
    },
    actionTextPrimary: {
        color: '#000',
    },
    actionTextCancel: {
        color: '#888',
    },
    actionTextDestructive: {
        color: '#fff',
    },
});
