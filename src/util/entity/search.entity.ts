import { mysqlService } from "../mysql.instance";

/**
 * Table `search`
 */
export class Search {
    id: number;
    v: string;

    constructor(id: number, v: string = '') {
        this.id = id;
        this.v = v;
    }

    /**
     * Fetch all search rows in database.
     * Return all Search Objects within an array.
     */
    static async fetchAll(): Promise<Search[]> {
        const sql = `
            SELECT id, v
            FROM search
        `;
        const res = await mysqlService.query(sql);
        const ret: Search[] = [];
        for(const r of res) {
            ret.push(new Search(r.id, r.v));
        }
        return ret;
    }

    /**
     * Create a new search.
     * Store `this.v` into database, sync this.id, then return true.
     * If failed, sync this.id, return false.
     */
    async create(): Promise<boolean> {
        if(this.v === '') {
            return false;
        }
        const select_sql = `
            SELECT id
            FROM search
            WHERE v=?;
        `;

        const sres = await mysqlService.query(select_sql, [this.v])
        if(sres.length !== 0) {
            this.id = sres[0].id;
            return false;
        }
        const insert_sql = `
            INSERT INTO search(v)
            VALUES(?);
        `;
        const ires = await mysqlService.query(insert_sql, [this.v]);
        const insertId = ires.insertId;
        this.id = insertId;
        return true;
    }

    /**
     * Delete one row in `search`.
     * Based on `this.id`, delete this entity.
     * Return true always if id !== -1;
     */
    async delete(): Promise<boolean> {
        if(this.id === -1) {
            return false;
        }
        const sql = `
            DELETE FROM search
            WHERE id = ?;
        `;

        await mysqlService.query(sql, [this.id]);
        return true;
    }

    /**
     * Fetch one row in `search`
     * Based on `this.id`, fetch this entity.
     * If this entity exists, sync `this.v`, return true.
     * Otherwise, set this.id = -1, this.v = '', then return false;
     */
    async fetch(): Promise<boolean> {
        const sql = `
            SELECT v
            FROM search
            WHERE id = ?;
        `;
        const res = await mysqlService.query(sql, [this.id]);
        if(res.length === 0) {
            this.id = -1;
            this.v = '';
            return false;
        }
        this.v = res[0].v;
        return true;
    }

    /**
     * Update one row in `search`.
     * Based on `this.id`, update `this.v`.
     * Return true always.
     */
    async update(): Promise<boolean> {
        const sql = `
            UPDATE search
            SET v = ?
            WHERE id = ?;
        `;
        await mysqlService.query(sql, [this.v,  this.id]);
        return true;
    }
}
