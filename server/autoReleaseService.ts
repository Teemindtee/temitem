
import { storage } from "./storage";
import { db } from "./db";
import { orderSubmissions, contracts } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export class AutoReleaseService {
  private static instance: AutoReleaseService;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): AutoReleaseService {
    if (!AutoReleaseService.instance) {
      AutoReleaseService.instance = new AutoReleaseService();
    }
    return AutoReleaseService.instance;
  }

  // Start the auto-release service (runs every hour)
  start() {
    if (this.intervalId) {
      console.log('Auto-release service is already running');
      return;
    }

    console.log('Starting auto-release service...');
    
    // Run immediately on start
    this.processAutoReleases();
    
    // Then run every hour
    this.intervalId = setInterval(() => {
      this.processAutoReleases();
    }, 60 * 60 * 1000); // 1 hour
  }

  // Stop the auto-release service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Auto-release service stopped');
    }
  }

  // Process all pending auto-releases
  async processAutoReleases() {
    try {
      console.log('Processing auto-releases...');
      
      // 1. Find expired order submissions that should be auto-accepted
      const expiredSubmissions = await db
        .select({
          id: orderSubmissions.id,
          contractId: orderSubmissions.contractId,
          autoReleaseDate: orderSubmissions.autoReleaseDate
        })
        .from(orderSubmissions)
        .innerJoin(contracts, eq(orderSubmissions.contractId, contracts.id))
        .where(and(
          eq(orderSubmissions.status, 'submitted'),
          sql`${orderSubmissions.autoReleaseDate} <= NOW()`,
          eq(contracts.escrowStatus, 'held')
        ));

      let releasedCount = 0;

      for (const submission of expiredSubmissions) {
        try {
          console.log(`Auto-accepting expired submission ${submission.id} for contract ${submission.contractId}`);
          
          // Auto-accept the submission - this will trigger fund release
          await storage.updateOrderSubmission(submission.id, { 
            status: 'accepted',
            clientFeedback: 'Auto-accepted due to expired review period (client did not respond within the deadline)'
          });
          
          releasedCount++;
          
          console.log(`Successfully auto-released contract ${submission.contractId}`);
        } catch (error) {
          console.error(`Failed to auto-release submission ${submission.id}:`, error);
        }
      }

      // 2. Also check for any contracts that should be released due to completion date
      const expiredContracts = await db
        .select({
          id: contracts.id,
          finderId: contracts.finderId,
          amount: contracts.amount,
          completedAt: contracts.completedAt
        })
        .from(contracts)
        .where(and(
          eq(contracts.isCompleted, true),
          eq(contracts.escrowStatus, 'held'),
          sql`${contracts.completedAt} IS NOT NULL`,
          sql`${contracts.completedAt} <= NOW() - INTERVAL '3 days'` // Auto-release after 3 days if no action
        ));

      for (const contract of expiredContracts) {
        try {
          console.log(`Auto-releasing expired contract ${contract.id}`);
          
          // Update contract status to released
          await storage.updateContract(contract.id, { escrowStatus: 'released' });
          
          // Release funds to finder's available balance
          await storage.releaseFundsToFinder(contract.finderId, contract.amount.toString());
          
          releasedCount++;
          
          console.log(`Successfully auto-released expired contract ${contract.id}`);
        } catch (error) {
          console.error(`Failed to auto-release contract ${contract.id}:`, error);
        }
      }

      if (releasedCount > 0) {
        console.log(`Auto-release process completed: ${releasedCount} contracts released`);
      } else {
        console.log('Auto-release process completed: No contracts needed releasing');
      }

      return { released: releasedCount };
    } catch (error) {
      console.error('Error in auto-release process:', error);
      return { released: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Manual trigger for admin use
  async manualRelease(contractId?: string) {
    try {
      if (contractId) {
        // Release specific contract
        const contract = await storage.getContract(contractId);
        if (!contract) {
          throw new Error('Contract not found');
        }

        if (contract.escrowStatus !== 'held') {
          throw new Error('Contract is not in held status');
        }

        await storage.updateContract(contractId, { escrowStatus: 'released' });
        await storage.releaseFundsToFinder(contract.finderId, contract.amount.toString());

        console.log(`Manually released contract ${contractId}`);
        return { success: true, message: 'Contract released successfully' };
      } else {
        // Run full auto-release process
        const result = await this.processAutoReleases();
        return result;
      }
    } catch (error) {
      console.error('Manual release error:', error);
      throw error;
    }
  }
}

export const autoReleaseService = AutoReleaseService.getInstance();
