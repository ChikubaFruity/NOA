import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// 日付フォーマット用のヘルパー関数
function formatDateTime(date: Date, timezone?: string): string {
    if (timezone) {
        return date.toLocaleString('ja-JP', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    // UTC時刻をYYYY-MM-DD HH:MM:SS形式で返す
    return date.toISOString().replace('T', ' ').substring(0, 19);
}

export const dateTimeTool = createTool({
    id: 'datetime-tool',
    description: '現在の日付と時刻を取得します。デフォルトは日本時間（JST）です。',
    inputSchema: z.object({
        timezone: z.string().optional().default('Asia/Tokyo').describe('タイムゾーン（デフォルト: Asia/Tokyo）。その他の例: America/New_York, Europe/London, UTC'),
        format: z.enum(['iso', 'locale', 'japanese']).optional().default('japanese').describe('出力フォーマット'),
        includeTimezone: z.boolean().optional().default(true).describe('タイムゾーン情報を含めるかどうか')
    }),

    execute: async ({ timezone = 'Asia/Tokyo', format = 'japanese', includeTimezone = true }) => {
        const now = new Date();

        let formattedDateTime: string;
        let timezoneDisplay: string;

        // タイムゾーンの表示名を設定
        const timezoneNames: Record<string, string> = {
            'Asia/Tokyo': 'JST',
            'UTC': 'UTC',
            'America/New_York': 'EST/EDT',
            'Europe/London': 'GMT/BST',
            'Asia/Seoul': 'KST',
            'Asia/Shanghai': 'CST'
        };

        timezoneDisplay = timezoneNames[timezone] || timezone;

        const tzDate = timezone === 'UTC' ? now : new Date(now.toLocaleString('en-US', { timeZone: timezone }));

        // フォーマットに応じて日時を整形
        switch (format) {
            case 'iso':
                formattedDateTime = tzDate.toISOString().replace('T', ' ').substring(0, 19);
                break;

            case 'locale':
                formattedDateTime = now.toLocaleString('en-US', {
                    timeZone: timezone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
                break;

            case 'japanese':
            default:
                formattedDateTime = formatDateTime(now, timezone);
                break;
        }

        const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

        const result = {
            datetime: formattedDateTime,
            timezone: timezoneDisplay,
            timestamp: now.getTime(),
            iso: now.toISOString(),
            year: tzDate.getFullYear(),
            month: tzDate.getMonth() + 1,
            day: tzDate.getDate(),
            hour: tzDate.getHours(),
            minute: tzDate.getMinutes(),
            second: tzDate.getSeconds(),
            dayOfWeek: tzDate.getDay(),
            dayOfWeekName: weekdays[tzDate.getDay()],
            formattedJapanese: `${tzDate.getFullYear()}年${tzDate.getMonth() + 1}月${tzDate.getDate()}日 ${weekdays[tzDate.getDay()]} ${String(tzDate.getHours()).padStart(2, '0')}:${String(tzDate.getMinutes()).padStart(2, '0')}:${String(tzDate.getSeconds()).padStart(2, '0')}`
        };

        return {
            success: true,
            data: result,
            message: `現在の日時: ${formattedDateTime}${includeTimezone ? ` (${timezoneDisplay})` : ''}`
        };
    }
});
