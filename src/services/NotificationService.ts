import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Define keys to avoid magic strings
export const WORKOUT_CHANNEL_ID = 'workout-active';
export const GENERAL_CHANNEL_ID = 'general-messages';

export class NotificationService {
    private static isInitialized = false;
    private static Notifications: any = null;

    static init() {
        if (this.isInitialized) return;

        if (Constants.appOwnership === 'expo') {
            // console.warn("Notifications disabled in Expo Go to prevent crash.");
            this.isInitialized = true;
            return;
        }

        try {
            this.Notifications = require('expo-notifications');

            this.Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                }),
            });
            this.isInitialized = true;
        } catch (e) {
            console.warn("Failed to init notifications", e);
            this.Notifications = null;
        }
    }

    static async requestPermissions() {
        this.init();
        if (!this.Notifications) return 'denied';

        if (Platform.OS === 'android') {
            try {
                await this.Notifications.setNotificationChannelAsync(WORKOUT_CHANNEL_ID, {
                    name: 'Workout Ativo',
                    importance: this.Notifications.AndroidImportance.LOW,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FDCB13',
                });

                await this.Notifications.setNotificationChannelAsync(GENERAL_CHANNEL_ID, {
                    name: 'Mensagens',
                    importance: this.Notifications.AndroidImportance.HIGH,
                    sound: 'default',
                });
            } catch (e) {
                // Ignore
            }
        }

        try {
            const { status } = await this.Notifications.requestPermissionsAsync();
            return status;
        } catch (e) {
            return 'denied';
        }
    }

    static async showWorkoutNotification(title: string, body: string, isPaused: boolean = false) {
        if (!this.Notifications) return;
        try {
            await this.Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: { type: 'workout_status' },
                    sticky: true,
                    autoDismiss: false,
                    color: '#FDCB13',
                    categoryIdentifier: isPaused ? 'resume_action' : 'pause_action',
                },
                trigger: null,
                identifier: 'workout-status-permanent'
            });
        } catch (e) {
            // Ignore
        }
    }

    static async dismissWorkoutNotification() {
        if (!this.Notifications) return;
        try {
            await this.Notifications.dismissNotificationAsync('workout-status-permanent');
        } catch (e) {
        }
    }

    static addNotificationResponseReceivedListener(callback: (response: any) => void) {
        this.init();
        if (!this.Notifications) return { remove: () => { } };

        try {
            return this.Notifications.addNotificationResponseReceivedListener(callback);
        } catch (e) {
            return { remove: () => { } };
        }
    }

    static get DefaultActionIdentifier() {
        this.init();
        if (!this.Notifications) return 'DEFAULT_ACTION_IDENTIFIER';

        try {
            return this.Notifications.DEFAULT_ACTION_IDENTIFIER;
        } catch (e) {
            return 'DEFAULT_ACTION_IDENTIFIER';
        }
    }
}
