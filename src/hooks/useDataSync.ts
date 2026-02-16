import { useEffect, useRef } from 'react';
import { syncWorkoutsFromSupabaseForUser } from '@/src/lib/workoutSyncService';
import { useAuth } from '@/src/context/AuthContext';

export function useDataSync() {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const syncedRef = useRef(false);

    useEffect(() => {
        if (!userId) {
            syncedRef.current = false;
            return;
        }

        if (!syncedRef.current) {
            syncWorkoutsFromSupabaseForUser(userId, 30)
                .catch(err => {
                    console.error('[useDataSync] Sync failed:', err);
                });

            syncedRef.current = true;
        }
    }, [userId]);
}
