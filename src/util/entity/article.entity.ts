import { Author } from "./author.entity";
import { Keyword } from "./keyword.entity";
import { Search } from "./search.entity";

/**
 * Table `Article`
 */
export class Article {
    id: number;
    origin_id: number;
    type: string;
    publication: string;
    time: Date;
    search_time: Date;

    search: Search;
    authors: Author[];
    abstract: string;
    keywords: Keyword[];
}
