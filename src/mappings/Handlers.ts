import { SubstrateBlock } from '@subql/types';
import { ChronicleKey } from '../constants';
import { Staking, Chronicle } from '../types';

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  try {
    const { timestamp, block: rawBlock } = block;
    const curEra = await api.query.staking.currentEra();
    const stakingAmount = await api.query.staking.erasTotalStake(Number.parseInt(curEra.toString()));
    const totalStaking = BigInt(stakingAmount.toString());
    const blockNum = rawBlock.header.number.toNumber();

    const chronicle = await Chronicle.get(ChronicleKey);
    if (!chronicle) {
      logger.info('Setup Chronicle');
      await Chronicle.create({ id: ChronicleKey, curEra, curBlockNum: blockNum })
        .save()
        .catch((err) => logger.error(err));
    } else {
      chronicle.curBlockNum = blockNum;
      chronicle.curEra = curEra as unknown as number;
      await chronicle.save();
    }

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
