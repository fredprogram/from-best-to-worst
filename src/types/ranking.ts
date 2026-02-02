export type TagType = 'text' | 'image' | 'mixed';

export interface Tag {
  id: string;
  type: TagType;
  content: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export type RankLevel = 'hong' | 'top' | 'ren' | 'npc' | 'la' | 'unassigned';

export interface RankLevelConfig {
  id: RankLevel;
  name: string;
  color: string;
  textColor: string;
}

// 参考Python代码的颜色配置
export const RANK_LEVELS: Record<RankLevel, RankLevelConfig> = {
  hong: { id: 'hong', name: '夯', color: '#ff4d4f', textColor: '#000000' },
  top: { id: 'top', name: '顶级', color: '#ffa940', textColor: '#000000' },
  ren: { id: 'ren', name: '人上人', color: '#ffec3d', textColor: '#000000' },
  npc: { id: 'npc', name: 'NPC', color: '#e0e0e0', textColor: '#000000' },
  la: { id: 'la', name: '拉完了', color: '#ffffff', textColor: '#000000' },
  unassigned: { id: 'unassigned', name: '未排序', color: '#d9d9d9', textColor: '#000000' },
};

export interface RankState {
  hong: Tag[];
  top: Tag[];
  ren: Tag[];
  npc: Tag[];
  la: Tag[];
  unassigned: Tag[];
}
