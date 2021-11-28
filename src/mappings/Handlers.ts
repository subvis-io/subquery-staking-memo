import { SubstrateBlock } from '@subql/types';
import { ChronicleKey } from '../constants';
import * as Storage from '../services';
import {
  fetchCrowdloan,
  fetchCrowdloanNewRaised,
  fetchParachains,
  parseNumber,
} from '../utils';
const _ = require('lodash');

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  try {
    const { timestamp, block: rawBlock } = block;
    const curTotalIssuance = await api.query.balances?.totalIssuance();
    const auctionCounter =
      api.query.auctions && (await api.query.auctions?.auctionCounter());
    const curEra = await api.query.staking.currentEra();
    const stakingAmount = await api.query.staking.erasTotalStake(
      Number.parseInt(curEra.toString())
    );
    const totalStaking = BigInt(stakingAmount.toString());
    const blockNum = rawBlock.header.number.toNumber();

    const curAuctionCounter = auctionCounter
      ? Number.parseInt(auctionCounter.toString())
      : 0;

    let paraThreadFunds = BigInt(0);
    let paraChainFunds = BigInt(0);
    const crowdloanNewRaise = (await fetchCrowdloanNewRaised()) || [];
    const parachains = (await fetchParachains()) || [];
    const paras = _.uniq(
      crowdloanNewRaise
        .concat(parachains)
        .map((paraId) => parseInt(paraId.toString()))
    );

    if (paras?.length > 0) {
      for (const paraId of paras) {
        const crowdloan = await fetchCrowdloan(paraId);
        const isParachain = parachains.includes(paraId);
        if (crowdloan) {
          const id = `${curEra}-${paraId}`;
          const {
            deposit,
            raised,
            cap,
            firstPeriod,
            lastPeriod,
            depositor,
            end,
          } = crowdloan;

          if (isParachain) {
            paraChainFunds += BigInt(parseNumber(raised));
          } else {
            paraThreadFunds += BigInt(parseNumber(raised));
          }

          await Storage.upsert('CrowdloanFunds', id, {
            paraId,
            deposit,
            raised: parseNumber(raised),
            cap: parseNumber(cap),
            firstPeriod,
            lastPeriod,
            depositor,
            end,
            era: curEra,
            blockNum,
            timestamp,
            isParachain,
          });
        }
      }
    }

    logger.info(`
    =====
    Era: ${curEra} - BlockNum: ${blockNum} - timestamp: ${timestamp}
    curTotalIssuance: ${curTotalIssuance} - curAuctionCounter: ${curAuctionCounter}
    paraThreadFunds: ${paraThreadFunds} - paraChainFunds: ${paraChainFunds}
    =====
    `);

    await Storage.upsert('Chronicle', ChronicleKey, {
      curEra: curEra as unknown as number,
      curBlockNum: blockNum,
      curTotalIssuance: curTotalIssuance as unknown as bigint,
      curAuctionCounter,
    });
    logger.info(`*** Chronicle Updated ***`);

    await Storage.upsert('Staking', curEra.toString(), {
      timestamp,
      blockNum,
      stakingAmount: totalStaking,
      totalIssuance: curTotalIssuance as unknown as bigint,
      auctionCounter: curAuctionCounter,
      paraChainFunds,
      paraThreadFunds,
    });
    logger.info(`*** Staking Updated ***`);
  } catch (err) {
    logger.error(`handleBlock err: ${err} `);
  }
}
