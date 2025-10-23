import { BaseProvider } from '@ethersproject/providers';
import { formatFixed } from '@ethersproject/bignumber';
import { BigNumber, Contract } from 'ethers';
import ReliquaryAbi from '~/lib/abi/Reliquary.json';
import { ReliquaryStakingPendingRewardAmount, StakingPendingRewardAmount } from '~/lib/services/staking/staking-types';
import { AmountHumanReadable, TokenAmountHumanReadable, TokenBase } from '../token/token-types';
import { Multicaller } from '../util/multicaller.service';
import { EncodeReliquaryUpdatePositionInput } from '../batch-relayer/relayer-types';
import { Interface } from '@ethersproject/abi';
import * as net from 'net';
import { networkConfig } from '~/lib/config/network-config';
import { sumBy } from 'lodash';

export type ReliquaryFarmPosition = {
    farmId: string;
    relicId: string;
    amount: AmountHumanReadable;
    entry: number;
    level: number;
};

export type ReliquaryDepositImpact = {
    oldMaturity: number;
    newMaturity: number;
    oldLevel: number;
    newLevel: number;
    oldLevelProgress: string;
    newLevelProgress: string;
    depositImpactTimeInMilliseconds: number;
    staysMax: boolean;
};

export class ReliquaryService {
    constructor(
        private readonly reliquaryContractAddress: string,
        private readonly chainId: string,
        private readonly beetsAddress: string,
    ) {}

    public async getUserStakedBalance({
        userAddress,
        farmId,
        provider,
    }: {
        userAddress: string;
        farmId: string;
        provider: BaseProvider;
    }): Promise<AmountHumanReadable> {
        const positions = await this.getAllPositions({ userAddress, provider });
        return positions
            .filter((position) => position.farmId === farmId)
            .reduce((total, position) => total + parseFloat(position.amount), 0)
            .toString();
    }

    public async getRelicNFT({ tokenId, provider }: { tokenId: string; provider: BaseProvider }) {
        const reliquary = new Contract(this.reliquaryContractAddress, ReliquaryAbi, provider);
        const tokenURI = await reliquary.tokenURI(tokenId);
        return tokenURI;
    }

    public async getAllPendingRewards({
        userAddress,
        provider,
    }: {
        userAddress: string;
        provider: BaseProvider;
    }): Promise<ReliquaryStakingPendingRewardAmount[]> {
        const reliquary = new Contract(this.reliquaryContractAddress, ReliquaryAbi, provider);
        const rewards: {
            relicId: BigNumber;
            poolId: BigNumber;
            pendingReward: BigNumber;
        }[] = reliquary.pendingRewardsOfOwner(userAddress);

        return rewards.map((reward) => ({
            id: reward.poolId.toString(),
            relicId: reward.relicId.toString(),
            address: this.beetsAddress,
            amount: formatFixed(reward.pendingReward, 18),
        }));
    }

    public async getPendingRewards({
        farmIds,
        userAddress,
        provider,
    }: {
        farmIds: string[];
        userAddress: string;
        // tokens: TokenBase[];
        provider: BaseProvider;
    }): Promise<{
        rewards: { address: string; amount: string }[];
        relicIds: number[];
        numberOfRelics: number;
        fBEETSTotalBalance: string;
    }> {
        const multicaller = new Multicaller(this.chainId, provider, ReliquaryAbi);

        const allPositions = await this.getAllPositions({ userAddress, provider });
        for (let i = 0; i < allPositions.length; i++) {
            if (farmIds.includes(allPositions[i].farmId)) {
                multicaller.call(i.toString(), this.reliquaryContractAddress, 'pendingReward', [
                    allPositions[i].relicId,
                ]);
            }
        }

        const rewardsByRelicId: { [index: string]: BigNumber } = await multicaller.execute();

        const pendingRewards = Object.entries(rewardsByRelicId).map(([index, pendingReward]) => {
            const position: ReliquaryFarmPosition = allPositions[parseInt(index)];
            return {
                id: position.farmId,
                relicId: position.relicId,
                address: this.beetsAddress,
                amount: formatFixed(pendingReward, 18),
                fBEETSBalance: position.amount,
            };
        });

        const relicIds = pendingRewards.map((reward) => parseInt(reward.relicId || ''));

        const rewardTokens = Object.values(pendingRewards.map((reward) => reward.address)).filter(
            (v, i, a) => a.indexOf(v) === i,
        );
        const rewards = rewardTokens.map((address) => {
            const amount = sumBy(
                pendingRewards
                    .filter((reward) => reward.address === address)
                    .map((reward) => parseFloat(reward.amount)),
            ).toString();
            return {
                address,
                amount,
            };
        });

        return {
            rewards,
            relicIds,
            numberOfRelics: relicIds.length,
            fBEETSTotalBalance: sumBy(pendingRewards, (reward) => parseFloat(reward.fBEETSBalance)).toString(),
        };
    }

    public async getPendingRewardsForRelic({
        relicId,
        provider,
    }: {
        relicId: string;
        provider: BaseProvider;
    }): Promise<TokenAmountHumanReadable[]> {
        const reliquary = new Contract(this.reliquaryContractAddress, ReliquaryAbi, provider);
        const pendingReward = await reliquary.pendingReward(relicId);

        //TODO: will need to expand this for multi token rewarders
        return [{ address: this.beetsAddress, amount: formatFixed(pendingReward, 18) }];
    }

    public async getAllPositions({
        userAddress,
        provider,
    }: {
        userAddress: string;
        provider: BaseProvider;
    }): Promise<ReliquaryFarmPosition[]> {
        const reliquary = new Contract(this.reliquaryContractAddress, ReliquaryAbi, provider);
        const relicPositions: {
            relicIds: BigNumber[];
            positionInfos: {
                amount: BigNumber;
                rewardDebt: BigNumber;
                rewardCredit: BigNumber;
                entry: BigNumber;
                poolId: BigNumber;
                level: BigNumber;
                genesis: BigNumber;
                lastMaturityBonus: BigNumber;
            }[];
        } = await reliquary.relicPositionsOfOwner(userAddress);
        return relicPositions.positionInfos.map((position, index) => ({
            farmId: position.poolId.toString(),
            relicId: relicPositions.relicIds[index].toString(),
            amount: formatFixed(position.amount, 18),
            entry: position.entry.toNumber(),
            level: position.level.toNumber(),
        }));
    }

    public async getPositionForRelicId({
        relicId,
        provider,
    }: {
        relicId: string;
        provider: BaseProvider;
    }): Promise<ReliquaryFarmPosition> {
        const reliquary = new Contract(this.reliquaryContractAddress, ReliquaryAbi, provider);
        const position = await reliquary.getPositionForId(relicId);
        return {
            farmId: position.poolId.toString(),
            relicId,
            amount: formatFixed(position.amount, 18),
            entry: position.entry.toNumber(),
            level: position.level.toNumber(),
        };
    }

    public async getLevelOnUpdate({ relicId, provider }: { relicId: string; provider: BaseProvider }): Promise<number> {
        const reliquary = new Contract(this.reliquaryContractAddress, ReliquaryAbi, provider);
        const levelOnUpdate: BigNumber = await reliquary.levelOnUpdate(relicId);
        return levelOnUpdate.toNumber();
    }

    public async getMaturityThresholds({ pid, provider }: { pid: string; provider: BaseProvider }) {
        const reliquary = new Contract(this.reliquaryContractAddress, ReliquaryAbi, provider);
        const poolLevelInfo = await reliquary.getLevelInfo(pid);

        const maturityThresholds = poolLevelInfo.requiredMaturities.map((maturity: BigNumber) => maturity.toString());
        return maturityThresholds;
    }

    public async getDepositImpact({
        amount,
        relicId,
        provider,
    }: {
        amount: number;
        relicId: string;
        provider: BaseProvider;
    }): Promise<ReliquaryDepositImpact> {
        /* 
            Impact of a new deposit on the maturity:
            - Maturity is defined as `now - entryTimestamp` (number of seconds)
            
            For any new deposit, a certain amount of time is added to the entryTimestamp, making the relic less mature.
            The amount of seconds that is added to the entryTimestamp depends on the ratio of depositAmount : balance.

            weight = depositAmount / (depositAmount + balance)
            entryTimestampAfterDeposit = oldEntryTimestamp + (maturity * weight)
        */
        const reliquary = new Contract(this.reliquaryContractAddress, ReliquaryAbi, provider);
        const position = await this.getPositionForRelicId({ relicId, provider });

        const levelOnUpdate = await this.getLevelOnUpdate({ relicId, provider });

        const poolLevelInfo = await reliquary.getLevelInfo(position.farmId);
        const maturityLevels: BigNumber[] = poolLevelInfo.requiredMaturities;

        const weight = amount / (amount + parseFloat(position.amount));

        const nowTimestamp = Math.floor(Date.now() / 1000);

        const maturity = nowTimestamp - position.entry;
        const entryTimestampAfterDeposit = Math.round(position.entry + maturity * weight);

        const newMaturity = nowTimestamp - entryTimestampAfterDeposit;

        let newLevel = 0;
        maturityLevels.forEach((level, i) => {
            if (newMaturity >= level.toNumber()) {
                newLevel = i;
            }
        });

        const oldLevelProgress =
            levelOnUpdate >= maturityLevels.length - 1
                ? 'max level reached'
                : `${maturity}/${maturityLevels[levelOnUpdate + 1]}`;
        const newLevelProgress =
            newLevel > maturityLevels.length ? 'max level reached' : `${newMaturity}/${maturityLevels[newLevel + 1]}`;

        const depositImpactTimeInMilliseconds = (maturity - newMaturity) * 1000;

        const staysMax =
            levelOnUpdate === networkConfig.reliquary.fbeets.maxLevel &&
            newLevel === networkConfig.reliquary.fbeets.maxLevel;

        return {
            oldMaturity: maturity,
            newMaturity,
            oldLevel: levelOnUpdate,
            newLevel,
            oldLevelProgress,
            newLevelProgress,
            depositImpactTimeInMilliseconds,
            staysMax,
        };
    }
}

export const reliquaryService = new ReliquaryService(
    networkConfig.reliquary.address,
    networkConfig.chainId,
    networkConfig.beets.address,
);
