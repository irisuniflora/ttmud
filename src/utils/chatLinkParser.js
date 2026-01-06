// 채팅 아이템 링크 파싱 및 생성 유틸리티

import { EQUIPMENT_SETS, EQUIPMENT_SLOT_NAMES, NORMAL_GRADES, ANCIENT_CONFIG } from '../data/equipmentSets';
import { INSCRIPTIONS, INSCRIPTION_GRADES, calculateInscriptionStats } from '../data/inscriptions';
// 구 영웅 시스템 제거됨 - 영웅 링크 기능 비활성화

// 링크 타입
export const LINK_TYPES = {
  EQUIPMENT: 'equipment',
  INSCRIPTION: 'inscription',
  HERO: 'hero'
};

// 링크 정규식 - [[type|displayName|encodedData]]
// 예: [[equipment|+20 영원의 현자 무기|base64data]]
export const LINK_REGEX = /\[\[(equipment|inscription|hero)\|([^\|]+)\|([^\]]+)\]\]/g;

// UTF-8 safe base64 인코딩/디코딩
const encodeBase64 = (str) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
};

const decodeBase64 = (str) => {
  return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
};

// 메시지 내용 파싱 - 텍스트와 링크 분리
export const parseMessageContent = (content) => {
  const parts = [];
  let lastIndex = 0;

  // 정규식 reset
  LINK_REGEX.lastIndex = 0;

  let match;
  while ((match = LINK_REGEX.exec(content)) !== null) {
    // 링크 이전 텍스트
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }

    // 링크 파싱
    try {
      const encodedData = match[3];
      const decodedData = JSON.parse(decodeBase64(encodedData));

      parts.push({
        type: 'link',
        linkType: match[1],
        displayName: match[2],
        metadata: decodedData,
        raw: match[0]
      });
    } catch (e) {
      // 파싱 실패 시 텍스트로 처리
      parts.push({ type: 'text', value: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // 남은 텍스트
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return parts;
};

// ===== 링크 생성 함수 =====

// 장비 링크 생성
export const createEquipmentLink = (item) => {
  // 표시명 생성
  let displayName = item.name || EQUIPMENT_SLOT_NAMES[item.slot] || '장비';

  if (item.isAncient) {
    displayName = `[고대] ${displayName}`;
  }

  if (item.enhanceLevel > 0) {
    displayName = `+${item.enhanceLevel} ${displayName}`;
  }

  // 메타데이터
  const metadata = {
    enhanceLevel: item.enhanceLevel || 0,
    itemLevel: item.itemLevel || 1,
    setId: item.setId || null,
    normalGrade: item.normalGrade || null,
    isAncient: item.isAncient || false,
    slot: item.slot,
    name: item.name || EQUIPMENT_SLOT_NAMES[item.slot],
    stats: item.stats || [],
    awakeningCount: item.awakeningCount || 0,
    upgradesLeft: item.upgradesLeft ?? 10
  };

  const encoded = encodeBase64(JSON.stringify(metadata));
  return `[[equipment|${displayName}|${encoded}]]`;
};

// 문양 링크 생성
export const createInscriptionLink = (inscription) => {
  const inscriptionData = INSCRIPTIONS[inscription.inscriptionId];
  const gradeData = INSCRIPTION_GRADES[inscription.grade];

  // 표시명 생성
  let displayName = inscriptionData?.name || '문양';
  if (inscription.level > 1) {
    displayName = `+${inscription.level} ${displayName}`;
  }
  if (gradeData) {
    displayName = `[${gradeData.name}] ${displayName}`;
  }

  const metadata = {
    inscriptionId: inscription.inscriptionId,
    grade: inscription.grade,
    level: inscription.level || 1
  };

  const encoded = encodeBase64(JSON.stringify(metadata));
  return `[[inscription|${displayName}|${encoded}]]`;
};

// 동료 링크 생성 (구 영웅 시스템 제거됨 - 기능 비활성화)
export const createHeroLink = (heroId, heroState) => {
  return null; // 영웅 링크 비활성화
};

// ===== 링크 표시 정보 =====

// 링크에서 표시용 정보 추출
export const getLinkDisplayInfo = (linkData) => {
  const { linkType, displayName, metadata } = linkData;

  switch (linkType) {
    case LINK_TYPES.EQUIPMENT:
      return getEquipmentDisplayInfo(displayName, metadata);
    case LINK_TYPES.INSCRIPTION:
      return getInscriptionDisplayInfo(displayName, metadata);
    case LINK_TYPES.HERO:
      return getHeroDisplayInfo(displayName, metadata);
    default:
      return { displayName: '알 수 없는 아이템', color: '#888', icon: '❓' };
  }
};

// 장비 표시 정보
const getEquipmentDisplayInfo = (displayName, metadata) => {
  const { setId, normalGrade, isAncient } = metadata;

  let color = '#9CA3AF'; // 기본 회색
  let icon = '⚔️';

  if (isAncient) {
    color = ANCIENT_CONFIG.color;
    icon = ANCIENT_CONFIG.icon;
  } else if (setId && EQUIPMENT_SETS[setId]) {
    const setData = EQUIPMENT_SETS[setId];
    color = setData.color;
    icon = setData.icon;
  } else if (normalGrade && NORMAL_GRADES[normalGrade]) {
    color = NORMAL_GRADES[normalGrade].color;
  }

  return { displayName, color, icon };
};

// 문양 표시 정보
const getInscriptionDisplayInfo = (displayName, metadata) => {
  const { grade } = metadata;
  const gradeData = INSCRIPTION_GRADES[grade];

  // 등급 색상 클래스를 실제 색상으로 변환
  const colorMap = {
    'text-gray-400': '#9CA3AF',
    'text-green-400': '#4ADE80',
    'text-blue-400': '#60A5FA',
    'text-purple-400': '#C084FC',
    'text-yellow-400': '#FACC15',
    'text-orange-400': '#FB923C',
    'text-red-400': '#F87171',
    'text-fuchsia-500': '#D946EF'
  };
  const color = gradeData ? (colorMap[gradeData.color] || '#9CA3AF') : '#9CA3AF';

  return { displayName, color, icon: '📿' };
};

// 동료 표시 정보
const getHeroDisplayInfo = (displayName, metadata) => {
  const { grade } = metadata;

  // 등급 색상
  const colorMap = {
    normal: '#9CA3AF',
    rare: '#60A5FA',
    epic: '#C084FC',
    unique: '#FACC15',
    legendary: '#FB923C',
    mythic: '#F87171',
    dark: '#D946EF'
  };
  const color = colorMap[grade] || '#9CA3AF';

  return { displayName, color, icon: '🦸' };
};

// ===== 링크 데이터 복원 =====

// 링크에서 실제 아이템 데이터 복원 (미리보기용)
export const resolveLinkData = (linkData) => {
  const { linkType, metadata } = linkData;

  switch (linkType) {
    case LINK_TYPES.EQUIPMENT:
      return resolveEquipmentData(metadata);
    case LINK_TYPES.INSCRIPTION:
      return resolveInscriptionData(metadata);
    case LINK_TYPES.HERO:
      return resolveHeroData(metadata);
    default:
      return null;
  }
};

// 장비 데이터 복원
const resolveEquipmentData = (metadata) => {
  return {
    id: metadata.id || `linked_${Date.now()}`,
    ...metadata,
    type: metadata.setId ? 'set' : 'normal'
  };
};

// 문양 데이터 복원
const resolveInscriptionData = (metadata) => {
  const { inscriptionId, grade, level } = metadata;
  const stats = calculateInscriptionStats(inscriptionId, grade);

  return {
    ...stats,
    inscriptionId,
    grade,
    level: level || 1,
    id: `linked_inscription_${Date.now()}`
  };
};

// 동료 데이터 복원 (구 영웅 시스템 제거됨 - 기능 비활성화)
const resolveHeroData = (metadata) => {
  return null; // 영웅 데이터 복원 비활성화
};
