import React from 'react';
import { ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';

export default function DiscrepancyBadge({ delta, unit = '' }) {
  if (delta === 0) {
    return (
      <span className="discrepancy-badge zero">
        <Check size={12} /> 0 {unit} (Balanced)
      </span>
    );
  }

  if (delta > 0) {
    return (
      <span className="discrepancy-badge positive">
        <ArrowUpRight size={13} /> +{delta} {unit}
      </span>
    );
  }

  return (
    <span className="discrepancy-badge negative">
      <ArrowDownRight size={13} /> {delta} {unit}
    </span>
  );
}
