/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScheduleItem } from '../types';
import { timeToMinutes } from './timeUtils';

// Color palette matching the web app
const PALETTES = {
  dark: {
    bg: '#090d16',
    cardBg: '#0f172a',
    headerBg: '#131d36',
    gridBorder: '#1e293b',
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    accent: '#6366f1',
    timeColBg: '#0b1120',
  },
  light: {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    headerBg: '#f1f5f9',
    gridBorder: '#e2e8f0',
    textMain: '#0f172a',
    textMuted: '#64748b',
    accent: '#4f46e5',
    timeColBg: '#f8fafc',
  },
};

const BLOCK_COLORS: Record<string, { bg: string; border: string; text: string; sub: string }> = {
  indigo: { bg: '#4f46e5', border: '#6366f1', text: '#ffffff', sub: '#c7d2fe' },
  violet: { bg: '#7c3aed', border: '#8b5cf6', text: '#ffffff', sub: '#ddd6fe' },
  emerald: { bg: '#059669', border: '#10b981', text: '#ffffff', sub: '#a7f3d0' },
  rose: { bg: '#e11d48', border: '#f43f5e', text: '#ffffff', sub: '#fecdd3' },
  cyan: { bg: '#0891b2', border: '#06b6d4', text: '#ffffff', sub: '#cffafe' },
  amber: { bg: '#d97706', border: '#f59e0b', text: '#ffffff', sub: '#fef3c7' },
  fuchsia: { bg: '#c026d3', border: '#d946ef', text: '#ffffff', sub: '#fae8ff' },
  blue: { bg: '#2563eb', border: '#3b82f6', text: '#ffffff', sub: '#bfdbfe' },
};

export async function generateWidgetImage(
  scheduleItems: ScheduleItem[],
  options: {
    darkMode?: boolean;
    startHour?: number;
    endHour?: number;
    showWeekend?: boolean;
    title?: string;
  } = {}
): Promise<string> {
  const isDark = options.darkMode ?? true;
  const startHour = options.startHour ?? 8;
  const endHour = options.endHour ?? 22;
  const showWeekend = options.showWeekend ?? false;
  const daysCount = showWeekend ? 7 : 5;
  const dayLabels = showWeekend
    ? ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
    : ['週一', '週二', '週三', '週四', '週五'];

  const theme = isDark ? PALETTES.dark : PALETTES.light;

  // Widget canvas dimensions (Retina 2x resolution, ideal 4:3 / iPhone widget ratio)
  const width = 1200;
  const height = 1500;
  const scale = 2;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Header Banner
  const headerHeight = 110;
  ctx.fillStyle = theme.headerBg;
  ctx.fillRect(0, 0, width, headerHeight);

  // Header border bottom
  ctx.strokeStyle = theme.gridBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, headerHeight);
  ctx.lineTo(width, headerHeight);
  ctx.stroke();

  // App Logo / Icon badge
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.roundRect(32, 26, 56, 56, 16);
  ctx.fill();

  // Draw small grid icon inside badge
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(44, 38, 12, 12);
  ctx.fillRect(60, 38, 12, 12);
  ctx.fillRect(44, 54, 12, 12);
  ctx.fillRect(60, 54, 12, 12);

  // Header Titles
  ctx.fillStyle = theme.textMain;
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif';
  ctx.fillText('時光方塊課表', 106, 54);

  ctx.fillStyle = theme.textMuted;
  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif';
  ctx.fillText('國立臺中科技大學 • 今日概覽專用排程', 106, 82);

  // Right pill: 8:00 - 22:00
  const pillText = `8:00 - 22:00 • ${daysCount}天一覽`;
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
  const pillWidth = ctx.measureText(pillText).width + 28;
  const pillX = width - pillWidth - 32;
  const pillY = 38;

  ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillWidth, 36, 18);
  ctx.fill();

  ctx.fillStyle = isDark ? '#38bdf8' : '#4f46e5';
  ctx.fillText(pillText, pillX + 14, pillY + 24);

  // Layout metrics
  const timeColWidth = 80;
  const gridTop = headerHeight;
  const dayHeaderHeight = 52;
  const gridBodyTop = gridTop + dayHeaderHeight;
  const gridBodyHeight = height - gridBodyTop - 20;
  const totalHours = endHour - startHour + 1; // 15
  const hourHeight = gridBodyHeight / totalHours;
  const colWidth = (width - timeColWidth - 32) / daysCount;

  // Day Headers row
  ctx.fillStyle = isDark ? '#0c1322' : '#f8fafc';
  ctx.fillRect(timeColWidth, gridTop, width - timeColWidth, dayHeaderHeight);

  // Day header bottom border
  ctx.strokeStyle = theme.gridBorder;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, gridBodyTop);
  ctx.lineTo(width, gridBodyTop);
  ctx.stroke();

  // Draw day titles
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif';
  for (let d = 0; d < daysCount; d++) {
    const colX = timeColWidth + d * colWidth;
    ctx.fillStyle = theme.textMain;
    ctx.textAlign = 'center';
    ctx.fillText(dayLabels[d], colX + colWidth / 2, gridTop + 34);

    // Vertical line after day header
    if (d < daysCount - 1) {
      ctx.strokeStyle = theme.gridBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(colX + colWidth, gridTop);
      ctx.lineTo(colX + colWidth, gridBodyTop);
      ctx.stroke();
    }
  }

  // Draw Time Column and Horizontal Grid Lines
  for (let h = startHour; h <= endHour; h++) {
    const idx = h - startHour;
    const y = gridBodyTop + idx * hourHeight;

    // Time cell background
    ctx.fillStyle = theme.timeColBg;
    ctx.fillRect(0, y, timeColWidth, hourHeight);

    // Time label
    ctx.fillStyle = theme.textMuted;
    ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${h}:00`, timeColWidth / 2, y + 18);

    // Horizontal grid line
    ctx.strokeStyle = theme.gridBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(timeColWidth, y);
    ctx.lineTo(width - 16, y);
    ctx.stroke();
  }

  // Vertical separator between Time col and Grid
  ctx.strokeStyle = theme.gridBorder;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(timeColWidth, gridTop);
  ctx.lineTo(timeColWidth, height - 20);
  ctx.stroke();

  // Vertical grid lines between days
  for (let d = 1; d < daysCount; d++) {
    const x = timeColWidth + d * colWidth;
    ctx.strokeStyle = theme.gridBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, gridBodyTop);
    ctx.lineTo(x, height - 20);
    ctx.stroke();
  }

  // Draw Schedule Blocks
  scheduleItems.forEach((item) => {
    // Check if within days
    const dayIdx = item.dayOfWeek - 1;
    if (dayIdx < 0 || dayIdx >= daysCount) return;

    const startM = timeToMinutes(item.startTime);
    const endM = timeToMinutes(item.endTime);
    const durationM = item.durationMinutes || (endM - startM);

    const startOffsetMinutes = startM - startHour * 60;
    if (startOffsetMinutes < 0) return;

    const blockTop = gridBodyTop + (startOffsetMinutes / 60) * hourHeight;
    const blockHeight = Math.max(30, (durationM / 60) * hourHeight);
    const blockLeft = timeColWidth + dayIdx * colWidth + 4;
    const blockWidth = colWidth - 8;

    const pal = BLOCK_COLORS[item.colorId] || BLOCK_COLORS.indigo;

    // Block shadow / background
    ctx.fillStyle = pal.bg;
    ctx.beginPath();
    ctx.roundRect(blockLeft, blockTop, blockWidth, blockHeight, 10);
    ctx.fill();

    // Block border
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Clip content to block
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(blockLeft, blockTop, blockWidth, blockHeight, 10);
    ctx.clip();

    ctx.textAlign = 'left';

    // Title
    ctx.fillStyle = pal.text;
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif';
    const textX = blockLeft + 10;
    let textY = blockTop + 22;

    // Truncate title if needed
    let displayTitle = item.title;
    if (ctx.measureText(displayTitle).width > blockWidth - 20) {
      while (displayTitle.length > 2 && ctx.measureText(displayTitle + '..').width > blockWidth - 20) {
        displayTitle = displayTitle.slice(0, -1);
      }
      displayTitle += '..';
    }
    ctx.fillText(displayTitle, textX, textY);

    // Location / Classroom
    if (item.location && blockHeight >= 44) {
      textY += 20;
      ctx.fillStyle = pal.sub;
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Noto Sans TC", monospace';
      ctx.fillText(`📍 ${item.location}`, textX, textY);
    }

    // Time
    if (blockHeight >= 70) {
      textY += 18;
      ctx.fillStyle = pal.sub;
      ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "SF Mono", monospace';
      ctx.fillText(`${item.startTime} - ${item.endTime}`, textX, textY);
    }

    ctx.restore();
  });

  return canvas.toDataURL('image/png');
}
