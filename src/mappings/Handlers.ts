import { SubstrateBlock } from '@subql/types';
import { Staking } from '../types';

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  const { timestamp, block: rawBlock } = block;
  const curEra = await api.query.staking.currentEra();
  const stakingAmount = await api.query.staking.erasTotalStake(Number.parseInt(curEra.toString()));
  const blockNum = rawBlock.header.number.toNumber();

  const staking = await Staking.get(curEra.toString());
  if (staking) {
    staking.stakingAmount = stakingAmount.toString();
    logger.info(` staking: ${staking.id} - stakingAmount: ${stakingAmount} `);
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
      stakingAmount: stakingAmount.toString()
    }).save();
  }
}
