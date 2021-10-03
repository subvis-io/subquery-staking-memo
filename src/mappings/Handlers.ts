import { SubstrateBlock } from '@subql/types';
import { ChronicleKey } from '../constants';
import { Staking, Chronicle } from '../types';

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  try {
    const { timestamp, block: rawBlock } = block;
    const curTotalIssuance = await api.query.balances?.totalIssuance();
    const auctionCounter = api.query.auctions && (await api.query.auctions?.auctionCounter());
    const curEra = await api.query.staking.currentEra();
    const stakingAmount = await api.query.staking.erasTotalStake(Number.parseInt(curEra.toString()));
    const totalStaking = BigInt(stakingAmount.toString());
    const blockNum = rawBlock.header.number.toNumber();

    const curAuctionCounter = auctionCounter ? Number.parseInt(auctionCounter.toString()) : 0;

    logger.info(`
    =====
    Era: ${curEra} - BlockNum: ${blockNum} - timestamp: ${timestamp}
    curTotalIssuance: ${curTotalIssuance}: curAuctionCounter - ${curAuctionCounter}
    =====
    `);
    const chronicle = await Chronicle.get(ChronicleKey);
    if (!chronicle) {
      logger.info('Setup Chronicle');
      await Chronicle.create({ id: ChronicleKey, curEra, curBlockNum: blockNum, curTotalIssuance, curAuctionCounter })
        .save()
        .catch((err) => logger.error(err));
    } else {
      chronicle.curBlockNum = blockNum;
      chronicle.curEra = curEra as unknown as number;
      chronicle.curTotalIssuance = curTotalIssuance as unknown as bigint;
      chronicle.curAuctionCounter = curAuctionCounter;
      await chronicle.save();
    }

    const staking = await Staking.get(curEra.toString());
    if (staking) {
      staking.stakingAmount = totalStaking;
      staking.blockNum = blockNum;
      staking.timestamp = timestamp;
      logger.info(`Update: Era: ${staking.id} - BlockNum: ${blockNum} - stakingAmount: ${stakingAmount} `);
      await staking.save();
    } else {
      logger.info(`Create: Era: ${curEra} - stakingAmount: ${stakingAmount} - BlockNum: ${blockNum} `);

      await Staking.create({
        id: curEra.toString(),
        timestamp,
        blockNum,
        stakingAmount: totalStaking
      }).save();
    }
  } catch (err) {
    logger.error(`handleBlock err: ${err} `);
  }
}
