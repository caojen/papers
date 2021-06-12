import { mysqlService } from "../mysql.instance";

export class Author {
    id: number;
    name: string;

    constructor(id: number = -1, name: string = '') {
        this.id = id;
        this.name = name;
    }

    static async fetch_by_name(name: string) {
        const a = new Author(-1, name);
        await a.sync_by_name();
        return a;
    } 

    /**
     * Sync Author by this.id.
     * Based on this.id, get this.name, return true.
     * If this.id == -1, or this row doesnot exist, return false
     */
    async sync_by_id(): Promise<boolean> {
        if(this.id === -1) {
            return false;
        }
        const sql = `
            SELECT name
            FROM author
            WHERE id = ?;
        `;
        const res = await mysqlService.query(sql, [this.id]);
        if(res.length === 0) {
            this.name = '';
            return false;
        } else {
            this.name = res[0].name;
            return true;
        }
    }

    /**
     * Sync by this.name.
     * Based on this.name, fetch this.id.
     * If this rows doesnot exists, auto create this row.
     * Return true always, unless this.name == ''.
     */
    async sync_by_name(): Promise<boolean> {
        if(this.name === '') {
            return false;
        }
        const select_sql = `
            SELECT id
            FROM author
            WHERE name = ?;
        `;
        const sres = await mysqlService.query(select_sql, [this.name]);
        if(sres.length === 0) {
            const insert_sql = `
                INSERT INTO author(name)
                VALUES(?);
            `;
            const ires = await mysqlService.query(insert_sql, [this.name]);
            this.id = ires.insertId;
        } else {
            this.id = sres[0].id;
        }
        return true;
    }
}
