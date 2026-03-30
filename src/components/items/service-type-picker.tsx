'use client';

import { CategoryIcon } from '@/components/ui/category-icon';
import type { ServiceType } from '@/types';
import { SERVICE_TYPE_LABELS, SERVICE_TYPE_ICONS } from '@/types';

interface ServiceTypePickerProps {
  serviceTypes: ServiceType[];
  selectedType: ServiceType | null;
  onSelect: (type: ServiceType) => void;
}

export function ServiceTypePicker({
  serviceTypes,
  selectedType,
  onSelect,
}: ServiceTypePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {serviceTypes.map((type) => {
        const isSelected = selectedType === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-4 py-5 min-h-[44px] text-center transition-colors ${
              isSelected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-foreground hover:bg-muted/30'
            }`}
          >
            <CategoryIcon icon={SERVICE_TYPE_ICONS[type]} size={24} />
            <span className={`text-[13px] ${isSelected ? 'font-semibold' : 'font-medium'}`}>
              {SERVICE_TYPE_LABELS[type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
