// KI Automation Hub — Impact Dashboard Hook
// Kaplan International

import { useQuery } from 'react-query';
import { useAuth } from './useAuthenticatedClient';
import config from '../config';

export interface OrgImpactData {
  totalHoursSaved: number;
  totalRuns: number;
  activeUsers: number;
  totalAutomationsInstalled: number;
  topAutomation: {
    name: string;
    runs: number;
    hoursSaved: number;
  };
  monthlyTrend: {
    month: string;
    hoursSaved: number;
    runs: number;
  }[];
  categoryBreakdown: {
    category: string;
    hoursSaved: number;
    runs: number;
  }[];
}

export const useGetOrgImpact = (appEnv: string) => {
  const [httpClient] = useAuth(config.apiEndpoint!, config.defaultTokenScope!);
  return useQuery(
    ['org-impact-data', 'get'],
    async () => {
      const response = await httpClient.get(`/api/CatalogItems/GetOrgImpact?env=${appEnv ?? 'prod'}`);
      const impactData: OrgImpactData = response?.data;
      return impactData;
    },
    { refetchOnWindowFocus: false, retry: false, staleTime: 1000 * 60 * 15 },
  );
};
