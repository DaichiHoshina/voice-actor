import type { Agency } from '@/types';

/**
 * 声優事務所の系統分類
 */
export type LineageType =
  | 'haikyo-arts'      // 俳協 → アーツビジョン系
  | 'haikyo-osawa'     // 俳協 → 大沢事務所系
  | 'haikyo-sigma'     // 俳協 → シグマ・セブン系
  | 'aoni'             // 青二プロダクション系
  | 'ken'              // 賢プロダクション系
  | 'independent';     // 独立系

/**
 * D3.js階層データ用ノード型
 */
export interface LineageNode extends Agency {
  children?: LineageNode[];
  lineageType: LineageType;
}

/**
 * 系統ごとの配色定義
 */
const LINEAGE_COLORS: Record<LineageType, { fill: string; stroke: string }> = {
  'haikyo-arts': { fill: '#e3f2fd', stroke: '#1976d2' },
  'haikyo-osawa': { fill: '#f3e5f5', stroke: '#7b1fa2' },
  'haikyo-sigma': { fill: '#e8f5e9', stroke: '#388e3c' },
  'aoni': { fill: '#fff3e0', stroke: '#f57c00' },
  'ken': { fill: '#fce4ec', stroke: '#c2185b' },
  'independent': { fill: '#f5f5f5', stroke: '#616161' },
};

/**
 * 事務所の系統を分類する
 * 祖先を辿って、どの系統に属するかを判定
 */
export function classifyLineage(
  agency: Agency,
  agencies: Agency[]
): LineageType {
  const agencyMap = new Map(agencies.map((a) => [a.id, a]));
  
  // 祖先を辿る（ルートまで遡る）
  const ancestors: string[] = [];
  let current: Agency | undefined = agency;
  
  while (current && current.parentAgency) {
    ancestors.push(current.parentAgency);
    current = agencyMap.get(current.parentAgency);
  }
  
  // ルートノードを確認
  const root = ancestors.length > 0 ? ancestors[ancestors.length - 1] : agency.id;
  
  // 俳協系の細分化
  if (root === 'haikyo' || ancestors.includes('haikyo')) {
    // 直接の親または祖先にarts-visionがあれば
    if (
      agency.parentAgency === 'arts-vision' ||
      ancestors.includes('arts-vision')
    ) {
      return 'haikyo-arts';
    }
    
    // 大沢事務所系
    if (
      agency.parentAgency === 'office-osawa' ||
      ancestors.includes('office-osawa')
    ) {
      return 'haikyo-osawa';
    }
    
    // シグマ・セブン系
    if (
      agency.parentAgency === 'sigma-seven' ||
      ancestors.includes('sigma-seven')
    ) {
      return 'haikyo-sigma';
    }
  }
  
  // 青二プロダクション系
  if (root === 'aoni-production' || ancestors.includes('aoni-production')) {
    return 'aoni';
  }
  
  // 賢プロダクション系
  if (root === 'ken-production' || ancestors.includes('ken-production')) {
    return 'ken';
  }
  
  // それ以外は独立系
  return 'independent';
}

/**
 * 系統の配色を取得
 */
export function getLineageColor(lineage: LineageType): {
  fill: string;
  stroke: string;
} {
  return LINEAGE_COLORS[lineage];
}

/**
 * Agency配列からD3.js階層データを構築
 * 
 * @param agencies - 全事務所データ
 * @returns ルートノードの配列（森構造）
 */
export function buildLineageTree(agencies: Agency[]): LineageNode[] {
  // 高速検索用のMap
  const agencyMap = new Map(agencies.map((a) => [a.id, a]));
  const nodeMap = new Map<string, LineageNode>();
  
  // 全agencyをLineageNodeに変換（系統分類も実施）
  agencies.forEach((agency) => {
    const lineageType = classifyLineage(agency, agencies);
    nodeMap.set(agency.id, {
      ...agency,
      lineageType,
      children: [],
    });
  });
  
  // ルートノード（parentAgencyがnullまたはundefined）を収集
  const rootNodes: LineageNode[] = [];
  
  // 親子関係を構築
  agencies.forEach((agency) => {
    const node = nodeMap.get(agency.id);
    if (!node) return;
    
    if (!agency.parentAgency) {
      // ルートノード
      rootNodes.push(node);
    } else {
      // 親ノードを探してchildrenに追加
      const parentNode = nodeMap.get(agency.parentAgency);
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(node);
      } else {
        // 親が見つからない場合はルートとして扱う
        rootNodes.push(node);
      }
    }
  });
  
  // childrenが空の配列の場合はundefinedに正規化（D3.js用）
  const normalizeChildren = (node: LineageNode): void => {
    if (node.children && node.children.length === 0) {
      node.children = undefined;
    } else if (node.children) {
      node.children.forEach(normalizeChildren);
    }
  };
  
  rootNodes.forEach(normalizeChildren);
  
  return rootNodes;
}
