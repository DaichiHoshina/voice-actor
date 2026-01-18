import type { Agency, Actor, Transition } from '@/types';
import agencies from '@/../data/agencies.json';
import actors from '@/../data/actors.json';
import transitions from '@/../data/transitions.json';

/**
 * 全事務所データを取得
 */
export async function getAgencies(): Promise<Agency[]> {
  return agencies as Agency[];
}

/**
 * 全声優データを取得
 */
export async function getActors(): Promise<Actor[]> {
  return actors as Actor[];
}

/**
 * 全所属変遷データを取得
 */
export async function getTransitions(): Promise<Transition[]> {
  return transitions as Transition[];
}

/**
 * IDから声優を取得
 */
export async function getActorById(id: string): Promise<Actor | null> {
  const allActors = await getActors();
  return allActors.find((actor) => actor.id === id) || null;
}

/**
 * IDから事務所を取得
 */
export async function getAgencyById(id: string): Promise<Agency | null> {
  const allAgencies = await getAgencies();
  return allAgencies.find((agency) => agency.id === id) || null;
}

/**
 * 特定声優の所属変遷を取得
 */
export async function getTransitionsByActor(actorId: string): Promise<Transition[]> {
  const allTransitions = await getTransitions();
  return allTransitions
    .filter((transition) => transition.actorId === actorId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/**
 * 特定事務所の所属変遷を取得
 */
export async function getTransitionsByAgency(agencyId: string): Promise<Transition[]> {
  const allTransitions = await getTransitions();
  return allTransitions
    .filter((transition) => transition.agencyId === agencyId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/**
 * 声優の現在の所属事務所を取得
 */
export async function getCurrentAgency(actorId: string): Promise<Agency | null> {
  const actorTransitions = await getTransitionsByActor(actorId);
  const current = actorTransitions.find((t) => !t.endDate);
  
  if (!current) return null;
  
  return getAgencyById(current.agencyId);
}
