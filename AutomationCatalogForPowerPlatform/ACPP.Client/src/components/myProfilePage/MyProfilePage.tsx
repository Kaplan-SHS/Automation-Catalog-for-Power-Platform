// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Modified by Kaplan International — KI Automation Hub

import * as React from 'react';
import { useContext, useMemo } from 'react';
import { LargeTitle, Link, mergeClasses, Table, TableBody, TableCell, TableCellLayout, TableHeader, TableHeaderCell, TableRow, Text } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { useCommonStyles } from '../../common.styles';
import { AppContext } from '../../common/contexts/AppContext';
import { DisplayCanvas } from '../../common/controls/DisplayCanvas/DisplayCanvas';
import { RootCanvas } from '../../common/controls/RootCanvas/RootCanvas';
import { screenSizes } from '../../common/helpers/Constants';
import { useGetUserCatalogItems } from '../../hooks/useGetUserCatalogItems';
import { useScreenSize } from '../../hooks/useScreenSize';
import { CenteredSpinner } from '../centeredSpinner/centeredSpinner';
import { useStyles } from './MyProfilePage.styles';

const LEVELS = [
  { level: 1, name: 'Newcomer', minHours: 0, badge: '🌱' },
  { level: 2, name: 'Time Saver', minHours: 2, badge: '⏱️' },
  { level: 3, name: 'Automator', minHours: 5, badge: '⚡' },
  { level: 4, name: 'Power User', minHours: 10, badge: '🔥' },
  { level: 5, name: 'Champion', minHours: 20, badge: '🏆' },
  { level: 6, name: 'Legend', minHours: 50, badge: '🌟' },
];

const BADGES = [
  { id: 'first_automation', name: 'First Step', description: 'Installed your first automation', icon: '🚀', condition: (a: number, _h: number) => a >= 1 },
  { id: 'five_automations', name: 'Collector', description: 'Installed 5 automations', icon: '📦', condition: (a: number, _h: number) => a >= 5 },
  { id: 'ten_automations', name: 'Power Stacker', description: 'Installed 10 automations', icon: '💪', condition: (a: number, _h: number) => a >= 10 },
  { id: 'one_hour', name: 'Hour Saved', description: 'Saved your first hour', icon: '⏰', condition: (_a: number, h: number) => h >= 1 },
  { id: 'ten_hours', name: 'Time Master', description: 'Saved 10+ hours', icon: '⌛', condition: (_a: number, h: number) => h >= 10 },
  { id: 'fifty_hours', name: 'Efficiency Expert', description: 'Saved 50+ hours', icon: '🎯', condition: (_a: number, h: number) => h >= 50 },
];

const calculateTimeSavings = (item: any) => {
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

const formatTimeSavings = (timeSavings: number) => {
  return (timeSavings < 600 && timeSavings > 0)
    ? `${(timeSavings / 60).toFixed(1)}`
    : `${(timeSavings / 60).toFixed(0)}`;
};

const calculateTotalTimeSavings = (userCatalogItemsData: any[]) => {
  const totalMinutes = userCatalogItemsData?.reduce((sum, item) => sum + calculateTimeSavings(item), 0) || 0;
  const hours = Math.floor(totalMinutes / 60);
  return { display: hours < 10 ? `${(totalMinutes / 60).toFixed(1)}` : `${hours}`, totalHours: totalMinutes / 60 };
};

const TableRowComponent = ({ item, styles, width, t }: any) => {
  const { mspcat_CatalogItem, installedOn, flowUrl } = item;
  const solutionName = mspcat_CatalogItem?.solutionName;
  const timeSavingTypeValue = mspcat_CatalogItem?.timeSavingType;
  const timeSavingsValue = parseFloat(mspcat_CatalogItem?.timeSavingValue || 0);
  const installedDate = new Date(installedOn);
  const installedOnFormatted = installedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeSavings = calculateTimeSavings(item);
  const formattedTimeSavings = formatTimeSavings(timeSavings);
  const timeSavingType = ['run', 'day', 'week'][Number(timeSavingTypeValue) - 919440000] || '';
  const timeSavingsRate = timeSavingsValue === 0 ? 'NA' : `${timeSavingsValue} ${t('min')} ${timeSavingType}`;

  return width > screenSizes.md ? (
    <TableRow aria-label={`Row for solution ${solutionName}`}>
      {[
        { content: solutionName, ariaLabel: 'Solution Name' },
        { content: installedOnFormatted, ariaLabel: 'Installed On' },
        { content: formattedTimeSavings, ariaLabel: 'Time Savings' },
        { content: timeSavingsRate, ariaLabel: 'Time Savings Rate' },
        { content: <div className={styles.linkColor}><Link href={flowUrl} target="_blank" rel="noopener noreferrer">Manage</Link></div>, ariaLabel: 'Manage Link' },
      ].map((cell, index) => (
        <TableCell key={index} aria-label={cell.ariaLabel}>
          <TableCellLayout><div>{cell.content}</div></TableCellLayout>
        </TableCell>
      ))}
    </TableRow>
  ) : (
    <div className={styles.listContainer}>
      <TableRow>
        <div className={styles.listRow}>
          <div className={styles.listRowHeader}>
            <Text className={styles.listSolutionName}>{solutionName}</Text>
            <Text className={styles.listTimeSavings}>{t('saved')} {formattedTimeSavings} {t('rate')} {timeSavingsRate}</Text>
          </div>
          <Link href={flowUrl} target="_blank" rel="noopener noreferrer">Manage</Link>
        </div>
      </TableRow>
    </div>
  );
};

export const MyProfilePage: React.FC = () => {
  const { appEnv } = useContext(AppContext);
  const styles = useStyles();
  const commonStyles = useCommonStyles();
  const { t } = useTranslation(['MyProfilePage', 'Common']);
  const { isLoading, data: userCatalogItemsData } = useGetUserCatalogItems(appEnv!);
  const { width } = useScreenSize();

  const tableRows = useMemo(() => {
    if (!userCatalogItemsData) return null;
    return userCatalogItemsData
      ?.filter((item: any) => item.solutionId)
      .sort((a: any, b: any) => new Date(b.installedOn).getTime() - new Date(a.installedOn).getTime())
      .map((item: any, index: number) => (
        <TableRowComponent key={item.solutionId || index} item={item} styles={styles} width={width} t={t} />
      ));
  }, [styles, t, userCatalogItemsData, width]);

  const { display: totalTimeSavings, totalHours } = useMemo(() =>
    calculateTotalTimeSavings(userCatalogItemsData || []),
    [userCatalogItemsData]
  );

  const totalAutomations = useMemo(() =>
    userCatalogItemsData?.filter((item: any) => item.solutionId).length || 0,
    [userCatalogItemsData]
  );

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

  return (
    <RootCanvas>
      <div className={styles.homeHeader}>
        <LargeTitle className={styles.headerText} aria-label={t('myProfile')}>{t('myProfile')}</LargeTitle>
      </div>
      <DisplayCanvas>
        <div className={styles.automationsData}>
          {isLoading ? (
            <CenteredSpinner classNames={commonStyles.padding5} aria-label="Loading spinner" />
          ) : (
            <>
              {/* Level card */}
              <div style={{ backgroundColor: '#003087', borderRadius: '12px', padding: '24px', color: 'white', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '40px' }}>{currentLevel.badge}</span>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block' }}>LEVEL {currentLevel.level}</Text>
                    <Text style={{ color: 'white', fontSize: '24px', fontWeight: 700, display: 'block' }}>{currentLevel.name}</Text>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block' }}>{totalAutomations} automations</Text>
                    <Text style={{ color: 'white', fontSize: '20px', fontWeight: 700, display: 'block' }}>{totalTimeSavings}h saved</Text>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{totalHours.toFixed(1)}h</Text>
                    {nextLevel && <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{nextLevel.minHours}h → {nextLevel.name}</Text>}
                    {!nextLevel && <Text style={{ color: '#FFB800', fontSize: '12px' }}>Max level!</Text>}
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#FFB800', height: '100%', width: `${xpProgress}%`, borderRadius: '99px' }} />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div style={{ marginBottom: '24px' }}>
                <Text weight="semibold" size={400} style={{ display: 'block', marginBottom: '12px' }}>My badges</Text>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                  {BADGES.map(badge => {
                    const unlocked = badge.condition(totalAutomations, totalHours);
                    return (
                      <div key={badge.id} style={{
                        backgroundColor: unlocked ? 'var(--color-background-secondary)' : 'var(--color-background-tertiary)',
                        borderRadius: '8px', padding: '12px', textAlign: 'center',
                        opacity: unlocked ? 1 : 0.35,
                        border: unlocked ? '1px solid #003087' : '1px solid var(--color-border-tertiary)'
                      }}>
                        <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>{badge.icon}</span>
                        <Text style={{ fontSize: '11px', fontWeight: 600, display: 'block' }}>{badge.name}</Text>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Automations table */}
              {userCatalogItemsData?.filter((item: any) => item.solutionId).length ? (
                <div className={styles.myProfileContainer}>
                  <div className={styles.stats}>
                    <div className={styles.statItem}>
                      <Text className={mergeClasses(styles.statHeader, styles.statHeaderMobile)}>{t('automations')}</Text>
                      <Text className={styles.statNumber}>{totalAutomations}</Text>
                    </div>
                    <div className={styles.statItem}>
                      <Text className={styles.statHeader}>{t('totalTimeSavings')}</Text>
                      <div className={styles.statNumberContainer}>
                        <Text className={styles.statNumber}>{totalTimeSavings}</Text>
                        <Text className={styles.statHours}>{width > screenSizes.md ? t('hours') : t('h')}</Text>
                      </div>
                    </div>
                  </div>
                  <Text className={styles.automationsText}>{t('installedAutomations')}</Text>
                  <Table aria-label="Automation details table" className={mergeClasses(styles.text, styles.table)}>
                    {width > screenSizes.md ? (
                      <>
                        <TableHeader className={styles.headerTableText}>
                          <TableRow>
                            <TableHeaderCell>{t('name')}</TableHeaderCell>
                            <TableHeaderCell>{t('installed')}</TableHeaderCell>
                            <TableHeaderCell>{t('timeSavings')}</TableHeaderCell>
                            <TableHeaderCell>{t('timeSavingsRate')}</TableHeaderCell>
                            <TableHeaderCell>{t('flowUrl')}</TableHeaderCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody>{tableRows}</TableBody>
                      </>
                    ) : (
                      <div className={styles.listContainer}>{tableRows}</div>
                    )}
                  </Table>
                  <Text className={styles.installationDataPeriod}>{t('installationDataPeriod')}</Text>
                </div>
              ) : (
                <Text className={styles.noDataText}>{t('noData')}</Text>
              )}
            </>
          )}
        </div>
      </DisplayCanvas>
    </RootCanvas>
  );
};
