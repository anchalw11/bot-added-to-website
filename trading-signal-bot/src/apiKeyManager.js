const apiKeys = {
  'currencybeacon.com': {
    'EUR/USD': ['Ref0MyJHeVBP4kKNa24BqiqbwKc8T6VY', '8DAQVE56G3foCHj9SusLKHx9xIFJsCP0'],
    'GBP/USD': ['KXdaNWo4QZ3sULQY93pZDEYyCt37sXXZ', '8DAQVE56G3foCHj9SusLKHx9xIFJsCP0'],
    'USD/JPY': ['Ppy0dKPCp0sYKoMbtkd0dcylOHxB8pFg', 'lSi7MyJH6ImxryvMqHk6l5KTVXmEiuE0'],
    'XAU/USD': ['NWRIzpI8nwsuIvThqZQtv5W920UWevAX', 'NRyEx71Kj6k86TPoVALWXIewnjjdUQoB'],
  },
  'financialmodellingprep.com': {
    'XAG/USD': ['ZnGnGJfphMxGlNTg0IY7tzhw0na7he2e', 'cO2So6E9npvl61RJNKDN0XG6vXUOu1M2'],
    'USD/CHF': ['YIOfNOSjNVKVXa8AE9RBQzGsj6UR9Jah', 'erobSaiKA8tR2WFMndOc1pqkwKLoS78J'],
    'AUD/USD': ['unxQnyeAfT4uQK6tkuue0vG7aMJYdMxS', 'pUKlRtJdiOoHMuCW0mPgVinRlVFVNSWZ'],
    'USD/CAD': ['DBk1BuJKwovXNAC2EkX1brFPuwvJDiWj', '0Hh1qcMwCaxAHBFErXZqnUcil3QzkuPe'],
    'NZD/USD': ['jlFm01miqXrjVBpJxY2adTBS3CCHiqlg', 'WLI7iICCMGPkzXgzPVXs1xlcXr9K7sdt'],
    'EUR/JPY': ['eOmLFYVummeVEetf9OQCEUwPDdvT7Bn1', 'iDmalmxS9vwfEOYJemoP2vIuOS3UoXyI'],
    'GBP/JPY': ['QCz0fKTfOgxxXKVXv6ph1F79nbwflbq4', 'Z8fmhqFqFXXSUvBm8YZomoJ0N8qLgM9C'],
    'EUR/GBP': ['T1AR0E2RT12TIMV0G5qlXp6j4RPgZ9ys', 'r8JMZ3F6Gub3M1lxt99KRKhspm44vTGn'],
    'EUR/AUD': ['rsYISbIBZ1SkMAHm6AHWBwo5NHI1CRs2', 'cyIglNi8O49833MOTclMLlWrIfPLX1Dr'],
    'GBP/AUD': ['Y12xLWM0NRHxo9RKyGj7nZWfkCKoglYc', 'oBhqDxRWExMkCa4z6FZsAb38gzyXl6dV'],
    'AUD/CAD': ['0miKTpyJeztgI7V9zRwKcF0iS1PO1kij', 'SicQrG60T46GeDBYfh5p06ca7pBplqM5'],
    'CAD/JPY': ['NQZR5TDerEcLis9cFqny8haVXCgckKHu', 'UvWnk1PGbWtSdVWtdZ9VnqXpmkZMZmrG'],
    'CHF/JPY': ['DIghlVl2YutPnhujJ1bJilGGnYStyn9Q', 'F9ocT9jVv6KpyNXtPmoVGfslfnlARBbm'],
    'AUD/CHF': ['t2EWXVEQxMUptkAu9cB2eWOlAQx6L17i', 'q1kmGy4T4rsEofIr5ytyVTRz0BqjRKxp'],
    'CAD/CHF': ['DFayt9kcP23RvXp4XlAqkaXjVbMg6G91', '0q6kOqpXj3ycutxl7VlqgHuDqMhKedF0'],
    'EUR/CHF': ['yCLDea7t7iUE8dUMx3N7aeLRgZ3O32cy', 'KUcpHx2ufVEWFzxyV3xyBcymLMFwpRbx'],
    'GBP/CHF': ['WgRLSlQYbjc8hNbUx1DkvMDgloggvakr', 's5LoLUrwKbE401FqLYvv7w3ucKzfCzry'],
    'NZD/CAD': ['nMmof9S6QCPMb6KRQiLMAX0uP7wEsWyF', 'fzVKjOAl0UZA7sHpge8yMOVaeWYnoaDm'],
    'NZD/JPY': ['85jakUh6j7ytpavV34V2lsSKyW5hqTmW', 'Y08uhoKaHDHQEWmv1ZAYqgMrHgw6im2W'],
    'AUD/NZD': ['xjnT5Qx7jogPjLozvi2xAzy6Gf2vPBCn', 'gBhPN7Y5TL40HMirC47KsKaCZy4bbk1B'],
  },
};

const keyUsage = {};

function getHostForPair(pair) {
  for (const host in apiKeys) {
    if (apiKeys[host][pair]) {
      return host;
    }
  }
  return null;
}

function getNextKey(pair) {
  const host = getHostForPair(pair);
  if (!host) {
    return null;
  }

  if (!keyUsage[pair]) {
    keyUsage[pair] = 0;
  }

  const keys = apiKeys[host][pair];
  const keyIndex = keyUsage[pair] % keys.length;
  return keys[keyIndex];
}

function rotateKey(pair) {
  const host = getHostForPair(pair);
  if (!host) {
    return;
  }

  if (!keyUsage[pair]) {
    keyUsage[pair] = 0;
  }

  keyUsage[pair]++;
}

module.exports = {
  getNextKey,
  rotateKey,
  getHostForPair,
};
