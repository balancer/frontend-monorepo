import { add, addSeconds, fromUnixTime } from 'date-fns';
import { ReliquaryFarmPosition } from '~/lib/services/staking/reliquary.service';

export function relicGetMaturityProgress(relic: ReliquaryFarmPosition | null, maturities: string[]) {
    if (!relic || !maturities.length) {
        return {
            canUpgrade: false,
            canUpgradeTo: -1,
            progressToNextLevel: 0,
            entryDate: new Date(),
            levelUpDate: new Date(),
        };
    }

    const weekInSeconds = 60 * 60 * 24 * 7;
    const relicMaturityStart = relic.entry;
    const timeElapsedSinceStart = Date.now() / 1000 - relicMaturityStart;
    // reverse the maturities because otherwise findIndex will always be 0
    const maturitiesReversed = [...maturities];
    maturitiesReversed.reverse();
    const nextLevelMaturityIndex =
        maturities.length -
        1 -
        maturitiesReversed.findIndex((maturity) => timeElapsedSinceStart >= parseInt(maturity, 10));
    const isMaxMaturity = timeElapsedSinceStart > parseInt(maturities[maturities.length - 1], 10);
    const canUpgradeTo = isMaxMaturity ? maturities.length : nextLevelMaturityIndex + 1;
    const canUpgrade =
        (isMaxMaturity && relic.level < maturities.length - 1) ||
        (nextLevelMaturityIndex > 0 && nextLevelMaturityIndex > relic.level);

    const currentLevelMaturity = parseInt(maturities[relic.level], 10);
    const timeElapsedSinceCurrentLevel = Date.now() / 1000 - (currentLevelMaturity + relic.entry);
    const timeBetweenEntryAndNextLevel = isMaxMaturity ? 3600 : parseInt(maturities[relic.level + 1], 10);
    const progressToNextLevel = canUpgrade ? 100 : (timeElapsedSinceCurrentLevel / weekInSeconds) * 100;

    const entryDate = fromUnixTime(relicMaturityStart);
    const levelUpDate = addSeconds(entryDate, timeBetweenEntryAndNextLevel);
    return {
        canUpgrade,
        canUpgradeTo,
        progressToNextLevel,
        isMaxMaturity,
        entryDate,
        levelUpDate,
    };
}
