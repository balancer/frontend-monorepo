import * as React from 'react';

export interface CurrentStepContextType {
    updateCurrentStep: (id: string) => void;
    currentStep: string | null;
}

export const CurrentStepContext = React.createContext<CurrentStepContextType | null>(null);

export function _useCurrentStep() {
    const [currentStep, setCurrentStep] = React.useState<string | null>(null);

    const updateCurrentStep = (id: string) => {
        setCurrentStep(id);
    };

    return {
        currentStep,
        updateCurrentStep,
    };
}

export function CurrentStepProvider(props: { children: React.ReactNode }) {
    const steps = _useCurrentStep();
    return <CurrentStepContext.Provider value={steps}>{props.children}</CurrentStepContext.Provider>;
}

export const useCurrentStep = () => React.useContext(CurrentStepContext) as ReturnType<typeof _useCurrentStep>;
