'use client'

import Link from 'next/link'
import { Container, Divider, Box } from '@chakra-ui/react'
import { Prose } from '@nikolovlazar/chakra-ui-prose'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useEffect } from 'react'

export default function Privacy() {
  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location
      if (hash) {
        const id = hash.substring(1)
        const element = document.getElementById(id)
        element?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // Run on initial load
    handleHashChange()
  }, [])

  return (
    <Container p="0">
      <Prose>
        <div>
          <FadeInOnView>
            <Box mt="3xl" pb="md">
              <h1>Risks of using&nbsp;Beets</h1>
              <p>
                <em>Last Updated: July 2025</em>
              </p>
              <p>
                <em>
                  There are many inherent risks developers accept when working in DeFi and using the
                  Beets Protocol. This page aims to summarize the top risks to help you with your
                  risk decisions. It is important to note that this list is not exhaustive, and
                  there may be additional risks not explicitly mentioned here. As the risk
                  environment is fluid, we expect to periodically update this summary.
                </em>
              </p>
            </Box>
          </FadeInOnView>

          <FadeInOnView>
            <div className="subsection">
              <nav className="nav">
                <h2>Contents</h2>

                <h3>Liquidity Provider risks</h3>

                <ul>
                  <li>
                    <Link href="risks#general" scroll>
                      <h6>General risks</h6>
                    </Link>
                    <ul>
                      <li>
                        <Link href="risks#smart-contract-risk">Smart contract risk</Link>
                      </li>
                      <li>
                        <Link href="risks#economic-risk">Mechanism / economic risk</Link>
                      </li>
                      <li>
                        <Link href="risks#toxic-token-risk">Toxic token risk</Link>
                      </li>
                      <li>
                        <Link href="risks#composability-risk">DeFi composability risk</Link>
                      </li>
                      <li>
                        <Link href="risks#governance-risk">DAO Governance risk</Link>
                      </li>
                      <li>
                        <Link href="risks#flash-loans-risk">Flash Loans risk</Link>
                      </li>
                      <li>
                        <Link href="risks#mutable-attributes-risk">
                          Mutable pool attributes risk
                        </Link>
                      </li>
                      <li>
                        <Link href="risks#join-exit-risk">Join/exit risk</Link>
                      </li>
                      <li>
                        <Link href="risks#impermanent-loss-risk">Impermanent loss risk</Link>
                      </li>
                      <li>
                        <Link href="risks#hooks-risk">Hooks risk</Link>
                      </li>
                      <li>
                        <Link href="risks#ui-risk">User Interface risk</Link>
                      </li>
                      <li>
                        <Link href="risks#regulatory-risk">Regulatory risk</Link>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <Link href="risks#pool-type-risks">
                      <h6>Pool type risks</h6>
                    </Link>
                    <ul>
                      <li>
                        <Link href="risks#weighted-pools">Weighted Pools</Link>
                      </li>
                      <li>
                        <Link href="risks#stable-pools">Stable Pools</Link>
                      </li>
                      <li>
                        <Link href="risks#composable-pools">Composable Stable Pools</Link>
                      </li>
                      <li>
                        <Link href="risks#boosted-pools">Boosted Pools</Link>
                      </li>
                      <li>
                        <Link href="risks#stablesurge-hook">StableSurge Hook</Link>
                      </li>
                      <li>
                        <Link href="risks#concentrated-liquidity-pools">
                          Concentrated Liquidity Pools
                        </Link>
                      </li>
                      <li>
                        <Link href="risks#reclamm">
                          ReCLAMM - Readjusting Concentrated Liquidity AMM
                        </Link>
                      </li>
                      <li>
                        <Link href="risks#btf">Blockchain Traded Funds</Link>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <Link href="risks#network-risks">
                      <h6>Layer 2 network risks</h6>
                    </Link>
                    <ul>
                      <li>
                        <Link href="risks#optimism">Optimism</Link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              <h2>Risks for Liquidity Providers (LPs)</h2>
              <h3 className="anchor" id="general">
                General risks
              </h3>
              <h4 className="anchor" id="smart-contract-risk">
                Smart contract risk
              </h4>
              <p>
                Smart contract risk is a general risk when using DeFi protocols, including Balancer.
                Smart contracts are self-executing pieces of code that run on certain blockchains,
                like Ethereum. Although they are designed to be secure, they can be vulnerable to
                bugs and exploits.
              </p>
              <p>
                If there is a flaw in the smart contract code, it can be exploited by attackers to
                steal funds from the protocol. This can result in the loss of funds for liquidity
                providers and swappers who are using the protocol. Smart contract risk is a major
                risk for all DeFi users, and it is important to carefully evaluate the security of
                the protocols before using them.
              </p>
              <h5>The Balancer Vault</h5>
              <p>
                The main architectural change between Balancer V1 and Balancer V2 is the transition
                to&nbsp;a single vault that holds and manages all the assets added by all Balancer
                pools. This separates the AMM logic from the token management and accounting. Token
                management/accounting is done by the vault while the AMM logic is individual to each
                pool. This provides many advantages, including flexibility and gas efficiency.
              </p>
              <p>
                One critique of this approach is that the Balancer Vault could be a single point of
                failure—i.e. hack the vault, get all the tokens of the protocol. This Balancer Vault
                architecture was heavily audited prior to launch and has now been battle-tested
                since May 2021, securing over $3b. It has also been forked by other teams across
                different networks, including Beets on Sonic, without issue.
              </p>
              <h5>How does Balancer work to mitigate this risk?</h5>
              <ul>
                <li>
                  Development teams have engaged with top tier smart contract auditing firms to
                  identify and fix bugs before deployment.
                </li>
                <li>
                  The core of Balancer smart contracts are immutable and do not use proxies or other
                  upgrade mechanisms. Note: Within DeFI, upgradable contracts are a major way
                  exploits have been introduced.
                </li>
                <li>
                  In addition, Balancer has a bug bounty program via{' '}
                  <a href="https://immunefi.com/bounty/balancer/">Immunefi</a> to attract white-hat
                  hackers to responsibly disclose any bugs. Rewards are distributed based on threat
                  level—for critical smart contract vulnerabilities, there is a minimum reward of
                  250 ETH and a maximum reward of 1,000 ETH.
                </li>
              </ul>
              <h5>How can LPs mitigate this risk?</h5>
              <ul>
                <li>
                  LPs should carefully research and use DeFi protocols that are battle-tested with a
                  history of functioning as intended, while securing large amounts of assets.
                </li>
                <li>
                  To diversify risk, LPs may consider not placing all their tokens into a single
                  protocol.
                </li>
              </ul>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection anchor" id="economic-risk">
              <h4>Mechanism / Economic risk</h4>
              <p>
                An mechanism or economic exploit of a DeFi protocol occurs when an attacker is able
                to manipulate the economic incentives of the protocol to their advantage, resulting
                in a loss of funds for other participants. This can happen even when there are no
                smart contract bugs or other unintended logic errors.
              </p>
              <p>
                For example, an attacker could take advantage of a liquidity pool&apos;s pricing
                mechanism to intentionally cause the price of an asset to deviate from its true
                value, allowing them to buy or sell that asset at a profit.
              </p>
              <p>
                In addition, the composable nature of DeFi means that a pool on Balancer may contain
                tokens that may be manipulated by an attacker on a third party protocol, which
                further increases risk.
              </p>
              <p>These types of economic exploits are difficult to detect and prevent.</p>
              <h5>How does Balancer work to mitigate this risk?</h5>
              <ul>
                <li>
                  Balancer strives to deliver careful economic modeling, rigorous mechanism design,
                  testing and audits by top tier auditing firms.
                </li>
              </ul>
              <h5>How can LPs mitigate this risk?</h5>
              <ul>
                <li>
                  LPs should carefully research and use DeFi platforms that are battle-tested with a
                  history of functioning as intended, while securing large amounts of assets.
                </li>
              </ul>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection anchor" id="toxic-token-risk">
              <h4>Toxic pool token risk</h4>
              <p>
                A liquidity pool is only as good as its weakest token. This is because liquidity
                pools typically sell the winners (tokens moving up in price) and accumulate the
                losers (tokens moving down in price). If a pool contains a toxic token, the value of
                the BPT (LP tokens) of the liquidity pool could go to zero. This is the case even if
                the other pool tokens remain good and would otherwise not be affected.
              </p>
              <p>
                A toxic token could be seeded into a liquidity pool by a malicious pool creator or
                an otherwise good token could become toxic (similar to Terra&rsquo;s stablecoin{' '}
                <code>UST</code>).
              </p>
              <h5>Tokens that could become problematic for LPs:</h5>

              <ul>
                <li>
                  Unsupported tokens on Balancer Protocol, including:
                  <ul>
                    <li>
                      <Link href="risks#rebasing-tokens">
                        <span>Rebasing tokens</span>
                      </Link>
                    </li>
                    <li>Tokens with transfer fees</li>
                    <li>Proxy tokens with double entry points</li>
                    <li>Tokens with more than 18 decimal points</li>
                    <li>Rebasing tokens</li>
                  </ul>
                </li>

                <li>
                  Tokens that become toxic, including:
                  <ul>
                    <li>Tokens that are infinitely minted</li>
                    <li>Tokens that become frozen or exploited in any other way</li>
                    <li>Stablecoins that lose their peg</li>
                  </ul>
                </li>
              </ul>
              <h5 className="anchor" id="rebasing-tokens">
                Rebasing tokens
              </h5>
              <p>
                Rebasing tokens are a type of cryptocurrency that adjusts the supply of the token
                based on a predetermined formula. This formula is usually designed to keep the price
                of the token stable relative to some external metric, such as the price of a
                particular asset or a specific index. When the external metric changes, the token
                supply is adjusted, which in turn affects the price of the token.
              </p>
              <p>
                For example, if a rebasing token is designed to maintain a price of $1 per token and
                the price of the external asset goes up by 10%, the token supply would decrease by
                10% to maintain the $1 price point. Similarly, if the external asset price goes down
                by 10%, the token supply would increase by 10%.
              </p>
              <p>
                Some examples of rebasing tokens include <code>stETH</code> and
                <code>AMPL</code>.
              </p>
              <p>
                Unfortunately, rebasing tokens generally don&rsquo;t work well in liquidity pools
                since LPs may suffer losses when rebasing occurs.
              </p>

              <h5>How does Balancer mitigate these risks?</h5>
              <ul>
                <li>
                  Since the Balancer protocol is permissionless, anyone can create a liquidity pool
                  composed of any ERC-20 token. This makes this type of risk difficult to mitigate.
                </li>
                <li>
                  The Balancer App UI may be updated to exclude blacklisted tokens and pools but LPs
                  should not rely on this.
                </li>
                <li>
                  Instead of including tokens which rebase, new DeFi liquidity pool compatible
                  wrapped tokens which do not rebase may be utilized. An example of this is{' '}
                  <code>wstETH</code>
                  —a wrapped token which includes the accumulated yield from Lido ETH staking and
                  does not rebase like
                  <code>stETH</code>.
                </li>
                <li>
                  For Balancer Managed Pools, a novel feature called &lsquo;circuit breakers&rsquo;
                  has been designed to halt swapping if there is a large, uncorrelated drop in a
                  token&rsquo;s value.
                </li>
                <li>
                  New pools have a &lsquo;recovery mode&rsquo; which can be enabled by the Emergency
                  DAO Multisig. Pools in recovery mode provide a simple way for LPs to exit the pool
                  proportionally at the cost of disabling protocol fees (swaps, joins etc still
                  work).
                </li>
              </ul>

              <h5>How can LPs mitigate these risks?</h5>
              <ul>
                <li>
                  LPs should carefully check each pool constituent token and understand its specific
                  risks.
                </li>
                <li>
                  LP&rsquo;s should review all pool tokens before providing liquidity to ensure no
                  constituent pool tokens are unsupported by the Balancer Protocol (e.g. rebasing
                  tokens).
                </li>
                <li>
                  LPs should carefully check the pool creator address to verify it&rsquo;s from a
                  reliable actor.
                </li>
              </ul>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              <h4 className="anchor" id="composability-risk">
                DeFi composability risks
              </h4>
              <p>
                DeFi composability refers to the ability of different DeFi protocols and
                applications to work together seamlessly in endless combinations, allowing
                developers to create more complex financial transactions and applications. This is
                sometimes referred to as DeFi lego building blocks, since they can be combined and
                connected to created interesting new structures and applications.
              </p>
              <p>
                While composability offers many benefits, layering on protocols and applications on
                top of each other comes with additional risks. For example, risks get compounded
                when multiple protocols are composed together, as a vulnerability in one contract
                could impact others. The interconnectivity of DeFi protocols can amplify risks,
                turning isolated incidents into systemic threats. For example, if a major protocol
                fails or suffers from an exploit, it could lead to a domino effect, impacting other
                protocols and users in the ecosystem.
              </p>
              <p>
                Other risks could cascade if a protocol within a composability stack has a liquidity
                crisis, an unfavorable governance decision or regulatory outcome.
              </p>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              <h4 className="anchor" id="governance-risk">
                DAO Governance risk
              </h4>
              <p>
                Balancer currently uses off-chain voting mechanisms to signal the will of veBAL
                token holders (vote-escrow BAL). This off-chain voting is done via{' '}
                <a href="https://snapshot.org/">Snapshot</a>
                —originally developed in-house by Balancer Labs.
              </p>
              <p>A summary of the immutability of the Balancer Protocol&rsquo;s smart contracts:</p>
              <ul>
                <li>
                  Balancer V1 contracts are immutable, so there were no core protocol parameters
                  that could be changed.
                </li>
                <li>
                  Balancer V2 contracts do allow for some tweaking of core protocol parameters,
                  including the ability to:
                  <ul>
                    <li>
                      Set a share of swap fees to be diverted to the protocol (hard capped at 50% of
                      the swap fee)
                    </li>
                    <li>Set a Flash Loan fee</li>
                    <li>
                      Extract from the vault collected protocol fees and/or excess balances (e.g.
                      airdrops), to any destination
                    </li>
                    <li>Set the address of the oracle implementation</li>
                    <li>
                      Set relayer addresses: relayers are (user opt-in, audited) contracts that can
                      make calls to the vault (with the transaction “sender” being any arbitrary
                      address) and use the sender&rsquo;s ERC20 vault allowance, internal balance or
                      BPTs on their behalf
                    </li>
                    <li>
                      Set dynamic-fee controllers: addresses (initially assigned to Gauntlet) that
                      may change the swap fee for pools created by the dynamic-fee pool factory that
                      will be deployed by Balancer Labs
                    </li>
                    <li>Add and remove veBAL gauges</li>
                  </ul>
                </li>
              </ul>
              <p>
                Note: The system of Balancer Governance may change in the future. For example,
                Balancer community members have expressed interest in moving from the Multisig
                towards on-chain governance execution by veBAL token holders.
              </p>
              <p>
                The main risk with this setup consisting of off-chain voting executed by MultiSigs:
              </p>
              <ul>
                <li>
                  The{' '}
                  <a href="https://docs.balancer.fi/concepts/governance/multisig.html#dao-multisig-signer-set">
                    Multisig signer set
                  </a>{' '}
                  could go rogue and disregard the decision made by veBAL holders in the off-chain
                  voting.
                </li>
                <li>
                  The{' '}
                  <a href="https://docs.balancer.fi/concepts/governance/multisig.html#dao-multisig-signer-set">
                    Multisig signer set
                  </a>{' '}
                  could mistakenly execute the wrong instruction without malice.
                </li>
                <li>
                  An individual or an entity could acquire substantial veBAL and vote against the
                  interests of the majority of the community.
                </li>
              </ul>
              <h5>How Balancer aims to mitigate this risk:</h5>
              <ul>
                <li>
                  The core of Balancer smart contracts are immutable and do not use proxies or other
                  upgrade mechanisms. Only parameters, which are considered to be less
                  &lsquo;dangerous&rsquo; may be tweaked.
                </li>
                <li>
                  The Multisig does&nbsp;not&nbsp;have custody of, nor control over, funds from
                  liquidity providers locked inside Balancer Protocol contracts. Balancer V2 was
                  designed so that even if a multisig goes rogue, all the liquidity is safe and can
                  be withdrawn by their rightful owners.
                </li>
              </ul>
              <h5>How LPs can mitigate this risk:</h5>
              <ul>
                <li>
                  LPs should stay up to date with Balancer Governance by following discussions on
                  the forum and participating in the off-chain voting.
                </li>
                <li>
                  LPs may review past votes and verify that the DAO Multisig has executed outcomes
                  accurately.
                </li>
              </ul>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              <h4 className="anchor" id="flash-loans-risk">
                Flash Loans risk
              </h4>
              <p>
                A Flash Loan is a type of loan where a user borrows assets with no upfront
                collateral and returns the borrowed assets within the same blockchain transaction.
                Flash Loans use smart contracts which requires that a borrower repays the loan
                before the transaction ends. They are typically used for arbitrage opportunities,
                collateral swaps and to lower transaction fees, across potentially multiple
                protocols. It&rsquo;s a powerful new financial primitive, native to DeFi.
              </p>
              <p>Flash Loans may be used on Balancer and interact with the Balancer Vault.</p>
              <p>
                While Flash Loans offer many benefits, they also comes with certain risks. Flash
                Loans have also been used for multiple DeFi exploits resulting in losses worth
                millions of dollars. Flash Loan exploits are relatively new with the full range of
                attack surfaces still being discovered.
              </p>
              <h5>How Balancer aims to mitigate this risk:</h5>
              <ul>
                <li>The Balancer Vault is non-reentrant, which blocks most Flash Loan attacks.</li>
                <li>
                  Balancer strives to deliver careful economic modeling, rigorous mechanism design,
                  testing and audits by top tier auditing firms.
                </li>
              </ul>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              <h4 className="anchor" id="mutable-attributes-risk">
                Mutable pool attributes
              </h4>
              <p>
                Balancer is a flexible AMM that allows people to create different types of liquidity
                pools, including those with immutable and/or mutable pool attributes.
              </p>
              <p>
                For pools with immutable attributes, LPs can be assured that the rules are designed
                so they cannot change once they have provided liquidity since no pool attribute
                should be changed by anyone at any time.
              </p>
              <p>For pools with mutable attributes, LPs should understand:</p>
              <ul>
                <li>
                  Which attributes can change
                  <ul>
                    <li>
                      Certain attributes being mutable provide more risk than others. For example,
                      changing the swap fee percentage is generally viewed as less risky than the
                      ability to change the constituent tokens of a pool, since a malicious editor
                      could introduce a toxic pool token.
                    </li>
                  </ul>
                </li>
                <li>
                  Who can change each attribute
                  <ul>
                    <li>
                      On Balancer pools, if an attribute is editable, the address that can make the
                      edit is also specified. The two most common parties that are set to be able to
                      change pool attributes are either the Pool Owner or Balancer Governance.
                    </li>
                  </ul>
                </li>
              </ul>
              <h5>How does Balancer work to mitigate this risk?</h5>
              <ul>
                <li>
                  For known pool types, the Balancer App UI transparently displays pool attributes
                  and specifies if it is editable and if so, by whom.
                </li>
                <li>
                  Balancer Managed Pools are designed to have mutable attributes that can be changed
                  by the Pool Owner. For certain &lsquo;dangerous operations&rsquo;, there are
                  &lsquo;timelock delays&rsquo; which give LPs a period to review the proposed
                  changes and withdraw funds if they do not agree with the change. In addition, Pool
                  Controllers can set a guardian who has the ability to veto a proposed change from
                  the Pool Owner if they believe it to be a malicious change or a mistake.
                </li>
              </ul>
              <h5>How can LPs mitigate this risk?</h5>
              <ul>
                <li>
                  LPs should check to see the edibility of pool attributes and understand who can
                  authorize any changes.
                </li>
              </ul>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              <h4 className="anchor" id="join-exit-risk">
                Loss of funds on join/exit of a pool
              </h4>
              <h5>Due to high price impact</h5>
              <p>
                When joining a pool, LPs should be aware of the price impact from adding tokens to
                the pool. In general, adding liquidity in proportional amounts to the token weights
                of the pool incur low price impact. Adding custom token amounts (non-proportionally)
                causes the internal prices of the pool to change, as if you were swapping tokens.
                The higher the price impact the more you&apos;ll spend in swap fees.
              </p>
              <h5>Due to slippage</h5>
              <p>
                LPs should also consider the effect of slippage when adding liquidity to a pool.
                Slippage occurs when market conditions change between the time your order is
                submitted and the time it gets executed on Ethereum. Slippage tolerance is the
                maximum change in price you are willing to accept.
              </p>
              <p>
                Slippage tolerance is a setting in both the Add/Remove liquidity flows on the
                Balancer App UI. Setting a low slippage tolerance protects you from front-running
                bots and miner extractable value (MEV).
              </p>
              <h5>Due to high Gas fees</h5>
              <p>
                Gas on the Ethereum network refers to the unit that measures the amount of
                computational effort required to execute specific operations. Gas fees in Ethereum
                are the transaction costs users pay to have their transactions processed and
                validated by the network&apos;s miners. Gas fees vary depending on network
                congestion, transaction complexity, and the amount of gas a user is willing to pay.
              </p>
              <p>
                Gas fees can be particularly high during periods of network congestion. As a result,
                LPs might face increased costs when adding or removing liquidity, making adjustments
                to their positions, or claiming liquidity mining incentives. If the gas fees are
                higher than the returns they get from providing liquidity, LPs may end up with a net
                loss.
              </p>
              <h5>How Balancer aims to mitigate this risk:</h5>
              <ul>
                <li>
                  The Balancer Smart Order router is used to route liquidity efficiently via pools
                  to minimize price impact.
                </li>
                <li>The Balancer App UI gives LP&rsquo;s control over their slippage settings.</li>
                <li>
                  LP&rsquo;s are warned via the Balancer App UI when the price impact is excessive.
                  Once price impact exceeds a certain threshold, the Balancer App UI prevents
                  user&rsquo;s from executing a transaction where they would otherwise get rekt.
                </li>
              </ul>
              <h5>How LP&rsquo;s can mitigate this risk:</h5>
              <ul>
                <li>
                  Users should review their slippage settings and potential price impact before
                  adding or removing liquidity.
                </li>
                <li>
                  Users should also review gas prices and the potential gas fee before any
                  transaction. This information is usually provided by their wallet provider.
                </li>
              </ul>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              <h4 className="anchor" id="impermanent-loss-risk">
                Impermanent loss
              </h4>
              <p>
                Impermanent loss is a risk that liquidity providers (LPs) face when providing
                liquidity to an automated market maker (AMM) like Balancer. It is the difference
                between the value of holding assets in a pool versus holding them outside of the
                pool.
              </p>
              <p>
                If the price of the assets in the pool changes, LPs may experience a loss compared
                to holding the assets outside of the pool. This can happen because the AMM algorithm
                rebalances the pool to maintain a constant ratio of the assets in the pool. If the
                price of one asset increases, the algorithm will sell some of that asset and buy
                more of the other asset to maintain the ratio. This means that LPs will sell the
                asset that is increasing in price and buy the asset that is decreasing in price,
                resulting in a loss.
              </p>
              <p>
                This risk is particularly relevant for pools with volatile assets where token prices
                are likely diverge over time.
              </p>
              <h5>How does Balancer work to mitigate this risk?</h5>
              <ul>
                <li>
                  All AMMs either have impermanent loss or reduced yield to LPs. Balancer aims to
                  make its pools as capital efficient as possible so that the yield LPs make is more
                  likely to exceed any impermanent loss.
                </li>
                <li>
                  The Balancer protocol supports unbalanced pools which LPs can use to reduce
                  impermanent loss. For example, there is lower impermanent loss in an 80/20 pool
                  (or any other unbalanced pools) versus a 50/50 pool with the same underlying
                  tokens.
                </li>
                <li>
                  Note: Some ecosystem developers are building on top of Balancer to create novel
                  pools, including Managed Pools, with rebalancing algorithms designed to minimize
                  impermanent loss.
                </li>
              </ul>
              <h5>How can LPs mitigate this risk?</h5>
              <ul>
                <li>
                  LPs should consider the risk of impermanent risk carefully before providing
                  liquidity to a Balancer pool.
                </li>
                <li>
                  The longer an LP holds their position, the more likely it is that their yield from
                  swap fees offset and exceed any impermanent loss, assuming the price divergence of
                  the token prices isn&rsquo;t extreme.
                </li>
                <li>
                  LPs may consider providing liquidity into pools with less likelihood of token
                  price divergence. For example, stable pools or boosted pools.
                </li>
                <li>
                  LP&rsquo;s should consider providing liquidity in unbalanced pools, like 80/20
                  pools which result in less impermanent loss versus a 50/50 pool with the same
                  underlying tokens.
                </li>
              </ul>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              <h4 className="anchor" id="hooks-risk">
                Hooks
              </h4>
              <p>
                Hooks introduces complex logic into Balancer pools and changes in its parameters can
                significantly impact the risk profile of a pool. This complexity increases the
                potential for unforeseen errors or vulnerabilities in the hook&apos;s code, that may
                i.e. amplify impermanent loss, introduce new sources of volatility or impose
                restrictions on pool interactions like joins and exits.
              </p>
              <ul>
                <li>
                  Hook specific risk: Balancer hooks introduce unique functionalities to Balancer
                  pools, and while they offer exciting possibilities, they also present specific
                  risks that users should be aware of.
                </li>
                <li>
                  Hook Interactions: Hooks can interact with each other and with the pool contracts
                  in unexpected ways. These interactions may lead to unintended and yet unknown
                  consequences or exploits.
                </li>
                <li>
                  Hook Updates: Hooks may be updated or modified over time. These updates could
                  introduce new risks or alter the functionality of the pool in ways that may
                  negatively impact your assets.
                </li>
              </ul>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              <h4 className="anchor" id="ui-risk">
                User Interface (UI) risk
              </h4>
              <p>
                DeFi users, including liquidity providers and swappers, typically interact with
                front-end user interfaces to interact with a protocol&rsquo;s smart contracts. An
                example is the app.balancer.fi front-end UI instance which interacts with Balancer
                Protocol smart contracts.
              </p>

              <p>A few risks of using front-ends to manage liquidity positions in DeFi:</p>
              <ul>
                <li>
                  UIs may not always display timely, accurate data. This may be due to the use of
                  third party data services experiencing periods of downtime or network congestion.
                </li>
                <li>UIs could be maliciously updated or exploited by rogue developers.</li>
                <li>UIs may be updated and remove certain feature sets.</li>
                <li>
                  UIs may block certain wallet addresses or user&rsquo;s in certain jurisdictions to
                  comply with their regulations.
                </li>
                <li>
                  UIs may experience periods of downtime or potentially be discontinued. UIs may
                  also be shut down or have access denied to users in certain jurisdictions.
                </li>
              </ul>

              <h5>How does Balancer work to mitigate this risk?</h5>
              <ul>
                <li>
                  Since the Balancer smart contracts can be interacted with by any front-end UI,
                  there is less reliance on any one single UI. The Balancer App UI code is open
                  source with an MIT License which allow other third party developers to fork the
                  code, make improvements and compete for users.
                </li>
                <li>
                  Users or third party developers can keep track of changes and review the open
                  source repository on the Balancer Github for potential malicious code.
                </li>
                <li>
                  The developers of the Balancer App UI have provided instructions on how to clone
                  and run local environments of the app. This allows people to have the ability to
                  keep deprecated features or modify the code to add new features that they prefer.
                </li>
              </ul>
              <h5>How can LPs mitigate this risk?</h5>
              <ul>
                <li>
                  LP&rsquo;s can learn how to interact with Balancer smart contracts on third party
                  websites, like <a href="https://etherscan.io/">Etherscan</a>.
                </li>
                <li>
                  To mitigate the risks of downtime or lack of access, users can fork the open
                  source code and run their own local instance.
                </li>
              </ul>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              {' '}
              <h4 className="anchor" id="regulatory-risk">
                Regulatory risk
              </h4>
              <p>
                The regulatory frameworks applicable to blockchain transactions in connection with
                tokens and stablecoins are still developing and evolving. In addition, the
                increasing complexity of DeFi applications and their interactions can make it
                difficult to assess and regulate them effectively. This could potentially lead to
                increased regulatory scrutiny or even a regulatory crackdown, which could have
                negative consequences for participants, our efforts to mitigate risks and the entire
                DeFi ecosystem.
              </p>
              <p>
                It&apos;s also possible that the Balancer App UI may be wholly or partially
                suspended or terminated for any or no reason, which may limit your access to your
                tokens via this website. In this scenario, you may be able to recover funds by
                forking the open-source code on{' '}
                <a href="https://github.com/balancer/frontend-v2/">Github</a> and running your own
                local instance, or by using a third party website, like{' '}
                <a href="https://etherscan.io/">Etherscan</a>.
              </p>
            </div>
            <FadeInOnView>
              <Divider />
              <FadeInOnView>
                <div className="subsection">
                  {' '}
                  <h3 className="anchor" id="pool-type-risks">
                    Pool type risks
                  </h3>
                  <p>
                    Balancer is designed to be infinitely extendible to allow for any conceivable
                    pool type with custom curves, logic and parameters, and more. The general risks
                    of the most popular pool types are listed below.
                  </p>
                </div>
              </FadeInOnView>
              <FadeInOnView>
                <div className="subsection">
                  <h4 className="anchor" id="weighted-pools">
                    Weighted Pools
                  </h4>
                  <p>
                    Weighted Pools use{' '}
                    <a href="https://docs.balancer.fi/reference/math/weighted-math.html">
                      Weighted math
                    </a>
                    , which makes them great for general cases, including tokens that don&apos;t
                    necessarily have any price correlation (ex. DAI/WETH). Unlike weighted pools in
                    other AMMs that only provide 50/50 weightings, Balancer Weighted Pools enable
                    users to build pools with more than two tokens and custom weightings, such as
                    pools with 80/20 or 60/20/20 weightings. Some risks of weighted pools include:
                  </p>
                  <ul>
                    <li>
                      Impermanent loss on volatile non-correlated assets
                      <ul>
                        <li>See above for details of impermanent loss risks.</li>
                      </ul>
                    </li>
                    <li>
                      Toxic token risk
                      <ul>
                        <li>
                          Balancer weighted pools are not limited to just having two tokens. The
                          more tokens in a pool, the more risk that one of these could become toxic.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </FadeInOnView>
              <FadeInOnView>
                <div className="subsection">
                  <h4 className="anchor" id="stable-pools">
                    Stable Pools
                  </h4>
                  <h5>Loss of stablecoin peg</h5>
                  <p>
                    Stablecoins are tokens whose value is intended to be pegged or tied to that of
                    another asset, which could be a currency, commodity or financial instrument.
                    There are many types of stablecoins, some are risky than others depending on
                    product design including evidence of reserves to support the peg in times of
                    stress. Some example types of stablecoins include:
                  </p>
                  <ul>
                    <li>
                      Peg is secured by real world reserves
                      <ul>
                        <li>e.g. USDC secured by USD reserves</li>
                      </ul>
                    </li>
                    <li>
                      Peg is secured by other crypto assets
                      <ul>
                        <li>e.g. DAI secured by an over-collateralized basket of crypto assets</li>
                      </ul>
                    </li>
                    <li>
                      Peg is secured by smart contract algorithms
                      <ul>
                        <li>
                          e.g. UST which aimed to be secured by algorithmic rebalances to reflect
                          the peg.
                        </li>
                      </ul>
                    </li>
                  </ul>
                  <p>
                    Depegging occurs when a stablecoin losses its peg to the target asset. In stable
                    pools, if a stablecoin depegs, LPs may incurs losses. This is because liquidity
                    pools typically sell the winners (tokens moving up in price) and accumulate the
                    losers (tokens moving down in price). In the case of a USD-pegged stable pool,
                    if an asset permanently loses it&rsquo;s peg to $1 and goes down in value, the
                    pool will sell any pegged assets and accumulate the asset which has lost
                    it&rsquo;s peg, leading to an overall loss of funds for LPs.
                  </p>
                </div>
              </FadeInOnView>
              <FadeInOnView>
                <div className="subsection">
                  <h4 className="anchor" id="composable-pools">
                    Composable Stable Pools &amp; MetaStable Pools
                  </h4>
                  <p>
                    Composable Stable Pools are designed for assets that are either expected to
                    consistently trade at near parity, or at a known exchange rate. Composable
                    Stable Pools use Stable Math (based on StableSwap, popularized by Curve) which
                    allows for trades of significant size before encountering substantial price
                    impact, vastly increasing capital efficiency for like-kind and correlated-kind
                    swaps. They are ideal for:
                  </p>
                  <ul>
                    <li>
                      Pegged Tokens: Tokens that trade near 1:1, such as two stablecoins of the same
                      currency (eg: DAI, USDC, USDT), or synthetic assets (eg: renBTC, sBTC, WBTC)
                    </li>
                    <li>
                      Correlated Tokens: Tokens that trade near each other with some slowly changing
                      exchange rate, like derivatives (eg: wstETH, wETH)
                    </li>
                  </ul>
                  <p>
                    Note: Composable Stable Pools are a superset of all previous Stable-type pools
                    (Stable Pools, MetaStable Pools, StablePhantom Pools, and StablePool v2) and
                    therefore obsolete all previous pools.
                  </p>
                  <p>
                    Composable Stable Pools (including MetaStable Pools) carry the all of the same
                    risks as stable pools, including the potential depegging of constituent
                    stablecoin tokens. In addition, there are risks associated with the involvement
                    of rate providers.
                  </p>
                  <div>
                    <h5 className="anchor" id="rate-provider-risk">
                      Rate provider risk
                    </h5>
                    <p>
                      Rate Providers are contracts that provide an exchange rate between two assets.
                      These exchange rates can come from any on-chain source, whether that may be an
                      oracle, a ratio of queryable balances, or another calculation.
                    </p>
                    <p>
                      This introduces risks around the rate provider being able to supply accurate
                      and timely exchange rates between pool tokens.
                    </p>
                  </div>

                  <div>
                    <h6>Oracle risk</h6>
                    <p>
                      Oracles are data providers which supply external information to smart
                      contracts. Oracles, like Chainlink, may be used to source exchange rates
                      between pool tokens for a rate provider in Balancer MetaStable pools. The
                      risks of using Oracles to supply exchange rates include:
                    </p>
                    <ul>
                      <li>
                        Data accuracy: Oracles must provide accurate data for DeFi applications to
                        function correctly. Inaccurate data can cause significant issues, such as
                        incorrect pricing or faulty execution of smart contracts.
                      </li>
                      <li>
                        Data availability: If an oracle experiences downtime or fails to update its
                        data feed, the DeFi applications relying on it might not function correctly
                        or become temporarily unusable, leading to potential losses for users.
                      </li>
                      <li>
                        Latency: The time it takes for an oracle to fetch, process, and transmit
                        data to a smart contract can impact the performance and efficiency of DeFi
                        applications. High latency could lead to outdated data or missed
                        opportunities.
                      </li>
                      <li>
                        Oracle manipulation: Bad actors might attempt to manipulate an oracle&apos;s
                        data feed to influence the outcome of a smart contract or profit from price
                        discrepancies. This can lead to unintended consequences, such as
                        liquidations, loss of funds, or arbitrage opportunities for attackers.
                      </li>
                      <li>
                        Centralization risk: If an oracle relies on a centralized data source or a
                        small number of data providers, it becomes a single point of failure. This
                        centralization goes against the core principles of decentralization in the
                        DeFi ecosystem and exposes the system to potential manipulation or downtime.
                      </li>
                      <li>
                        Exploitation of vulnerabilities: Oracles themselves can have security
                        vulnerabilities, which, if exploited, can compromise the entire DeFi system
                        relying on them.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6>Rate provider cross-chain bridge risk</h6>
                    <p>
                      Pools may use rate providers that are bridged between blockchain networks.
                    </p>
                    <p>
                      For example, some pools on Polygon zkEVM use a rate provider that is bridged
                      from Ethereum Mainnet via the Layer Zero (an omnichain messaging service). In
                      these pools, LPs are exposed to risk of significant losses if an incorrect
                      rate is received via the omnichain messaging service.
                    </p>
                  </div>
                </div>
              </FadeInOnView>
              <FadeInOnView>
                <div className="subsection">
                  <h4 className="anchor" id="boosted-pools">
                    Boosted Pools
                  </h4>
                  <p>
                    Typically, only 10% or less of the liquidity deposited into an AMM pool is being
                    utilized by traders because the trade sizes are much smaller than the available
                    liquidity. Boosted Pools allow the remaining portion of liquidity to be sent to
                    lending protocols where the liquidity can earn additional yield for accepting
                    inherent risks.
                  </p>
                  <ul>
                    <li>
                      Boosted Pools are designed to allow for greater capital efficiency, deeper
                      liquidity, and increased yield for Liquidity Providers.
                    </li>
                    <li>
                      For traders, Boosted Pools are a cheaper entry/exit into decentralized lending
                      protocols like Aave.
                    </li>
                    <li>
                      Boosted Pools increase the opportunity for LPs to gain exposure to a wide
                      variety of yield increases from multiple yield protocols.
                    </li>
                  </ul>
                  <h5>Third party platform risk exposure (DeFi composability risk)</h5>
                  <p>
                    Since boosted pools deposit excess liquidity into third-party protocols, like
                    Aave, to generate yield, LPs must fully understand the risks of the underlying
                    protocol since a portion of their funds will be exposed to the risks of that
                    protocol. Some of the risks of the underlying protocol may include smart
                    contract bugs, economic attack vulnerabilities and counterparty risk from the
                    protocol&rsquo;s borrowers. Underlying protocols may also use{' '}
                    <Link href="risks#oracles">
                      <span>Oracles</span>
                    </Link>{' '}
                    which face additional risks (described above).
                  </p>
                  <p>
                    Also note, some boosted pools may use strategies that utilize multiple yield
                    protocols in order to maximize yield. Since these strategies may change exposure
                    to the underlying yield protocols at any time, LPs must accept the risk that the
                    protocol utilizing these strategies carefully vets all third party protocols to
                    reduce composability risks.
                  </p>
                  <p>
                    If the underlying protocol were to get hacked, LPs in a boosted pool that
                    deposits liquidity in that protocol could lose funds.
                  </p>
                  <h5>Depegging risk</h5>
                  <p>
                    Individual stablecoin tokens within Boosted Pools are subject to{' '}
                    <Link href="risks#stable-pools">
                      <span> depegging risks</span>
                    </Link>
                    , as described above.
                  </p>
                </div>
              </FadeInOnView>

              <FadeInOnView>
                <div className="subsection">
                  <h4 className="anchor" id="stablesurge-hook">
                    StableSurge Hook
                  </h4>
                  <p>
                    If a pool is pushed beyond its threshold balance, a surge is initiated,
                    resulting in an increasing tax on sellers who negatively impact the peg of the
                    asset by continuing to push the pool out of balance. On the other hand, the
                    liquidity providers who maintain the risk of being in the pool, earn an
                    increased fee, resulting in higher returns on their position during times of
                    volatility.
                  </p>
                  <p>
                    The directional fee nature of the StableSurge hooks only charges the increased
                    fee on those sellers who are driving the peg further from equilibrium, while
                    those who are buying the underperforming asset are only charged the base fee.
                    This aligns the incentives of the liquidity providers and the project entity,
                    which inherently wants its token to stay as close to the peg as possible.
                  </p>
                  <p>
                    Stable Surge hooks introduces dynamic swap fees designed to protect peg, but may
                    also impact the risk profile of a pool. Please also refer to the{' '}
                    <Link href="risks#hooks-risk">
                      <span>Hooks</span>
                    </Link>{' '}
                    risk section and other{' '}
                    <Link href="risks#general">
                      <span>General</span>
                    </Link>{' '}
                    risks.
                  </p>
                  <ul>
                    <li>
                      Dynamic fee volatility: these fees are not fixed and can change significantly
                      based on several factors, including but not limited to: pool imbalances,
                      market volatility, and the specific configuration of the StableSurge
                      parameters. You may encounter unexpectedly high fees, especially during
                      periods of market stress or when the pool is significantly off-target. While
                      the hook can lead to lower fees, there is no guarantee of consistency, and
                      fees can rapidly increase.
                    </li>
                    <li>
                      Parameter Sensitivity: The performance of the StableSurge hook is highly
                      dependent on the correct configuration of its parameters. Incorrectly
                      configured parameters could lead to unintended consequences, such as
                      excessively high fees, ineffective rebalancing, or even instability in the
                      pool. Changes to these parameters can also significantly alter the pool&apos;s
                      behavior.
                    </li>
                    <li>
                      Rate provider risk: inaccurate or manipulated oracle data could lead to
                      unexpected fee adjustments and potential losses. Rate provider failures or
                      manipulation are inherent risks in decentralized finance. Learn more about
                      rate provider and oracle risks in the{' '}
                      <Link href="risks#composable-pools">
                        <span>Composable Stable Pools</span>
                      </Link>{' '}
                      risk section.
                    </li>
                  </ul>
                </div>
              </FadeInOnView>

              <FadeInOnView>
                <div className="subsection">
                  <h4 className="anchor" id="concentrated-liquidity-pools">
                    Concentrated Liquidity Pools
                  </h4>
                  <p>
                    <a href="https://gyro.finance">Gyroscope&rsquo;s</a>&nbsp; &lsquo;Concentrated
                    Liquidity Pools&rsquo; (CLPs) are a class of AMMs that price the exchange of
                    assets within a defined range. As such, any CLP only provides liquidity for
                    trading activity restricted to this specific region. The goal is to use the
                    pool&rsquo;s capital efficiently. There&rsquo;s a few different types of CLPs:
                  </p>
                  <ul>
                    <li>
                      <em>2-CLPs:</em> Pools with two assets, known as Quadratic-CLPs or 2-CLPs,
                      named after the quadratic invariant curve—are similar to Uniswap v3&rsquo;s
                      concentrated liquidity pools. But unlike Uniswap, a 2-CLP effectively offers a
                      &lsquo;single tick&rsquo;, where liquidity is distributed evenly across a
                      single active trading range. Learn more about{' '}
                      <a href="https://docs.gyro.finance/gyroscope-protocol/concentrated-liquidity-pools/2-clps">
                        2-CLP&rsquo;s and their risks
                      </a>
                      .
                    </li>
                    <li>
                      <em>3-CLPs:</em> Pools with three assets, known as Cubic-CLPs or 3-CLPs,
                      support three assets and are functionally best understood as an extension of
                      2-CLPs. As a high-level summary, they amplify the benefits of 2-CLPs. Learn
                      more about{' '}
                      <a href="https://docs.gyro.finance/gyroscope-protocol/concentrated-liquidity-pools/3-clps">
                        3-CLP&rsquo;s and their risks
                      </a>
                      .
                    </li>
                    <li>
                      <em>E-CLPs:</em> Also known as &lsquo;Elliptic-CLPs&rsquo; support asymmetric
                      concentrated liqudity for two assets. They provide a new type of concentrated
                      liquidity that allows highly flexible and asymmetric liquidity profiles in a
                      single pool position. Learn more about{' '}
                      <a href="https://docs.gyro.finance/gyroscope-protocol/concentrated-liquidity-pools/e-clps">
                        E-CLP&rsquo;s and their risks
                      </a>
                      .
                    </li>
                    <li>
                      <em>Rehype E-CLPs:</em> Arguably the most capital efficient pools, these
                      E-CLPs combine asymmetric concentrated liquidity with auto-rehypothecation to
                      lending markets. Learn more about{' '}
                      <a href="https://docs.gyro.finance/gyroscope-protocol/concentrated-liquidity-pools/rehype-e-clps">
                        Rehype E-CLP&rsquo;s and their risks
                      </a>
                      .
                    </li>
                  </ul>
                  <p>Other risks:</p>
                  <ul>
                    <li>
                      The Balancer UI allows people to manage their liquidity in certain Gyroscope
                      pools. This is not an endorsement of their products or of the the safety of
                      their smart contracts. The Gyroscope GYD system and E-CLPs have been audited
                      several times. You can review the{' '}
                      <a href="https://docs.gyro.finance/gyroscope-protocol/audit-reports">
                        audit reports here
                      </a>
                      .
                    </li>
                    <li>
                      Some concentrated liquidity pools also contain Gyroscope&rsquo;s Gyro Dollars
                      (GYD). Here are some of the{' '}
                      <a href="https://docs.gyro.finance/gyroscope-protocol/risks">
                        risks of using GYD
                      </a>
                      .
                    </li>
                  </ul>
                </div>
              </FadeInOnView>
            </FadeInOnView>
            <FadeInOnView>
              <div className="subsection">
                <h4 className="anchor" id="reclamm">
                  ReCLAMMs
                </h4>
                <p>
                  ReCLAMM (Readjusting Concentrated Liquidity AMM) is a novel pool type built on
                  Balancer, designed to offer concentrated liquidity with self-readjusting price
                  ranges and fungible liquidity. While they aim to reduce the active management
                  burden for LPs, higher swap fees and better capital efficiency when in range, they
                  introduce specific risk.
                </p>
                <ul>
                  <li>
                    <b>Impermanent Loss and Parametrization Risk</b>: ReCLAMMs' self-readjusting
                    ranges aim to keep liquidity active, but impermanent loss remains a core risk
                    that in this case can be potentially exacerbated by suboptimal range, margin and
                    “daily price shift exponent” adjustments. The efficacy of the parameters in the
                    mechanism which replaces manual LP intervention, introduces risks, including
                    (but not limited to): potential for miscalculation, inefficient capital
                    utilization, or exploitability if rebalancing patterns are predictable.
                  </li>
                  <li>
                    <b>Path Dependency Risk</b>: Unlike traditional CFMM (Constant Function Market
                    Makers) where “impermanent” loss can revert by the return of the asset to its
                    original ratio, path-dependant pools are affected by the sequence of price
                    change, meaning the losses incurred to the asset in one side of the pool during
                    certain price fluctuations can become “permanent”.
                  </li>
                  <li>
                    <b>Low liquidity and price manipulation</b>: ReCLAMM is not suitable for great
                    volatility and assets with low liquidity that can be easily exploitable, for the
                    reasons and risks detailed above, where the pool can easily fall out of range
                    and losses can become permanent.
                  </li>
                  <li>
                    <b>Admin Parametrization</b>: By changing the sensitivity and behavior of the
                    pool after deployment, the price range can be narrowed or widened, even if the
                    price range can’t be set directly. The pool admin can: 1) change the
                    centeredness margin (the threshold for updates); 2) change the daily price shift
                    exponent (the speed of updates); and 3) initiate an update to the price interval
                    (i.e., the distance, or ratio, between the minimum and maximum price bounds), or
                    simply stop an ongoing update. All of these changes will update the virtual
                    balances and potentially slightly change the price.
                  </li>
                </ul>
              </div>
            </FadeInOnView>
            <FadeInOnView>
              <div className="subsection">
                <h4 className="anchor" id="btf">
                  Blockchain Traded Funds
                </h4>

                <p>
                  Blockchain Traded Funds (or Temporal Function Market Making - TFMM) tackles
                  impermanent loss in traditional AMMs by continuously adjusting weights within the
                  pool, rather than relying on token allocations. This dynamic rebalancing process
                  allows the protocol to respond more effectively to market conditions, thereby
                  mitigating IL risk associated with market price fluctuations. These rules are
                  programmed to respond to specific market conditions, allowing for real-time
                  adjustments without requiring manual intervention, by analyzing market data and
                  applying the appropriate parameters for capital allocation within the fund, thus
                  enabling effective risk management and optimization of returns.
                </p>

                <p>
                  The Beets UI allows users to manage liquidity in certain QuantAMM pools (TFMM).
                  This is not an endorsement of their products or the safety of their smart
                  contracts. Users interacting with TFMM pools should be aware of the risks below.
                  Please also refer to the General risks section.
                </p>

                <ul>
                  <li>
                    <b>Market volatility</b>: run directional strategies. These are not market
                    neutral. The dynamic nature of the TFMM may not always respond adequately to
                    extreme market volatility or adverse conditions, potentially leading to losses
                    if market prices deviate significantly from expected trends.
                  </li>
                  <li>
                    <b>MEV</b> - Change weights is equivalent to changing the price offered for
                    swaps by the pool. This mechanism to expose a rebalance opportunity has been
                    studied however there is an inherent multiblock MEV opportunity. This is
                    mitigated by design choices (see mitigation section)
                  </li>
                  <li>
                    <b>Strategy Automation</b> - Strategies require periodic triggering, if this
                    triggering is not performed the strategy will not update weight trajectories
                  </li>
                  <li>
                    <b>Strategy Parameterization</b> - It is expected behaviour that a periodic
                    update will not occur if a variable in the strategy calculation means that the
                    strategy is not mathematically possible to run. E.g. a divide by 0 situation.
                  </li>
                  <li>
                    <b>Oracle risks</b>: reliance on oracles for price feeds introduces risk in
                    terms of potential inaccuracies in data, which could adversely impact the
                    rebalancing processes and overall fund performance. Additionally, infrastructure
                    issues such as high gas costs could affect the efficiency of operations within
                    the protocol. See more on oracle risks on the rate provider subsection.
                  </li>
                  <li>
                    <b>Sub-optimal arbitrage</b> TFMM changes the weights within the TFMM pricing
                    formula. At any one block TFMM is a standard CFMM pool. For actual NAV/Market
                    value to be rebalanced to the target weights arbitrageurs have to take the
                    immediate small arbitrage profit so that the holdings of the pool are inline
                    with the weights. If there are no arbitrageurs, holdings will not be rebalanced.
                    The more aggressive the arbitrage the more efficient the rebalancing.
                  </li>
                </ul>

                <p>How QuantAMM mitigates these risks:</p>
                <ul>
                  <li>
                    <b>Market Volatility</b> - given the nature of BTFs in so that they are not
                    reliant trade volumes, back test simulations are provided to give visibility on
                    simulated behaviour under different market conditions. Given the BTF strategies
                    rely on “historical memory” of price changes, historical performance and
                    simulations are not indicative of future performance.
                  </li>
                  <li>
                    <b>Pool Tuning</b> - Strategy parameters are fixed on creation mitigating the
                    possibility of parameter manipulation.
                  </li>
                  <li>
                    <b>Strategy automation</b> - Chainlink automation is used to trigger
                  </li>
                  <li>
                    Future updates to TFMM may include increased monitoring of performance metrics,
                    enhanced simulation testing, or improved user interfaces to minimize the chance
                    of errors in parameter settings.
                  </li>
                  <li>
                    Chainlink oracles are primarily used to mitigate oracle risk and any additional
                    pool creation requires approval from the protocol team.
                  </li>
                  <li>
                    Implement necessary fixes once identified, updating smart contracts, adjusting
                    parameters or improving risk disclosures.
                  </li>
                  <li>
                    <b>Sub-optimal arbitrage</b> - This is a relatively small risk given at any one
                    block arbitrageurs are faced with a standard balancer pool so they can price and
                    take the arbitrage opportunity without any additional new invariant prediction
                    work. Balancer has also integrated BTFs in the smart order router also
                    increasing the likelihood of being exposed to traders. Work has already begun on
                    DEX aggregator integration and when there is a minimal amount of TVL in the pool
                    aggregators will expose the pool for further volumes.
                  </li>
                </ul>
                <p>
                  Before interacting with any QuantAMM Blockchain Traded Funds, users must read and
                  accept QuantAMM&rsquo;s <a href="https://www.quantamm.fi/tos">Terms of Service</a>
                  .
                </p>
              </div>
            </FadeInOnView>

            <Divider />
            <FadeInOnView>
              <div className="subsection">
                <h3 className="anchor" id="network-risks">
                  Network risks (L2s and Sidechains)
                </h3>
                <p>
                  Sidechains and Layer 2 networks can offer advantages over Ethereum Mainnet, like
                  faster transaction times and lower fees. However, they come with their own set of
                  risks and trade-offs.
                </p>
                <p>
                  For example, sidechains and Layer 2 networks often have a different security
                  models. They may rely on a smaller set of validators or different consensus
                  mechanisms, which could potentially make them more susceptible to attacks or
                  centralization risks.
                </p>
                <p>
                  In addition, there are bridging risks when user&rsquo;s move funds between
                  networks. Asset bridges rely on smart contracts to facilitate transfers between
                  Ethereum Mainnet and Layer 2/sidechains. These contracts may have vulnerabilities,
                  which could expose users&apos; funds to risks during the bridging process.
                </p>
                <p>
                  This list of networks below is not updated regularly and may not reflect all
                  networks supported by this UI.
                </p>
              </div>
            </FadeInOnView>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              <h4 className="anchor" id="optimism">
                Optimism risks
              </h4>
              <p>
                <a href="https://www.optimism.io/">Optimism</a> is a Layer 2 scaling solution for
                Ethereum that uses Optimistic Rollups to improve transaction throughput and reduce
                fees. Although, the Balancer App UI doesn&rsquo;t support Optimism, the Balancer
                Protocol smart contracts are deployed on Optimism and currently used by{' '}
                <a href="https://op.beets.fi/">Beethoven X</a>.
              </p>
              <p>
                View the risks of using Optimism on{' '}
                <a href="https://l2beat.com/scaling/projects/optimism">L2Beat</a>.
              </p>
            </div>
          </FadeInOnView>
          <FadeInOnView>
            <div className="subsection">
              <p>
                Navigating these challenges calls for active engagement and open communication
                within the community. Sharing insights, feedback, or concerns can contribute to
                building a safer and more inclusive environment for all. Please feel free to reach
                out with any questions, suggestions or propose changes for this page directly via
                the{' '}
                <a href="https://github.com/balancer/frontend-monorepo/blob/main/apps/beets-frontend-v3/app/(marketing)/risks/page.tsx">
                  Balancer Github
                </a>
                .
              </p>
            </div>
          </FadeInOnView>
        </div>
      </Prose>
    </Container>
  )
}
