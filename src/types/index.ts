// Agency（事務所）
export interface Agency {
  id: string;                    // 一意識別子
  name: string;                  // 事務所名
  aliases?: string[];            // 別名・旧名
  founded?: string;              // 設立年月（YYYY-MM形式）
  dissolved?: string;            // 解散年月（YYYY-MM形式、現存はnull）
  status: 'active' | 'dissolved' | 'merged';
  parentAgency?: string;         // 母体事務所ID（分裂の場合）
  mergedInto?: string;           // 合併先事務所ID
  description?: string;          // 説明
  website?: string;              // 公式サイト
}

// Actor（声優）
export interface Actor {
  id: string;                    // 一意識別子
  name: string;                  // 芸名
  realName?: string;             // 本名（公開情報のみ）
  birthDate?: string;            // 生年月日（YYYY-MM-DD）
  gender?: 'male' | 'female' | 'other';
  debutYear?: number;            // デビュー年
  status: 'active' | 'retired' | 'deceased';
}

// Transition（所属変遷）
export interface Transition {
  id: string;
  actorId: string;               // 声優ID
  agencyId: string;              // 事務所ID
  startDate: string;             // 所属開始（YYYY-MM形式）
  endDate?: string;              // 所属終了（YYYY-MM形式、現所属はnull）
  type: 'join' | 'leave' | 'transfer'; // 加入/退所/移籍
  note?: string;                 // 備考
}
