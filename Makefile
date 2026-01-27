-include .env.local

export

.PHONY: fork

fork-ethereum:
	anvil --mnemonic ${TEST_ACCOUNT_MNEMONIC} --fork-url "${ETHEREUM_RPC_URL}" --port 8545

fork-plasma:
	anvil --mnemonic ${TEST_ACCOUNT_MNEMONIC} --fork-url "${PLASMA_RPC_URL}" --port 8545

fork-arbitrum:
	anvil --mnemonic ${TEST_ACCOUNT_MNEMONIC} --fork-url "${ARBITRUM_RPC_URL}" --port 8545

fork-avalanche: 
	anvil --mnemonic ${TEST_ACCOUNT_MNEMONIC} --fork-url "${AVALANCHE_RPC_URL}" --port 8545

fork-base:
	anvil --mnemonic ${TEST_ACCOUNT_MNEMONIC} --fork-url "${BASE_RPC_URL}" --port 8545

fork-gnosis:
	anvil --mnemonic ${TEST_ACCOUNT_MNEMONIC} --fork-url "${GNOSIS_RPC_URL}" --port 8545

fork-hype:
	anvil --mnemonic ${TEST_ACCOUNT_MNEMONIC} --fork-url "${HYPE_RPC_URL}" --port 8545

fork-optimism:
	anvil --mnemonic ${TEST_ACCOUNT_MNEMONIC} --fork-url "${OPTIMISM_RPC_URL}" --port 8545

fork-sonic:
	anvil --mnemonic ${TEST_ACCOUNT_MNEMONIC} --fork-url "${SONIC_RPC_URL}" --port 8545

fork-monad:
	anvil --mnemonic ${TEST_ACCOUNT_MNEMONIC} --fork-url "${MONAD_RPC_URL}" --port 8545