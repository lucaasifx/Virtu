import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

export const registerNotificationCategories = async () => {
    await Notifications.setNotificationCategoryAsync('pause_action', [
        {
            identifier: 'PAUSE',
            buttonTitle: 'Pausar',
            options: {
                isDestructive: false,
                isAuthenticationRequired: false,
            },
        },
        {
            identifier: 'FINISH_SET',
            buttonTitle: 'Concluir Série',
            options: {
                isDestructive: false,
                isAuthenticationRequired: false,
            },
        }
    ]);

    await Notifications.setNotificationCategoryAsync('resume_action', [
        {
            identifier: 'RESUME',
            buttonTitle: 'Retomar',
            options: {
                isDestructive: false,
                isAuthenticationRequired: false,
            },
        },
        {
            identifier: 'FINISH_SET',
            buttonTitle: 'Concluir Série',
            options: {
                isDestructive: false,
                isAuthenticationRequired: false,
            },
        }
    ]);
};
