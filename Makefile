-include .env.local

export

.PHONY: fork

fork-ethereum:
	anvil --fork-url "${ETHEREUM_RPC_URL}" --port 8545

fork-base:
	anvil --fork-url "${BASE_RPC_URL}" --port 8545

fork-gnosis:
	anvil --fork-url "${GNOSIS_RPC_URL}" --port 8545
