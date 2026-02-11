import { useEffect, useRef } from 'react';
import { syncWorkoutsFromSupabase } from '@/src/lib/workoutSyncService';
import { useAuth } from '@/src/context/AuthContext';

export function useDataSync() {
    const { user } = useAuth();
    const syncedRef = useRef(false);

    useEffect(() => {
        if (user && !syncedRef.current) {
            console.log('[useDataSync] Triggering initial data sync (last 30 days)...');
            syncWorkoutsFromSupabase(30)
                .then(() => {
                    console.log('[useDataSync] Initial sync completed.');
                })
                .catch(err => {
                    console.error('[useDataSync] Sync failed:', err);
                });

            syncedRef.current = true;
        }
    }, [user]);
}
