export const parseNumber = (hexOrNum: string | number | undefined): number => {
  if (!hexOrNum) {
    return 0;
  }
  return typeof hexOrNum === 'string'
    ? parseInt(hexOrNum.replace(/^0x/, ''), 16) || 0
    : hexOrNum;
};

export * from './queryApi';
