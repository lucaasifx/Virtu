import { useEffect, useRef } from 'react';
import { syncWorkoutsFromSupabase } from '@/src/lib/workoutSyncService';
import { useAuth } from '@/src/context/AuthContext';

export function useDataSync() {
    const { user } = useAuth();
    const syncedRef = useRef(false);

    useEffect(() => {
        if (!user) {
            syncedRef.current = false;
            return;
        }

        if (user && !syncedRef.current) {
            syncWorkoutsFromSupabase(30)
                .catch(err => {
                    console.error('[useDataSync] Sync failed:', err);
                });

            syncedRef.current = true;
        }
    }, [user]);
}
