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

        // フォーマットに応じて日時を整形
        switch (format) {
            case 'iso':
                if (timezone === 'UTC') {
                    formattedDateTime = now.toISOString().replace('T', ' ').substring(0, 19);
                } else {
                    // 指定タイムゾーンでのISO風フォーマット
                    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
                    formattedDateTime = tzDate.toISOString().replace('T', ' ').substring(0, 19);
                }
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

        // 日本時間での詳細情報を取得
        const jstDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

        const result = {
            datetime: formattedDateTime,
            timezone: timezoneDisplay,
            timestamp: now.getTime(),
            iso: now.toISOString(),
            year: jstDate.getFullYear(),
            month: jstDate.getMonth() + 1,
            day: jstDate.getDate(),
            hour: jstDate.getHours(),
            minute: jstDate.getMinutes(),
            second: jstDate.getSeconds(),
            dayOfWeek: jstDate.getDay(),
            dayOfWeekName: weekdays[jstDate.getDay()],
            formattedJapanese: `${jstDate.getFullYear()}年${jstDate.getMonth() + 1}月${jstDate.getDate()}日 ${weekdays[jstDate.getDay()]} ${String(jstDate.getHours()).padStart(2, '0')}:${String(jstDate.getMinutes()).padStart(2, '0')}:${String(jstDate.getSeconds()).padStart(2, '0')}`
        };

        return {
            success: true,
            data: result,
            message: `現在の日時: ${formattedDateTime}${includeTimezone ? ` (${timezoneDisplay})` : ''}`
        };
    }
});