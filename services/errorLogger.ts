/**
 * Error Logger for AI Companion
 * Logs errors to errors.log for debugging
 */

export class ErrorLogger {
    private logPath = 'C:\\Users\\Destiny\\Desktop\\ai-architect-mmorpg\\copy-of-rsc-evolution-ai\\errors.log';
    private maxLogSize = 1024 * 1024; // 1MB max

    /**
     * Log an error with context
     */
    async logError(context: string, error: any, additionalInfo?: Record<string, any>) {
        const timestamp = new Date().toISOString();
        const errorMessage = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : '';

        const logEntry = {
            timestamp,
            context,
            error: errorMessage,
            stack,
            additionalInfo: additionalInfo || {},
        };

        const logLine = `\n[${timestamp}] ${context}\n` +
            `Error: ${errorMessage}\n` +
            (stack ? `Stack: ${stack}\n` : '') +
            (Object.keys(additionalInfo || {}).length > 0
                ? `Info: ${JSON.stringify(additionalInfo, null, 2)}\n`
                : '') +
            '---\n';

        try {
            // In browser environment, we can't write to filesystem directly
            // So we'll use localStorage as a workaround and provide download option
            this.appendToLog(logLine);
            console.error(`[ErrorLogger] ${context}:`, error, additionalInfo);
        } catch (loggingError) {
            console.error('[ErrorLogger] Failed to log error:', loggingError);
        }
    }

    /**
     * Append to log (localStorage-based for browser)
     */
    private appendToLog(logLine: string) {
        try {
            const currentLog = localStorage.getItem('gronk_error_log') || '';
            let newLog = currentLog + logLine;

            // Trim if too large
            if (newLog.length > this.maxLogSize) {
                newLog = newLog.slice(-this.maxLogSize);
            }

            localStorage.setItem('gronk_error_log', newLog);
        } catch (error) {
            console.error('[ErrorLogger] Failed to append to log:', error);
        }
    }

    /**
     * Get all logs
     */
    getLogs(): string {
        return localStorage.getItem('gronk_error_log') || 'No errors logged yet.';
    }

    /**
     * Download logs as file
     */
    downloadLogs() {
        const logs = this.getLogs();
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'errors.log';
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Clear logs
     */
    clearLogs() {
        localStorage.removeItem('gronk_error_log');
    }

    /**
     * Export logs for Antigravity debugging
     */
    exportForAntigravity(): string {
        const logs = this.getLogs();
        const exportData = {
            timestamp: new Date().toISOString(),
            environment: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
            },
            logs: logs.split('\n---\n').filter(Boolean).map(entry => {
                const lines = entry.split('\n');
                return {
                    raw: entry,
                    timestamp: lines[0]?.match(/\[(.*?)\]/)?.[1],
                    context: lines[0]?.split(']')[1]?.trim(),
                };
            }),
        };

        return JSON.stringify(exportData, null, 2);
    }
}

// Singleton instance
export const errorLogger = new ErrorLogger();
