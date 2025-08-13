import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, Check, HandCoins } from "lucide-react";

interface EscrowStatusProps {
  status: 'held' | 'in_progress' | 'completed' | 'released';
  contractId?: string;
  amount?: number;
  className?: string;
}

export default function EscrowStatus({ status, contractId, amount, className = "" }: EscrowStatusProps) {
  const steps = [
    {
      key: 'held',
      title: 'Held in Escrow',
      description: 'Payment secured',
      icon: DollarSign,
    },
    {
      key: 'in_progress',
      title: 'In Progress',
      description: 'Finder working',
      icon: Clock,
    },
    {
      key: 'completed',
      title: 'Marked Complete',
      description: 'Awaiting approval',
      icon: Check,
    },
    {
      key: 'released',
      title: 'Payment Released',
      description: 'Transaction complete',
      icon: HandCoins,
    },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);

  return (
    <div className={`py-20 bg-finder-gray ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-finder-text mb-12">
          Escrow Status
        </h2>
        
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-finder-text">
                Payment Protection Process
              </CardTitle>
              {contractId && (
                <span className="text-finder-text-light text-sm">
                  Contract #{contractId.slice(-8)}
                </span>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Progress Indicator */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-8 right-8 h-0.5 bg-gray-300"></div>
              <div 
                className="absolute top-6 left-8 h-0.5 bg-finder-red transition-all duration-500"
                style={{ 
                  width: currentStepIndex >= 0 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' 
                }}
              ></div>
              
              {/* Status Steps */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? 'bg-finder-red text-white' 
                            : 'bg-gray-300 text-gray-600'
                        } ${isCurrent ? 'ring-4 ring-red-100' : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="mt-4 text-center">
                        <p className={`font-semibold ${
                          isActive ? 'text-finder-text' : 'text-finder-text-light'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-sm text-finder-text-light">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Information Box */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-blue-800 font-medium">
                    Your payment is safely held in escrow until the request is completed to your satisfaction.
                  </p>
                  {amount && (
                    <p className="text-blue-700 text-sm mt-1">
                      Escrow amount: ${amount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Description */}
            <div className="mt-6 text-center">
              <p className="text-finder-text-light">
                {status === 'held' && "Payment has been secured in escrow. The finder can now begin working on your request."}
                {status === 'in_progress' && "The finder is actively working on your request. You will be notified when they mark it as complete."}
                {status === 'completed' && "The finder has marked the request as complete. Please review and approve to release payment."}
                {status === 'released' && "Payment has been released to the finder. The transaction is now complete."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
