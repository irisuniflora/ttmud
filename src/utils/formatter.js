// 숫자를 K, M, B 등으로 포맷팅 (큰 숫자는 과학적 표기법)
export const formatNumber = (num) => {
  // NaN이나 undefined 체크
  if (typeof num !== 'number' || isNaN(num)) return '0';
  if (num < 0) num = 0; // 음수 방지

  if (num < 1000) return Math.floor(num).toLocaleString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num < 1000000000000000) return (num / 1000000000000).toFixed(1) + 'T';

  // T 이상의 큰 숫자는 과학적 표기법 사용
  const exponent = Math.floor(Math.log10(num));
  const mantissa = num / Math.pow(10, exponent);
  return mantissa.toFixed(2) + 'e' + exponent;
};

// 큰 숫자를 읽기 쉽게 포맷팅 (쉼표 추가, 1e15 이상은 지수 표기법)
export const formatNumberWithCommas = (num) => {
  // NaN이나 undefined 체크
  if (typeof num !== 'number' || isNaN(num)) return '0';
  if (num < 0) num = 0; // 음수 방지

  // 1e15 (1조의 1000배) 이상은 지수 표기법 사용
  if (num >= 1e15) {
    const exponent = Math.floor(Math.log10(num));
    const mantissa = num / Math.pow(10, exponent);
    return mantissa.toFixed(2) + 'e' + exponent;
  }

  return Math.floor(num).toLocaleString('ko-KR');
};

// 퍼센트 표시
export const formatPercent = (num) => {
  return num.toFixed(1) + '%';
};

// 시간 포맷팅 (초 -> 분:초)
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// HP 바 퍼센트 계산
export const getHPPercent = (current, max) => {
  return Math.max(0, Math.min(100, (current / max) * 100));
};

// 스탯 값 포맷팅 (공격력은 k단위, %는 소수점 첫째자리)
export const formatStatValue = (value, suffix) => {
  if (suffix === '%') {
    // % 옵션은 소수점 첫째자리까지
    return value.toFixed(1);
  } else {
    // 공격력 등 정수 옵션
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return Math.floor(value).toString();
  }
};
