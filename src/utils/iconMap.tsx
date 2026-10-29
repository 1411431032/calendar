/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
  Calculator,
  Code,
  Languages,
  Dumbbell,
  Briefcase,
  Music,
  Coffee,
  Sparkles,
  Heart,
  Laptop,
  CheckCircle2,
  GraduationCap,
  PenTool,
  Clock,
  Compass,
  Smile,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Calculator,
  Code,
  Languages,
  Dumbbell,
  Briefcase,
  Music,
  Coffee,
  Sparkles,
  Heart,
  Laptop,
  CheckCircle2,
  GraduationCap,
  PenTool,
  Clock,
  Compass,
  Smile,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

interface RenderIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<RenderIconProps> = ({ name, className = 'w-4 h-4', size }) => {
  const IconComponent = ICON_MAP[name] || BookOpen;
  return <IconComponent className={className} size={size} />;
};
