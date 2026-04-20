// KI Automation Hub — Org Impact Dashboard
// Kaplan International

import * as React from 'react';
import { useContext, useMemo } from 'react';
import { LargeTitle, Text, Spinner } from '@fluentui/react-components';
import { Flash24Regular, People24Regular, ArrowTrending24Regular, Trophy24Regular } from '@fluentui/react-icons';
import { AppContext } from '../../common/contexts/AppContext';
import { DisplayCanvas } from '../../common/controls/DisplayCanvas/DisplayCanvas';
import { RootCanvas } from '../../common/controls/RootCanvas/RootCanvas';
import { useGetOrgImpact } from '../../hooks/useGetOrgImpact';
import { useImpactStyles } from './ImpactPage.styles';

const GHC_SCALE_FACTOR = 53.6;

const formatHours = (hours: number): string => {
  if (!hours || isNaN(hours)) return '0';
  if (hours >= 1000) return `${(hours / 1000).toFixed(1)}k`;
  return `${Math.round(hours)}`;
};

const StatCard: React.FC<{
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}> = ({ label, value, subtext, highlight = false, icon }) => {
  const styles = useImpactStyles();
  return (
    <div className={highlight ? styles.statCardHighlight : styles.statCard}>
      {icon && <div style={{ marginBottom: '4px', opacity: highlight ? 0.8 : 0.5 }}>{icon}</div>}
      <Text className={highlight ? styles.statLabelLight : styles.statLabel}>{label}</Text>
      <Text className={highlight ? styles.statValueLight : styles.statValue}>{value}</Text>
      {subtext && <Text className={highlight ? styles.statSubtextLight : styles.statSubtext}>{subtext}</Text>}
    </div>
  );
};

export const ImpactPage: React.FC = () => {
  const { appEnv } = useContext(AppContext);
  const styles = useImpactStyles();
  const { isLoading, data } = useGetOrgImpact(appEnv!);

  const ghcProjection = useMemo(() => {
    if (!data || !data.totalHoursSaved) return 0;
    return Math.round(data.totalHoursSaved * GHC_SCALE_FACTOR);
  }, [data]);

  const maxTrendValue = useMemo(() => {
    if (!data || !data.monthlyTrend || !data.monthlyTrend.length) return 1;
    const max = Math.max(...data.monthlyTrend.map((m: any) => m.hoursSaved || 0));
    return max > 0 ? max : 1;
  }, [data]);

  if (isLoading) {
    return (
      <RootCanvas>
        <div className={styles.loadingContainer}>
          <Spinner label="Loading impact data..." />
        </div>
      </RootCanvas>
    );
  }

  if (!data) {
    return (
      <RootCanvas>
        <div className={styles.loadingContainer}>
          <Text>No impact data available yet.</Text>
        </div>
      </RootCanvas>
    );
  }

  return (
    <RootCanvas>
      <DisplayCanvas>
        <div className={styles.root}>
          <div className={styles.pageHeader}>
            <LargeTitle className={styles.pageTitle}>KI Impact</LargeTitle>
            <Text className={styles.pageSubtitle}>
              Real-time automation savings across Kaplan International
            </Text>
          </div>

          <div className={styles.heroStats}>
            <StatCard
              label="Hours Saved This Month"
              value={formatHours(data.totalHoursSaved)}
              subtext="across all employees"
              highlight={true}
              icon={<Flash24Regular style={{ color: 'rgba(255,255,255,0.8)', width: 20, height: 20 }} />}
            />
            <StatCard
              label="Total Automations Run"
              value={(data.totalRuns || 0).toLocaleString()}
              subtext="this month"
              icon={<ArrowTrending24Regular style={{ width: 20, height: 20 }} />}
            />
            <StatCard
              label="Active Users"
              value={String(data.activeUsers || 0)}
              subtext="using at least 1 automation"
              icon={<People24Regular style={{ width: 20, height: 20 }} />}
            />
            <StatCard
              label="Automations Installed"
              value={(data.totalAutomationsInstalled || 0).toLocaleString()}
              subtext="total across all users"
              icon={<Trophy24Regular style={{ width: 20, height: 20 }} />}
            />
          </div>

          {data.monthlyTrend && data.monthlyTrend.length > 0 && (
            <div className={styles.section}>
              <Text className={styles.sectionTitle}>Monthly Trend — Hours Saved</Text>
              <div className={styles.trendCard}>
                <div className={styles.barChart}>
                  {data.monthlyTrend.map((month: any, index: number) => {
                    const isCurrentMonth = index === data.monthlyTrend.length - 1;
                    const hours = month.hoursSaved || 0;
                    const heightPct = Math.max(4, (hours / maxTrendValue) * 100);
                    return (
                      <div key={`month-${index}`} className={styles.barWrapper}>
                        <Text className={styles.barValue}>{formatHours(hours)}h</Text>
                        <div
                          className={`${styles.bar} ${isCurrentMonth ? styles.barCurrent : ''}`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <Text className={styles.barLabel}>{month.month || ''}</Text>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {data.topAutomation && data.topAutomation.name && (
            <div className={styles.section}>
              <Text className={styles.sectionTitle}>Top Automation This Month</Text>
              <div className={styles.topAutomationCard}>
                <div className={styles.topAutomationIcon}>⚡</div>
                <div className={styles.topAutomationInfo}>
                  <Text className={styles.topAutomationName}>{data.topAutomation.name}</Text>
                  <Text className={styles.topAutomationStats}>
                    {(data.topAutomation.runs || 0).toLocaleString()} runs · {formatHours(data.topAutomation.hoursSaved)} hours saved
                  </Text>
                </div>
              </div>
            </div>
          )}

          <div className={styles.projectionBanner}>
            <div className={styles.projectionText}>
              <Text className={styles.projectionTitle}>
                GHC-Wide Potential
              </Text>
              <Text className={styles.projectionSubtitle}>
                If KI Automation Hub scaled across all Graham Holdings companies (~21,000 employees), estimated monthly impact would be:
              </Text>
            </div>
            <div className={styles.projectionStat}>
              <Text className={styles.projectionValue}>{formatHours(ghcProjection)}h</Text>
              <Text className={styles.projectionLabel}>hours saved / month</Text>
            </div>
          </div>

          <Text className={styles.disclaimer}>
            * Data based on last 30 days with a 15 minute delay. GHC projection based on proportional scaling from Kaplan usage.
          </Text>
        </div>
      </DisplayCanvas>
    </RootCanvas>
  );
};

export default ImpactPage;
