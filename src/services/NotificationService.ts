import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { registerNotificationCategories } from './BackgroundTasks';

// Define keys to avoid magic strings
export const WORKOUT_CHANNEL_ID = 'workout-active';
export const GENERAL_CHANNEL_ID = 'general-messages';

export class NotificationService {
    private static isInitialized = false;
    private static workoutNotificationId: string | null = null;
    private static Notifications: typeof Notifications | null = null;
    private static lastWorkoutPayload: { title: string; subtitle: string; body: string; isPaused: boolean } | null = null;
    private static readonly WORKOUT_NOTIFICATION_TYPE = 'workout_status';

    static init() {
        if (this.isInitialized) return;

        if (Constants.appOwnership === 'expo') {
            // console.warn("Notifications disabled in Expo Go to prevent crash.");
            this.isInitialized = true;
            return;
        }

        try {
            this.Notifications = Notifications;

            this.Notifications.setNotificationHandler({
                handleNotification: async (notification: { request?: { content?: { data?: { type?: string } } } }) => {
                    const isWorkout = notification.request?.content?.data?.type === 'workout_status';
                    return {
                        shouldShowBanner: !isWorkout,
                        shouldShowList: true,
                        shouldPlaySound: false,
                        shouldSetBadge: false,
                    };
                },
            });
            this.isInitialized = true;
        } catch {
            console.warn("Failed to init notifications");
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
                    vibrationPattern: [0],
                    lightColor: '#000000',
                    sound: null,
                });

                await this.Notifications.setNotificationChannelAsync(GENERAL_CHANNEL_ID, {
                    name: 'Mensagens',
                    importance: this.Notifications.AndroidImportance.HIGH,
                    sound: 'default',
                });
            } catch {
            }
        }

        try {
            await registerNotificationCategories();
            const { status } = await this.Notifications.requestPermissionsAsync();
            return status;
        } catch {
            return 'denied';
        }
    }

    static async showWorkoutNotification(title: string, subtitle: string, body: string, isPaused: boolean = false) {
        if (!this.Notifications) return;
        if (
            this.lastWorkoutPayload &&
            this.lastWorkoutPayload.title === title &&
            this.lastWorkoutPayload.subtitle === subtitle &&
            this.lastWorkoutPayload.body === body &&
            this.lastWorkoutPayload.isPaused === isPaused
        ) {
            return;
        }

        try {
            await this.dismissPresentedWorkoutNotifications();
            if (this.workoutNotificationId) {
                await this.Notifications.dismissNotificationAsync(this.workoutNotificationId);
            }
            const identifier = await this.Notifications.scheduleNotificationAsync({
                content: {
                    title: title,
                    subtitle,
                    body,
                    data: { type: this.WORKOUT_NOTIFICATION_TYPE },
                    sticky: true,
                    autoDismiss: false,
                    color: '#000000',
                    categoryIdentifier: isPaused ? 'resume_action' : 'pause_action',
                    priority: this.Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null,
            });
            this.workoutNotificationId = identifier;
            this.lastWorkoutPayload = { title, subtitle, body, isPaused };
        } catch {
        }
    }

    static async dismissWorkoutNotification() {
        if (!this.Notifications) return;
        try {
            await this.dismissPresentedWorkoutNotifications();
            if (this.workoutNotificationId) {
                await this.Notifications.dismissNotificationAsync(this.workoutNotificationId);
                this.workoutNotificationId = null;
            }
            this.lastWorkoutPayload = null;
        } catch {
        }
    }

    private static async dismissPresentedWorkoutNotifications() {
        if (!this.Notifications) return;

        try {
            const presented = await this.Notifications.getPresentedNotificationsAsync();

            await Promise.all(
                presented
                    .filter((notification) => {
                        const type = notification.request.content.data?.type;
                        return type === this.WORKOUT_NOTIFICATION_TYPE;
                    })
                    .map((notification) => this.Notifications?.dismissNotificationAsync(notification.request.identifier))
            );
        } catch {
        }
    }

    static addNotificationResponseReceivedListener(callback: (response: Notifications.NotificationResponse) => void) {
        this.init();
        if (!this.Notifications) return { remove: () => { } };

        try {
            return this.Notifications.addNotificationResponseReceivedListener(callback);
        } catch {
            return { remove: () => { } };
        }
    }

    static get DefaultActionIdentifier() {
        this.init();
        if (!this.Notifications) return 'DEFAULT_ACTION_IDENTIFIER';

        try {
            return this.Notifications.DEFAULT_ACTION_IDENTIFIER;
        } catch {
            return 'DEFAULT_ACTION_IDENTIFIER';
        }
    }
}
