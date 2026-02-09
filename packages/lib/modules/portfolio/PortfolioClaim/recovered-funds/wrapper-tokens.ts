const WRAPPER_TOKENS: Record<number, string[]> = {
  // Mainnet
  1: [
    '0xb0334C5287Bfb15A8C9464898CDB0248ED176332', // WETH
    '0x8942c1e1e0d48e14efba4cc48d2e3584116e367f', // weETH
    '0x4e185b1502fea7a06b63fdda6de38f92c9528566', // rETH
    '0x84394fa6a39bdff63b255622da362b113c690267', // osETH
    '0x470c9034f50afe6633f7e84a80b9961baa893d77', // wstETH
    '0x4da51947fe2e4d59a137a78ced3b740f5e230f92', // Stafi
    // Test
    '0xc63FF8aF78414F90069aF3558D939127625ABE78',
    '0x289c74E8E83B95C2B6e166E02cD8a90dd52d492A',
  ],
  // Arbitrum
  42161: [
    '0xb0334c5287bfb15a8c9464898cdb0248ed176332', // wETH
    '0x8942c1e1e0d48e14efba4cc48d2e3584116e367f', // wstETH
    '0x4e185b1502fea7a06b63fdda6de38f92c9528566', // weETH
    '0x84394fa6a39bdff63b255622da362b113c690267', // rETH
    '0x470c9034f50afe6633f7e84a80b9961baa893d77', // ezETH
    '0x4da51947fe2e4d59a137a78ced3b740f5e230f92', // rsETH
    '0xc63ff8af78414f90069af3558d939127625abe78', // sfrxETH
    '0x69b7afb870c31302de15371a2ee79aee444cc014', // ETHX
    '0xad9e52ed75f71bdf67ddce3e417b805f042e54e3', // USDX
    '0xe995168d9924d72a4fe45af18edc06b498cb8dbb', // sUSDX
    '0x67763bc722abe1f041ddc3ed6e445f4ab476ff9e', // ankrETH
  ],
  // Base
  8453: [
    '0xe859ee83a3c8c5af058dc2f3533ac577b19706f2', // WETH
    '0x16814b50a7962592b8fc4080cdaf0008a8fd5620', // weETH
    '0x64e8e5fe82625e3b8ab7d9d00918736d6b8634b8', // rETH
  ],
  // Polygon
  137: [
    '0x467665d4ae90e7a99c9c9af785791058426d6ea0', // wMATIC
    '0xec2c6184761ab7fe061130b4a7e3da89c72f8395', // stMATIC
    '0x138d9e0d0cc4906c4cd865b38c9340a5cedd9850', // truMATIC
    '0xb0334c5287bfb15a8c9464898cdb0248ed176332', // MaticX
  ],
  // Optimism
  10: [
    '0x467665d4ae90e7a99c9c9af785791058426d6ea0', // WETH
    '0xec2c6184761ab7fe061130b4a7e3da89c72f8395', // rETH
    '0x138d9e0d0cc4906c4cd865b38c9340a5cedd9850', // wstETH
  ],
}

const normalize = (address: string) => address.toLowerCase()

export const NORMALIZED_WRAPPER_TOKENS: Record<number, string[]> = {
  1: WRAPPER_TOKENS[1].map(normalize),
  42161: WRAPPER_TOKENS[42161].map(normalize),
  8453: WRAPPER_TOKENS[8453].map(normalize),
  137: WRAPPER_TOKENS[137].map(normalize),
  10: WRAPPER_TOKENS[10].map(normalize),
}
