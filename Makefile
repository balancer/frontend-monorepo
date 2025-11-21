-include .env.local

export

.PHONY: fork

fork-ethereum:
	anvil --fork-url "${ETHEREUM_RPC_URL}" --port 8545

fork-arbitrum:
	anvil --fork-url "${ARBITRUM_RPC_URL}" --port 8545

fork-base:
	anvil --fork-url "${BASE_RPC_URL}" --port 8545

fork-gnosis:
	anvil --fork-url "${GNOSIS_RPC_URL}" --port 8545

fork-optimism:
	anvil --fork-url "${OPTIMISM_RPC_URL}" --port 8545

fork-polygon:
	anvil --fork-url "${POLYGON_RPC_URL}" --port 8545

fork-plasma:
	anvil --fork-url "${PLASMA_RPC_URL}" --port 8545

fork-avalanche:
	anvil --fork-url "${AVALANCHE_RPC_URL}" --port 8545