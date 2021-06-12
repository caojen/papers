import { mysqlService } from "./mysql.instance";
import { date2string } from './cron.function';
import { Search } from "./entity/search.entity";

export async function setLatestDate(searches: Search[], time: Date) {
  const sql = `
    insert into settings(k, v)
    values(?, ?)
    on duplicate key update v = ?;
  `;
  for(const search of searches) {
    await mysqlService.query(sql, [search, date2string(time), date2string(time)]);
  }
}

export async function getLatestDate(search: string) {
  const sql = `
    select v from settings
    where k = ?;
  `;
  const res = await mysqlService.query(sql, [search]);
  if(res.length === 0) {
    return undefined;
  } else {
    return new Date(res[0].v);
  }
}
