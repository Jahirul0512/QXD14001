
import React from 'react';
import { Recommendation } from '../types';
import { ChevronRightIcon } from './Icons';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  return (
    <details className="group border border-brand-border rounded-lg overflow-hidden mb-4 bg-brand-bg transition-all duration-300 open:bg-brand-surface">
      <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-brand-surface/50">
        <h4 className="font-semibold text-brand-primary text-lg">{recommendation.title}</h4>
        <ChevronRightIcon className="w-5 h-5 text-brand-text-secondary transition-transform duration-300 group-open:rotate-90" />
      </summary>
      <div className="p-4 border-t border-brand-border">
        <div className="mb-4">
          <h5 className="font-semibold text-brand-text-primary mb-2">Rationale (Why):</h5>
          <p className="text-brand-text-secondary text-sm leading-relaxed">{recommendation.rationale}</p>
        </div>
        <div>
          <h5 className="font-semibold text-brand-text-primary mb-2">Actionable Items:</h5>
          <ul className="space-y-2">
            {recommendation.actionItems.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-brand-primary mr-3 mt-1">&#x25B6;</span>
                <span className="text-brand-text-secondary text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
};
