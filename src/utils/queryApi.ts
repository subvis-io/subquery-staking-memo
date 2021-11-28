import { CrowdloanReturn } from './types';

export const fetchCrowdloanNewRaised = async () =>
  api.query.crowdloan?.newRaise &&
  ((await api.query.crowdloan.newRaise()) as unknown as Array<object | null>);

export const fetchParachains = async () =>
  api.query.paras?.parachains &&
  ((await api.query.paras.parachains()) as unknown as Array<object | null>);

export const fetchCrowdloan = async (
  paraId: number
): Promise<CrowdloanReturn | null> => {
  const fund = await api.query.crowdloan.funds(paraId);
  // logger.info(`Fetched crowloan ${paraId}: ${JSON.stringify(fund, null, 2)}`);
  return fund.toJSON() as unknown as CrowdloanReturn | null;
};
