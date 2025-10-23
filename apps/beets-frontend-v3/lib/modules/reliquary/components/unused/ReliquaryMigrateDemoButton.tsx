import { Button } from '@chakra-ui/react';
import { useReliquaryFbeetsMigrateContractCallData } from '~/modules/reliquary/lib/useReliquaryFbeetsMigrateContractCallData';
import { useReliquaryZap } from '~/modules/reliquary/lib/useReliquaryZap';

export function ReliquaryMigrateDemoButton() {
    // const { data: contractCalls, fbeetsBalance } = useReliquaryFbeetsMigrateContractCallData();
    // const { reliquaryZap } = useReliquaryZap('MIGRATE');

    // return (
    //     <Button
    //         onClick={() => {
    //             reliquaryZap(contractCalls || []);
    //         }}
    //     >
    //         Migrate fBeets to reliquary {fbeetsBalance}
    //     </Button>
    // );
    return null;
}
