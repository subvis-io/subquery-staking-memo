// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class CrowdloanFunds implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public paraId: number;

    public deposit: bigint;

    public raised: bigint;

    public cap: bigint;

    public firstPeriod: number;

    public lastPeriod: number;

    public depositor?: string;

    public end: number;

    public era: number;

    public blockNum: number;

    public timestamp: Date;

    public isParachain: boolean;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save CrowdloanFunds entity without an ID");
        await store.set('CrowdloanFunds', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove CrowdloanFunds entity without an ID");
        await store.remove('CrowdloanFunds', id.toString());
    }

    static async get(id:string): Promise<CrowdloanFunds | undefined>{
        assert((id !== null && id !== undefined), "Cannot get CrowdloanFunds entity without an ID");
        const record = await store.get('CrowdloanFunds', id.toString());
        if (record){
            return CrowdloanFunds.create(record);
        }else{
            return;
        }
    }


    static async getByParaId(paraId: number): Promise<CrowdloanFunds[] | undefined>{
      
      const records = await store.getByField('CrowdloanFunds', 'paraId', paraId);
      return records.map(record => CrowdloanFunds.create(record));
      
    }

    static async getByEra(era: number): Promise<CrowdloanFunds[] | undefined>{
      
      const records = await store.getByField('CrowdloanFunds', 'era', era);
      return records.map(record => CrowdloanFunds.create(record));
      
    }

    static async getByBlockNum(blockNum: number): Promise<CrowdloanFunds[] | undefined>{
      
      const records = await store.getByField('CrowdloanFunds', 'blockNum', blockNum);
      return records.map(record => CrowdloanFunds.create(record));
      
    }

    static async getByTimestamp(timestamp: Date): Promise<CrowdloanFunds[] | undefined>{
      
      const records = await store.getByField('CrowdloanFunds', 'timestamp', timestamp);
      return records.map(record => CrowdloanFunds.create(record));
      
    }


    static create(record){
        let entity = new CrowdloanFunds(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
