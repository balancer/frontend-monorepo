import { Address } from 'viem'
import { GqlChain } from '../shared/services/api/generated/graphql'
import { getGqlChain } from '../config/app.config'
import { getRandomInt } from '../shared/utils/numbers'

export type TokenColorDef = {
  from: string
  to: string
}

const tokenColors: Partial<Record<GqlChain, Record<Address, TokenColorDef>>> = {
  [GqlChain.Mainnet]: {
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': { from: '#627EEA', to: '#627EEA' }, // ETH
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { from: '#F2F3F7', to: '#CECDFE' }, // WETH
    '0x0bfc9d54fc184518a81162f8fb99c2eaca081202': { from: '#F2F3F7', to: '#CECDFE' }, // waETHWETH
    '0x90551c1795392094fe6d29b758eccd233cfaa260': { from: '#F2F3F7', to: '#CECDFE' }, // fWETH
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { from: '#1075E2', to: '#62A8F4' }, // USDC
    '0xd4fa2d31b7968e448877f69a96de69f5de8cd23e': { from: '#1075E2', to: '#62A8F4' }, // waEthUSDC
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#F5AC37', to: '#F5AC37' }, // DAI
    '0x83f20f44975d03b1b09e64809b757c47f942beea': { from: '#81C24D', to: '#57B14E' }, // sDAI
    '0xdac17f958d2ee523a2206206994597c13d831ec7': { from: '#27A17C', to: '#42EBB8' }, // USDT
    '0x7bc3485026ac48b6cf9baf0a377477fff5703af8': { from: '#27A17C', to: '#42EBB8' }, // waEthUSDT
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { from: '#F09242', to: '#F09242' }, // WBTC
    '0xba100000625a3754423978a60c9317c58a424e3d': { from: '#4C5561', to: '#303742' }, // BAL
    '0xc0c293ce456ff0ed870add98a0828dd4d2903dbf': { from: '#8C43D2', to: '#8C43D2' }, // AURA
    '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d': { from: '#AB60F3', to: '#AB60F3' }, // auraBAL
    '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56': { from: '#D7B554', to: '#D7B554' }, // B-80BAL-20WETH
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': { from: '#00A3FF', to: '#99DAFF' }, // wstETH
    '0x2411802d8bea09be0af8fd8d08314a63e706b29c': { from: '#00A3FF', to: '#99DAFF' }, // fwstETH
    '0x775f661b0bd1739349b9a2a3ef60be277c5d2d29': { from: '#00A3FF', to: '#99DAFF' }, // waEthLidowstETH
    '0xae78736cd615f374d3085123a210448e74fc6393': { from: '#FE856C', to: '#FFC5A8' }, // rETH
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': { from: '#817DFD', to: '#CECDFE' }, // AAVE
    '0xbf5495efe5db9ce00f80364c8b423567e58d2110': { from: '#ACE731', to: '#ACE731' }, // ezETH
    '0xe07f9d810a48ab5c3c914ba3ca53af14e4491e8a': { from: '#F0FF9B', to: '#F0FF9B' }, // GYD
    '0x6810e776880c02933d47db1b9fc05908e5386b96': { from: '#00132A', to: '#002A5C' }, // GNO
    '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f': { from: '#28D358', to: '#9AF9B5' }, // GHO
    '0xc71ea051a5f82c67adcf634c36ffe6334793d24c': { from: '#28D358', to: '#9AF9B5' }, // Aave Prime GHO
    '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38': { from: '#549BEB', to: '#5B7CF1' }, // osETH
    '0xac3e018457b222d93114458476f3e3416abbe38f': { from: '#000000', to: '#333333' }, // sfrxETH
    '0x1e6ffa4e9f63d10b8820a3ab52566af881dab53c': { from: '#7180F7', to: '#A3ADFA' }, // gtWETHe
    '0x3976d71e7ddfbab9bd120ec281b7d35fa0f28528': { from: '#AE80FA', to: '#CDB0FC' }, // slpETH
    '0xbfb53910c935e837c74e6c4ef584557352d20fde': { from: '#AE80FA', to: '#CDB0FC' }, // slpUSDC
    '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab': { from: '#F2CF18', to: '#F7E069' }, // COW
    '0xd11c452fc99cf405034ee446803b6f6c1f6d5ed8': { from: '#00DFC0', to: '#00B2DF' }, // tETH
    '0x4ba01f22827018b4772cd326c7627fb4956a7c00': { from: '#00DA17', to: '#42FF56' }, // msUSD
    '0x890a5122aa1da30fec4286de7904ff808f0bd74a': { from: '#4797EF', to: '#93C2F6' }, // msY
    '0x97ccc1c046d067ab945d3cf3cc6920d3b1e54c88': { from: '#18493A', to: '#3EBC95' }, // USP
    '0x559b7bfc48a5274754b08819f75c5f27af53d53b': { from: '#FF5E66', to: '#FF999E' }, // QI
    '0x48f9e38f3070ad8945dfeae3fa70987722e3d89c': { from: '#19553E', to: '#2B926A' }, // iUSD
    '0xab5eb14c09d416f0ac63661e57edb7aecdb9befa': { from: '#5885E9', to: '#6DCAEA' }, // msUSD
  },
  [GqlChain.Arbitrum]: {
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': { from: '#F2F3F7', to: '#CECDFE' }, // WETH
    '0x4ce13a79f45c1be00bdabd38b764ac28c082704e': { from: '#F2F3F7', to: '#CECDFE' }, // waArbWETH
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': { from: '#1075E2', to: '#62A8F4' }, // USDC
    '0x7f6501d3b98ee91f9b9535e4b0ac710fb0f9e0bc': { from: '#0077DC', to: '#C14EA9' }, // waArbUSDCn
    '0xa6d12574efb239fc1d2099732bd8b5dc6306897f': { from: '#27A17C', to: '#42EBB8' }, // waArbUSDT
    '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': { from: '#3357FF', to: '#3357FF' }, // WBTC
    '0x912ce59144191c1204e64559fe8253a0e49e6548': { from: '#FF33A1', to: '#FF33A1' }, // ARB
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#A133FF', to: '#A133FF' }, // DAI
    '0xba5ddd1f9d7f570dc94a51479a000e3bce967196': { from: '#817DFD', to: '#CECDFE' }, // AAVE
    '0xd089b4cb88dacf4e27be869a00e9f7e2e3c18193': { from: '#28D358', to: '#9AF9B5' }, // waArbGHO
    '0x0c06ccf38114ddfc35e07427b9424adcca9f44f8': { from: '#0070AD', to: '#05A6FF' }, // EURe
    '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8': { from: '#FE856C', to: '#FFC5A8' }, // rETH
  },
  [GqlChain.Base]: {
    '0x4200000000000000000000000000000000000006': { from: '#F2F3F7', to: '#CECDFE' }, // WETH
    '0xe298b938631f750dd409fb18227c4a23dcdaab9b': { from: '#F2F3F7', to: '#CECDFE' }, // waBasWETH
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { from: '#1075E2', to: '#62A8F4' }, // USDC
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#33FF57', to: '#33FF57' }, // DAI
    '0x853d955acef822db058eb8505911ed77f175b99e': { from: '#3357FF', to: '#3357FF' }, // FRAX
    '0x5a98fcbea516cf06857215779fd812ca3bef1b32': { from: '#FF33A1', to: '#FF33A1' }, // LDO
    '0x88b1cd4b430d95b406e382c3cdbae54697a0286e': { from: '#28D358', to: '#9AF9B5' }, // waBasGHO
    '0xc768c589647798a6ee01a91fde98ef2ed046dbd6': { from: '#2775CA', to: '#2775CA' }, // waBasUSDC
    '0xc694a91e6b071bf030a18bd3053a7fe09b6dae69': { from: '#F2CF18', to: '#F7E069' }, // COW
    '0xfd28f108e95f4d41daae9dbfff707d677985998e': { from: '#A695FA', to: '#9F75FB' }, // PRL
    '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf': { from: '#045CE3', to: '#3784FB' }, // cbBTC
    '0xb6fe221fe9eef5aba221c348ba20a1bf5e73624c': { from: '#FE856C', to: '#FFC5A8' }, // rETH
  },
  [GqlChain.Avalanche]: {
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7': { from: '#FF5733', to: '#FF5733' }, // WAVAX
    '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664': { from: '#1075E2', to: '#62A8F4' }, // USDC.e
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e': { from: '#1075E2', to: '#62A8F4' }, // USDC
    '0x1f0570a081fee0e4df6eac470f9d2d53cdeda1c5': { from: '#1075E2', to: '#62A8F4' }, // Gami-USDC
    '0x39de0f00189306062d79edec6dca5bb6bfd108f9': { from: '#1075E2', to: '#62A8F4' }, // eUSDC-2
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#FF33A1', to: '#FF33A1' }, // DAI
    '0xa446938b0204aa4055cdfed68ddf0e0d1bab3e9e': { from: '#27A17C', to: '#42EBB8' }, // eUSDT-3
    '0x51b47b3013863c52ca28d603de3c2d7a5fef50b9': { from: '#A75CF6', to: '#39A9F5' }, // eweETH-1
    '0xdfd2b2437a94108323045c282ff1916de5ac6af7': { from: '#F2F3F7', to: '#CECDFE' }, // waAvaWETH
    '0x2d324fd1ca86d90f61b0965d2db2f86d22ea4b74': { from: '#F8931A', to: '#F99D2F' }, // waAvaBTC.b
    '0x6c7d727a0432d03351678f91faa1126a5b871df5': { from: '#C55418', to: '#FDDB6F' }, // SolvBTC.AVAX
    '0xbc78d84ba0c46dfe32cf2895a19939c86b81a777': { from: '#FDDB6F', to: '#D88B2C' }, // SolvBTC
    '0x9ee1963f05553ef838604dd39403be21cef26aa4': { from: '#AC96FF', to: '#7E00FF' }, // USDp
  },
  [GqlChain.Fantom]: {
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75': { from: '#FF5733', to: '#FF5733' }, // USDC
    '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e': { from: '#33FF57', to: '#33FF57' }, // DAI
    '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83': { from: '#3357FF', to: '#3357FF' }, // WFTM
  },
  [GqlChain.Gnosis]: {
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#FF5733', to: '#FF5733' }, // DAI
    '0x4e15361fd6b4bb609fa63c81a2be19d873717870': { from: '#33FF57', to: '#33FF57' }, // FTM
    '0x9c58bacc331c9aa871afd802db6379a98e80cedb': { from: '#00132A', to: '#002A5C' }, // GNO
    '0x57f664882f762fa37903fc864e2b633d384b411a': { from: '#F2F3F7', to: '#CECDFE' }, // waGnoWETH
    '0x6c76971f98945ae98dd7d4dfca8711ebea946ea6': { from: '#00A3FF', to: '#99DAFF' }, // wstETH
    '0x773cda0cade2a3d86e6d4e30699d40bb95174ff2': { from: '#00A3FF', to: '#99DAFF' }, // waGnowstETH
    '0xaf204776c7245bf4147c2612bf6e5972ee483701': { from: '#81C24D', to: '#57B14E' }, // sDAI
    '0x4ecaba5870353805a9f068101a40e0f32ed605c6': { from: '#27A17C', to: '#42EBB8' }, // USDT
    '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0': { from: '#1075E2', to: '#62A8F4' }, // USDC.e
    '0x51350d88c1bd32cc6a79368c9fb70373fb71f375': { from: '#1075E2', to: '#62A8F4' }, // waGnoUSDCe
    '0xf0e7ec247b918311afa054e0aedb99d74c31b809': { from: '#1075E2', to: '#62A8F4' }, // waUSDCn
    '0x58d9acac48a4077e4909181c48decd00e5ba5de4': { from: '#28D358', to: '#9AF9B5' }, // waGnoGHO
  },
  [GqlChain.Optimism]: {
    '0x4200000000000000000000000000000000000042': { from: '#FF5733', to: '#FF5733' }, // OP
    '0x7f5c764cbc14f9669b88837ca1490cca17c31607': { from: '#33FF57', to: '#33FF57' }, // USDC
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#3357FF', to: '#3357FF' }, // DAI
    '0x464b808c2c7e04b07e860fdf7a91870620246148': { from: '#F2F3F7', to: '#CECDFE' }, // waOptWETH
    '0x9bcef72be871e61ed4fbbc7630889bee758eb81d': { from: '#FE856C', to: '#FFC5A8' }, // rETH
  },
  [GqlChain.Polygon]: {
    '0x0000000000000000000000000000000000001010': { from: '#FF5733', to: '#FF5733' }, // MATIC
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': { from: '#F2F3F7', to: '#CECDFE' }, // WETH
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#3357FF', to: '#3357FF' }, // DAI
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6': { from: '#F09242', to: '#F09242' }, // WBTC
    '0xdf7837de1f2fa4631d716cf2502f8b230f1dcc32': { from: '#00CCFF', to: '#66E0FF' }, // TEL
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { from: '#1075E2', to: '#62A8F4' }, // USDC
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': { from: '#1075E2', to: '#62A8F4' }, // USDC
  },
  [GqlChain.Zkevm]: {
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#FF5733', to: '#FF5733' }, // DAI
  },
  [GqlChain.Sepolia]: {
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#FF5733', to: '#FF5733' }, // DAI
  },
  [GqlChain.Mode]: {
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#FF5733', to: '#FF5733' }, // DAI
  },
  [GqlChain.Fraxtal]: {
    '0x853d955acef822db058eb8505911ed77f175b99e': { from: '#FF5733', to: '#FF5733' }, // FRAX
  },
  [GqlChain.Hyperevm]: {
    '0x5555555555555555555555555555555555555555': { from: '#DBFCF5', to: '#89F5DE' }, // WHYPE
    '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb': { from: '#27A17C', to: '#42EBB8' }, // USDT0
    '0x3bcc0a5a66bb5bdceef5dd8a659a4ec75f3834d8': { from: '#27A17C', to: '#42EBB8' }, // MC_USDT0
    '0xd3a9cb7312b9c29113290758f5adfe12304cd16a': { from: '#4582A3', to: '#82B1CA' }, // mcUSR
    '0x0a3d8466f5de586fa5f6de117301e2f90bcc5c48': { from: '#FF9301', to: '#FFC980' }, // RLP
    '0xca79db4b49f608ef54a5cb813fbed3a6387bc645': { from: '#000000', to: '#262626' }, // USDXL
    '0xdc6f4239c1d8d3b955c06cb8f1a6cf18effc5bfe': { from: '#95F4DD', to: '#16D0A3' }, // stathyUSD₮0
  },
  [GqlChain.Sonic]: {
    '0x2d0e0814e62d80056181f5cd932274405966e4f0': { from: '#FE0103', to: '#FF6667' }, // BEETS
    '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38': { from: '#000000', to: '#222222' }, // wS
    '0xe5da20f15420ad15de0fa650600afc998bbe3955': { from: '#FE0103', to: '#840D11' }, // stS
    '0x016c306e103fbf48ec24810d078c65ad13c5f11b': { from: '#000000', to: '#333333' }, // SiloWS
    '0x0c4e186eae8acaa7f7de1315d5ad174be39ec987': { from: '#ADDCEB', to: '#DEF1F7' }, // anS
    '0x50c42deacd8fc9773493ed674b675be577f2634b': { from: '#F2F3F7', to: '#CECDFE' }, // WETH
    '0x3bce5cb273f0f148010bbea2470e7b5df84c7812': { from: '#A765DE', to: '#808FC7' }, // scETH
  },
  [GqlChain.Plasma]: {
    '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb': { from: '#27A17C', to: '#42EBB8' }, // USDT0
    '0xe0126f0c4451b2b917064a93040fd4770d6774b5': { from: '#27A17C', to: '#42EBB8' }, // waPlaUSDT0
    '0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2': { from: '#F5F5F5', to: '#BABABA' }, // sUSDe
    '0xc63f1a8c0cd4493e18f6f3371182be01ce0bef02': { from: '#000000', to: '#222222' }, // waPlaUSDe
    '0xa047fdfb3420a27a5f926735b475fe5a1e968786': { from: '#F2F3F7', to: '#CECDFE' }, // waPlaWETH
    '0xa3d68b74bf0528fdd07263c60d6488749044914b': { from: '#A75CF6', to: '#39A9F5' }, // weETH
    '0x0b2b2b2076d95dda7817e785989fe353fe955ef9': { from: '#01615B', to: '#C2FFF2' }, // sUSDai
    '0x0a1a1a107e45b7ced86833863f482bc5f4ed82ef': { from: '#C2FFF2', to: '#01615B' }, // USDai
    '0x6100e367285b01f48d07953803a2d8dca5d19873': { from: '#163029', to: '#367766' }, // WXPL
    '0x6eaf19b2fc24552925db245f9ff613157a7dbb4c': { from: '#00AEEC', to: '#61D5FF' }, // xUSD
  },
  [GqlChain.Monad]: {
    '0x3bd359c1119da7da1d913d1c4d2b7c461115433a': { from: '#6E54FF', to: '#DDD7FE' }, //  WMON
    '0x754704bc059f8c67012fed69bc8a327a5aafb603': { from: '#1075E2', to: '#62A8F4' }, //  USDC
    '0x8d5c2df3eef09088fcccf3376d8ecd0dd505f642': { from: '#1075E2', to: '#62A8F4' }, //  wnUSDC
    '0xe7cd86e13ac4309349f30b3435a9d337750fc82d': { from: '#27A17C', to: '#42EBB8' }, //  USDT0
    '0x4e8aaecce10ad9394e96fe5f2bd4e587a7b04298': { from: '#27A17C', to: '#42EBB8' }, //  wnUSDT0
    '0x10aeaf63194db8d453d4d85a06e5efe1dd0b5417': { from: '#00A3FF', to: '#99DAFF' }, //  wstETH
    '0x0555e30da8f98308edb960aa94c0db47230d2b9c': { from: '#F09242', to: '#F09242' }, //  WBTC
    '0x00000000efe302beaa2b3e6e1b18d08d69a9012a': { from: '#9F9545', to: '#C9C183' }, //  AUSD
    '0x82c370ba90e38ef6acd8b1b078d34fd86fc6bac9': { from: '#9F9545', to: '#C9C183' }, //  wnAUSD
    '0x484be0540ad49f351eaa04eeb35df0f937d4e73f': { from: '#3BD200', to: '#70FF38' }, //  syzUSD
    '0x08139339dd9a480ceb84d9c7cce48be436db20b3': { from: '#00F2E2', to: '#7553FF' }, //  wnSMON
    '0xa3227c5969757783154c60bf0bc1944180ed81b9': { from: '#00F2E2', to: '#7553FF' }, //  sMON
    '0xdb39a9d4a1f1b4e93a5684d602207628ad60613c': { from: '#7355FF', to: '#B3A3FF' }, //  wnWMON
    '0xad96c3dffcd6374294e2573a7fbba96097cc8d7c': { from: '#EBCDFF', to: '#A600BB' }, //  DUST
    '0x1b68626dca36c7fe922fd2d55e4f631d962de19c': { from: '#5246F0', to: '#6E46F0' }, //  shMON
    '0x5e073494678fb7fa4a05bb17d45941dd9dc469c1': { from: '#5246F0', to: '#6E46F0' }, //  wnSHMON
    '0x8498312a6b3cbd158bf0c93abdcf29e6e4f55081': { from: '#F87600', to: '#FFAC61' }, //  gMON
    '0x29d2075e5151b1a6863bdc40ea86bd5e8afd1705': { from: '#F87600', to: '#FFAC61' }, //  wnGMON
    '0x4917a5ec9fcb5e10f47cbb197abe6ab63be81fe8': { from: '#001E5E', to: '#003EC2' }, //  AZND
    '0xd786f7569c39a9f64e6a54eb77db21364e90f279': { from: '#FEFFFF', to: '#8FB4FF' }, //  wnLOAZND
  },
  [GqlChain.Xlayer]: {
    '0x1e4a5963abfd975d8c9021ce480b42188849d41d': { from: '#27A17C', to: '#42EBB8' }, // USDT,
    '0x779ded0c9e1022225f8e0630b35a9b54be713736': { from: '#27A17C', to: '#42EBB8' }, // USDT0,
    '0x74b7f16337b8972027f6196a17a631ac6de26d22': { from: '#1075E2', to: '#62A8F4' }, // USDC,
    '0x5a77f1443d16ee5761d310e38b62f77f726bc71c': { from: '#F2F3F7', to: '#CECDFE' }, // WETH,
  },
}

const DEFAULT_TOKEN_COLORS: TokenColorDef[] = [
  { from: '#1E4CF1', to: '#00FFAA' },
  { from: '#B2C4DB', to: '#FDFDFD' },
  { from: '#EF4A2B', to: '#F48975' },
  { from: '#FFD600', to: '#F48975' },
  { from: '#9C68AA', to: '#C03BE4' },
  { from: '#FFBD91', to: '#FF957B' },
  { from: '#30CEF0', to: '#02A2FE' },
  { from: '#FFDD00', to: '#FFF5B2' },
  { from: '#FF07A4', to: '#FF9EDB' },
  { from: '#039241', to: '#96FDC3' },
  { from: '#001B7D', to: '#1448FF' },
  { from: '#871500', to: '#F02600' },
  { from: '#EA6200', to: '#FFB885' },
  { from: '#AAAAAA', to: '#666666' },
  { from: '#D4FF00', to: '#EEFF99' },
  { from: '#510A94', to: '#8614F0' },
]

const defaultColor: TokenColorDef = { from: '#30CEF0', to: '#02A2FE' }

export function getTokenColor(
  chain: GqlChain | number,
  address: Address,
  i?: number
): TokenColorDef {
  const normalizedAddress = address.toLowerCase() as Address
  const normalizedChain = typeof chain === 'number' ? getGqlChain(chain) : chain
  const defaultColorIndex = i === undefined ? getRandomInt(0, 15) : i

  return (
    (tokenColors[normalizedChain] && tokenColors[normalizedChain][normalizedAddress]) ||
    DEFAULT_TOKEN_COLORS[defaultColorIndex] ||
    defaultColor
  )
}

export function getCssTokenColor(chain: GqlChain | number, address: Address, i: number) {
  const color = getTokenColor(chain, address, i)
  return `linear-gradient(180deg, ${color.from} 0%, ${color.to} 100%)`
}
