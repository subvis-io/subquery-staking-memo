import { SubstrateBlock } from '@subql/types';
import { Staking } from '../types';

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  try {
    const { timestamp, block: rawBlock } = block;
    const curEra = await api.query.staking.currentEra();
    const stakingAmount = await api.query.staking.erasTotalStake(Number.parseInt(curEra.toString()));
    const totalStaking = BigInt(stakingAmount.toString());
    const blockNum = rawBlock.header.number.toNumber();

    const staking = await Staking.get(curEra.toString());
    if (staking) {
      staking.stakingAmount = totalStaking;
      staking.blockNum = blockNum;
      staking.timestamp = timestamp;
      logger.info(`BlockNum: ${blockNum} - Era: ${staking.id} - stakingAmount: ${stakingAmount} `);
      await staking.save();
    } else {
      logger.info(`======
        CurERA: ${curEra} - stakingAmount: ${stakingAmount}
        BlockNum: ${blockNum} - timestamp: ${timestamp}
        ======`);

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
