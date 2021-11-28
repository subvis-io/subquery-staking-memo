import { Entity } from '@subql/types';
import assert from 'assert';

export const save = async <T extends Entity>(
  colName: string,
  entity: T
): Promise<T> => {
  const { id } = entity;
  assert(id != null, `Invalid entity id: ${id}`);
  await store.set(colName, id, entity).catch((err) => {
    logger.error(`Save entity failed, ${err.toString()}`);
    process.exit(-1);
  });
  return entity;
};

export const get = async <T extends Entity>(
  colName: string,
  id: string
): Promise<T | null> => store.get(colName, id) as Promise<T | null>;

export const upsert = async <T extends Entity>(
  colName: string,
  id: string,
  updater: Record<string, any>,
  updateFn?: (entry?: Entity) => Omit<T, 'save'>
): Promise<T> => {
  const entry = await get(colName, id);
  const updatedItem = entry
    ? updateFn
      ? updateFn(entry)
      : { ...entry, ...updater, id }
    : updateFn
    ? updateFn()
    : { ...updater, id };

  logger.debug(
    `UpsertItem: ${JSON.stringify(
      updatedItem,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value),
      2
    )}`
  );
  return store
    .set(colName, id, updatedItem)
    .then(() => updatedItem as T)
    .catch((err) => {
      // logger.error(`Upsert entity ${colName} ${JSON.stringify(updatedItem, null, 2)} failed, ${err.toString()}`);
      throw err;
    });
};
