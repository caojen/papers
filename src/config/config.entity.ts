class Config {
  mysql: {
    host: string,
    port: string,
    user: string,
    pass: string,
    database: string
  };
  search: {
    keywords: string[],
    begindate: string,
    enddate: string,
    interval: number,
    proceed: boolean
  };
  time: {
    thread: number,
    interval: number
  };
  ncbi: {
    prefix: string,
    params: {
      term: string,
      page: string,
      filter: string
    }
  }
}
