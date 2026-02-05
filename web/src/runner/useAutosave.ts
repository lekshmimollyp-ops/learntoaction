import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

export const useAutosave = (slug: string, answers: Record<string, any>) => {
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [responseId, setResponseId] = useState<string | null>(null);

    // Store latest values in ref to avoid closure staleness in timeout
    const currentDataRef = useRef({ answers, responseId });
    currentDataRef.current = { answers, responseId };

    useEffect(() => {
        // Skip initial mount or empty answers
        if (Object.keys(answers).length === 0) return;

        setStatus('saving');

        const timer = setTimeout(() => {
            const { answers, responseId } = currentDataRef.current;

            api.post('/responses', {
                slug,
                answers,
                responseId
            })
                // @ts-ignore
                .then((res: any) => {
                    setStatus('saved');
                    if (res.responseId) {
                        setResponseId(res.responseId);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setStatus('error');
                });
        }, 1500); // 1.5s debounce

        return () => clearTimeout(timer);
    }, [answers, slug]);

    return status;
};
