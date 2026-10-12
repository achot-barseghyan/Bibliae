import { beforeEach, describe, expect, it } from 'vitest';
import { getBook } from './bible';
import { PLAN_DAYS, PLAN_GROUPS, PLAN_LENGTH, parsePlanRef } from './readingPlan';
import {
  archiveReadingPlan,
  getAppData,
  getPlanProgress,
  resetAppData,
  restartReadingPlan,
  setPlanDayRead,
  setPlanRefRead,
  startReadingPlan
} from '../services/appDataStore';

describe('données du plan', () => {
  it('compte 365 jours de 3 à 6 références', () => {
    expect(PLAN_DAYS).toHaveLength(PLAN_LENGTH);
    for (const day of PLAN_DAYS) {
      expect(day.refs.length).toBeGreaterThanOrEqual(3);
      expect(day.refs.length).toBeLessThanOrEqual(6);
    }
  });

  it('découpe livre, chapitre et versets sur le dernier espace', () => {
    expect(parsePlanRef('1 Samuel 21.1-16')).toMatchObject({ book: '1 Samuel', chap: '21', vv: '1-16', bookId: '1s' });
    expect(parsePlanRef('Zacharie 13.1')).toMatchObject({ chap: '13', vv: '1', fromVerse: 1, toVerse: 1 });
    expect(parsePlanRef('Exode 12.21-51')).toMatchObject({ fromVerse: 21, toVerse: 51 });
  });

  it('rattache chaque référence à un chapitre existant de l’app', () => {
    for (const day of PLAN_DAYS) {
      for (const ref of day.refs) {
        const book = getBook(ref.bookId);
        expect(book, `${ref.book} ${ref.chap} (jour ${day.n})`).toBeDefined();
        expect(ref.chapter).toBeLessThanOrEqual(book!.chapters);
      }
    }
  });

  it('regroupe les jours par le livre de la première référence', () => {
    expect(PLAN_GROUPS.map((g) => `${g.book} ${g.first}-${g.last}`)).toEqual([
      'Genèse 1-48',
      'Exode 49-88',
      'Lévitique 89-113',
      'Nombres 114-147',
      'Deutéronome 148-179',
      'Josué 180-198',
      'Juges 199-219',
      'Ruth 220-222',
      '1 Samuel 223-249',
      '2 Samuel 250-271',
      '1 Rois 272-292',
      '2 Rois 293-316',
      '1 Chroniques 317-335',
      '2 Chroniques 336-365'
    ]);
  });
});

describe('progression du plan', () => {
  beforeEach(() => resetAppData());

  it('avance le jour courant au premier jour non entièrement lu', () => {
    startReadingPlan();
    setPlanDayRead(1, true);
    setPlanRefRead(2, 0, true, 'manual');
    const progress = getPlanProgress(getAppData());
    expect(progress.startedAt).not.toBeNull();
    expect(progress.currentDay).toBe(2);
  });

  it('pose et révoque l’achèvement', () => {
    for (let day = 1; day <= PLAN_LENGTH; day++) setPlanDayRead(day, true);
    expect(getPlanProgress(getAppData()).completedAt).not.toBeNull();
    setPlanRefRead(365, 0, false, 'manual');
    expect(getPlanProgress(getAppData()).completedAt).toBeNull();
  });

  it('recommencer garde l’historique ; archiver revient à la première visite', () => {
    for (let day = 1; day <= PLAN_LENGTH; day++) setPlanDayRead(day, true);
    restartReadingPlan();
    let progress = getPlanProgress(getAppData());
    expect(progress.history).toHaveLength(1);
    expect(progress.startedAt).not.toBeNull();
    expect(getAppData().planReads).toHaveLength(0);

    archiveReadingPlan();
    progress = getPlanProgress(getAppData());
    expect(progress.startedAt).toBeNull();
    expect(progress.currentDay).toBe(1);
  });
});
