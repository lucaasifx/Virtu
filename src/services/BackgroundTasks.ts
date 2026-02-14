import * as Notifications from 'expo-notifications';

export const registerNotificationCategories = async () => {
    await Notifications.setNotificationCategoryAsync('pause_action', [
        {
            identifier: 'PAUSE',
            buttonTitle: 'Pausar Timer',
            options: {
                isDestructive: false,
                isAuthenticationRequired: false,
            },
        }
    ]);

    await Notifications.setNotificationCategoryAsync('resume_action', [
        {
            identifier: 'RESUME',
            buttonTitle: 'Retomar Timer',
            options: {
                isDestructive: false,
                isAuthenticationRequired: false,
            },
        }
    ]);
};
