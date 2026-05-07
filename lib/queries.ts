export interface SearchQuery {
  query: string;
  label: string;
}

export function buildQueries(name: string): SearchQuery[] {
  return [
    { query: `${name} childhood growing up background story`, label: "ORIGIN & BACKGROUND" },
    { query: `${name} how they made their first money`, label: "FIRST MONEY" },
    { query: `${name} net worth income streams revenue`, label: "NET WORTH & REVENUE" },
    { query: `${name} sells courses digital products what do they sell`, label: "PRODUCTS & OFFERS" },
    { query: `${name} business model how do they make money`, label: "BUSINESS MODEL" },
    { query: `${name} TikTok YouTube Instagram content strategy`, label: "CONTENT STRATEGY" },
    { query: `${name} interview podcast full story`, label: "INTERVIEWS & PODCASTS" },
    { query: `${name} who influenced them mentor connections`, label: "MENTORS & NETWORK" },
    { query: `${name} controversial drama beef`, label: "CONTROVERSIES" },
    { query: `${name} early life parents family`, label: "FAMILY & EARLY LIFE" },
    { query: `${name} failures mistakes before success`, label: "FAILURES & SETBACKS" },
    { query: `${name} exact steps to success timeline`, label: "SUCCESS TIMELINE" },
    { query: `${name} audience demographics who follows them`, label: "AUDIENCE PROFILE" },
    { query: `${name} quotes mindset beliefs`, label: "MINDSET & BELIEFS" },
  ];
}
