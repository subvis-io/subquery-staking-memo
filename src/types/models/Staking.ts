// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class Staking implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockNum: number;

    public timestamp: Date;

    public stakingAmount: bigint;

    public totalIssuance?: bigint;

    public auctionCounter?: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Staking entity without an ID");
        await store.set('Staking', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Staking entity without an ID");
        await store.remove('Staking', id.toString());
    }

    static async get(id:string): Promise<Staking | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Staking entity without an ID");
        const record = await store.get('Staking', id.toString());
        if (record){
            return Staking.create(record);
        }else{
            return;
        }
    }


    static async getByBlockNum(blockNum: number): Promise<Staking[] | undefined>{
      
      const records = await store.getByField('Staking', 'blockNum', blockNum);
      return records.map(record => Staking.create(record));
      
    }

    static async getByTimestamp(timestamp: Date): Promise<Staking[] | undefined>{
      
      const records = await store.getByField('Staking', 'timestamp', timestamp);
      return records.map(record => Staking.create(record));
      
    }


    static create(record){
        let entity = new Staking(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
