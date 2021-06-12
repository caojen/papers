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

    context: string;

    constructor(context: string) {
        this.context = context;
    }

    /**
     * Resolve this.context into this.
     * Return true, if resolving done. This means this.sync should be called later to store this into database.
     * Return false, meaning that resolve failed, or origin_id exists.
     */
    async resolve(): Promise<boolean> {
        return false;
    }

    /**
     * Sync this into database.
     * Always return true.
     */
    async sync(): Promise<boolean> {
        return true;
    }
}
