import { DollarSign, Clock, CheckCircle, HandCoins } from "lucide-react";

interface EscrowStatusTrackerProps {
  escrowStatus: string;
  isCompleted: boolean;
  hasSubmission: boolean;
}

export default function EscrowStatusTracker({ escrowStatus, isCompleted, hasSubmission }: EscrowStatusTrackerProps) {
  const getStepStatus = (step: number) => {
    if (step === 1) return true; // Always held in escrow
    if (step === 2) return hasSubmission || isCompleted; // In progress when submission exists
    if (step === 3) return isCompleted; // Marked complete when finished
    if (step === 4) return escrowStatus === 'released' || isCompleted; // Payment released
    return false;
  };

  const getStepColor = (step: number) => {
    return getStepStatus(step) ? "text-finder-red bg-finder-red/20" : "text-gray-400 bg-gray-100";
  };

  const getConnectorColor = (step: number) => {
    return getStepStatus(step + 1) ? "bg-finder-red" : "bg-gray-300";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Escrow Status</h3>
      
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Step 1: Held in Escrow */}
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepColor(1)}`}>
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-gray-900">Held in</p>
            <p className="text-sm font-medium text-gray-900">Escrow</p>
          </div>
        </div>

        {/* Connector 1 */}
        <div className={`flex-1 h-1 mx-3 ${getConnectorColor(1)}`}></div>

        {/* Step 2: In Progress */}
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepColor(2)}`}>
            <Clock className="w-6 h-6" />
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-gray-900">In</p>
            <p className="text-sm font-medium text-gray-900">Progress</p>
          </div>
        </div>

        {/* Connector 2 */}
        <div className={`flex-1 h-1 mx-3 ${getConnectorColor(2)}`}></div>

        {/* Step 3: Marked Complete */}
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepColor(3)}`}>
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-gray-900">Marked</p>
            <p className="text-sm font-medium text-gray-900">Complete</p>
          </div>
        </div>

        {/* Connector 3 */}
        <div className={`flex-1 h-1 mx-3 ${getConnectorColor(3)}`}></div>

        {/* Step 4: Payment Released */}
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepColor(4)}`}>
            <HandCoins className="w-6 h-6" />
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-gray-900">Payment</p>
            <p className="text-sm font-medium text-gray-900">Released</p>
          </div>
        </div>
      </div>

      {/* Status description */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {!hasSubmission && !isCompleted && "Waiting for finder to submit work"}
          {hasSubmission && !isCompleted && "Work submitted, awaiting review"}
          {isCompleted && escrowStatus !== 'released' && "Work completed, payment processing"}
          {isCompleted && escrowStatus === 'released' && "Project completed and payment released"}
        </p>
      </div>
    </div>
  );
}