// KI Automation Hub — Gamification / My Level Page
// Kaplan International

import * as React from 'react';
import { useContext, useMemo } from 'react';
import { LargeTitle, Text, Spinner } from '@fluentui/react-components';
import { AppContext } from '../../common/contexts/AppContext';
import { DisplayCanvas } from '../../common/controls/DisplayCanvas/DisplayCanvas';
import { RootCanvas } from '../../common/controls/RootCanvas/RootCanvas';
import { useGetUserCatalogItems } from '../../hooks/useGetUserCatalogItems';

const LEVELS = [
  { level: 1, name: 'Newcomer', minHours: 0, badge: '🌱' },
  { level: 2, name: 'Time Saver', minHours: 2, badge: '⏱️' },
  { level: 3, name: 'Automator', minHours: 5, badge: '⚡' },
  { level: 4, name: 'Power User', minHours: 10, badge: '🔥' },
  { level: 5, name: 'Champion', minHours: 20, badge: '🏆' },
  { level: 6, name: 'Legend', minHours: 50, badge: '🌟' },
];

const BADGES = [
  { id: 'first_automation', name: 'First Step', description: 'Installed your first automation', icon: '🚀', condition: (automations: number) => automations >= 1 },
  { id: 'five_automations', name: 'Collector', description: 'Installed 5 automations', icon: '📦', condition: (automations: number) => automations >= 5 },
  { id: 'ten_automations', name: 'Power Stacker', description: 'Installed 10 automations', icon: '💪', condition: (automations: number) => automations >= 10 },
  { id: 'one_hour', name: 'Hour Saved', description: 'Saved your first hour', icon: '⏰', condition: (_: number, hours: number) => hours >= 1 },
  { id: 'ten_hours', name: 'Time Master', description: 'Saved 10+ hours', icon: '⌛', condition: (_: number, hours: number) => hours >= 10 },
  { id: 'fifty_hours', name: 'Efficiency Expert', description: 'Saved 50+ hours', icon: '🎯', condition: (_: number, hours: number) => hours >= 50 },
];

const calculateTimeSavings = (item: any): number => {
  const { mspcat_CatalogItem, flowRuns, noOfDaysWithAtleastOneSuccessfulRun, noOfWeeksWithAtleastOneSuccessfulRun } = item;
  const timeSavingTypeValue = mspcat_CatalogItem?.timeSavingType;
  const timeSavingsValue = parseFloat(mspcat_CatalogItem?.timeSavingValue || '0');
  switch (Number(timeSavingTypeValue)) {
    case 919440000: return timeSavingsValue * (flowRuns || 0);
    case 919440001: return timeSavingsValue * (noOfDaysWithAtleastOneSuccessfulRun || 0);
    case 919440002: return timeSavingsValue * (noOfWeeksWithAtleastOneSuccessfulRun || 0);
    default: return 0;
  }
};

const GamificationPage: React.FC = () => {
  const { appEnv } = useContext(AppContext);
  const { isLoading, data: userCatalogItemsData } = useGetUserCatalogItems(appEnv!);

  const { totalHours, totalAutomations } = useMemo(() => {
    if (!userCatalogItemsData) return { totalHours: 0, totalAutomations: 0 };
    const totalMinutes = userCatalogItemsData.reduce((sum: number, item: any) => sum + calculateTimeSavings(item), 0);
    const validItems = userCatalogItemsData.filter((item: any) => item.solutionId);
    return { totalHours: totalMinutes / 60, totalAutomations: validItems.length };
  }, [userCatalogItemsData]);

  const currentLevel = useMemo(() => {
    const level = [...LEVELS].reverse().find(l => totalHours >= l.minHours);
    return level || LEVELS[0];
  }, [totalHours]);

  const nextLevel = useMemo(() => {
    const idx = LEVELS.findIndex(l => l.level === currentLevel.level);
    return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  }, [currentLevel]);

  const xpProgress = useMemo(() => {
    if (!nextLevel) return 100;
    const range = nextLevel.minHours - currentLevel.minHours;
    const progress = totalHours - currentLevel.minHours;
    return Math.min(100, Math.round((progress / range) * 100));
  }, [totalHours, currentLevel, nextLevel]);

  const unlockedBadges = useMemo(() => {
  return BADGES.filter(b => b.condition(totalAutomations, totalHours));
}, [totalAutomations, totalHours]);

  if (isLoading) {
    return (
      <RootCanvas>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner label="Loading your level..." />
        </div>
      </RootCanvas>
    );
  }

  return (
    <RootCanvas>
      <DisplayCanvas>
        <div style={{ padding: '32px', maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          <div>
            <LargeTitle style={{ color: '#003087' }}>My Level</LargeTitle>
            <Text size={400} style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: '8px' }}>
              Every automation you install earns you XP. Keep automating to level up.
            </Text>
          </div>

          {/* Level card */}
          <div style={{ backgroundColor: '#003087', borderRadius: '12px', padding: '32px', color: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '48px' }}>{currentLevel.badge}</span>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', display: 'block' }}>LEVEL {currentLevel.level}</Text>
                <Text style={{ color: 'white', fontSize: '28px', fontWeight: 700, display: 'block' }}>{currentLevel.name}</Text>
              </div>
            </div>

            {/* XP Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                  {totalHours.toFixed(1)}h saved
                </Text>
                {nextLevel && (
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                    {nextLevel.minHours}h to reach {nextLevel.name}
                  </Text>
                )}
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '99px', height: '12px', overflow: 'hidden' }}>
                <div style={{
                  backgroundColor: '#FFB800',
                  height: '100%',
                  width: `${xpProgress}%`,
                  borderRadius: '99px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              {nextLevel && (
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                  {xpProgress}% to {nextLevel.badge} {nextLevel.name}
                </Text>
              )}
              {!nextLevel && (
                <Text style={{ color: '#FFB800', fontSize: '13px' }}>🌟 Maximum level reached!</Text>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--color-background-secondary)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <Text style={{ fontSize: '36px', fontWeight: 700, color: '#003087', display: 'block' }}>{totalAutomations}</Text>
              <Text style={{ color: 'var(--color-text-secondary)' }}>Automations installed</Text>
            </div>
            <div style={{ backgroundColor: 'var(--color-background-secondary)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <Text style={{ fontSize: '36px', fontWeight: 700, color: '#003087', display: 'block' }}>{totalHours.toFixed(1)}h</Text>
              <Text style={{ color: 'var(--color-text-secondary)' }}>Hours saved</Text>
            </div>
          </div>

          {/* Badges */}
          <div>
            <Text weight="semibold" size={500} style={{ display: 'block', marginBottom: '16px' }}>My badges</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {BADGES.map(badge => {
                const unlocked = badge.condition(totalAutomations, totalHours);
                return (
                  <div key={badge.id} style={{
                    backgroundColor: unlocked ? 'var(--color-background-secondary)' : 'var(--color-background-tertiary)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    opacity: unlocked ? 1 : 0.4,
                    border: unlocked ? '1px solid #003087' : '1px solid var(--color-border-tertiary)'
                  }}>
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>{badge.icon}</span>
                    <Text weight="semibold" style={{ display: 'block', fontSize: '13px' }}>{badge.name}</Text>
                    <Text style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{badge.description}</Text>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All levels */}
          <div>
            <Text weight="semibold" size={500} style={{ display: 'block', marginBottom: '16px' }}>All levels</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {LEVELS.map(level => (
                <div key={level.level} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: currentLevel.level === level.level ? '#003087' : 'var(--color-background-secondary)',
                  opacity: totalHours >= level.minHours ? 1 : 0.4
                }}>
                  <span style={{ fontSize: '24px' }}>{level.badge}</span>
                  <div style={{ flex: 1 }}>
                    <Text weight="semibold" style={{ color: currentLevel.level === level.level ? 'white' : 'var(--color-text-primary)', display: 'block' }}>
                      Level {level.level} — {level.name}
                    </Text>
                    <Text style={{ color: currentLevel.level === level.level ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)', fontSize: '13px' }}>
                      {level.minHours}+ hours saved
                    </Text>
                  </div>
                  {currentLevel.level === level.level && (
                    <Text style={{ color: '#FFB800', fontSize: '13px', fontWeight: 600 }}>CURRENT</Text>
                  )}
                  {totalHours >= level.minHours && currentLevel.level !== level.level && (
                    <Text style={{ color: '#003087', fontSize: '13px' }}>✓</Text>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </DisplayCanvas>
    </RootCanvas>
  );
};

export default GamificationPage;
