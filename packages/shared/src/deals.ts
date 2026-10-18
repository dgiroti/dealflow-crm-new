import { z } from 'zod';

// The six stages a deal moves through, in order.
// "as const" makes TypeScript treat these as exact values, not just "some strings".
export const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const;

// A Zod rule that only accepts one of those six values
export const dealStageSchema = z.enum(DEAL_STAGES);

// The TypeScript type: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type DealStage = z.infer<typeof dealStageSchema>;

// A deal is "closed" once it's won or lost: it no longer moves through the pipeline
export const isClosedStage = (stage: DealStage): boolean => stage === 'won' || stage === 'lost';
