import { storage } from "./storage";
import { 
  type InsertStrike,
  type InsertUserRestriction,
  type InsertDispute,
  type InsertBehavioralTraining,
  type InsertTrustedBadge
} from "@shared/schema";

// Strike level definitions based on the requirements document
interface StrikeDefinition {
  level: number;
  consequence: string;
  description: string;
  restrictionType?: string;
  restrictionDuration?: number; // in hours
}

const strikeDefinitions: StrikeDefinition[] = [
  { 
    level: 1, 
    consequence: "Warning", 
    description: "Educational reminder with no penalty" 
  },
  { 
    level: 2, 
    consequence: "System Restrictions", 
    description: "Limited features for 7 days",
    restrictionType: "limited_features",
    restrictionDuration: 7 * 24 // 7 days in hours
  },
  { 
    level: 3, 
    consequence: "Temporary Suspension", 
    description: "Account suspended for 30 days",
    restrictionType: "suspended",
    restrictionDuration: 30 * 24 // 30 days in hours
  },
  { 
    level: 4, 
    consequence: "Permanent Ban", 
    description: "Account blacklisted permanently",
    restrictionType: "banned",
    restrictionDuration: undefined // permanent
  }
];

// Offense definitions from the requirements document
interface OffenseDefinition {
  offense: string;
  strikeLevel: number;
  applicableRoles: string[];
  resolution: string;
}

const clientOffenses: OffenseDefinition[] = [
  {
    offense: "No-show or ghosting after find match",
    strikeLevel: 1,
    applicableRoles: ["client"],
    resolution: "Warning + auto-removal of find"
  },
  {
    offense: "Fake or malicious find",
    strikeLevel: 2,
    applicableRoles: ["client"],
    resolution: "Review + block posting for 7 days"
  },
  {
    offense: "Low review average",
    strikeLevel: 2,
    applicableRoles: ["client"],
    resolution: "7-day review & education period"
  },
  {
    offense: "Refusing payment after confirmed find",
    strikeLevel: 3,
    applicableRoles: ["client"],
    resolution: "Escrow payout to Finder + 30-day ban"
  },
  {
    offense: "Abuse or harassment of Finders",
    strikeLevel: 3,
    applicableRoles: ["client"],
    resolution: "Investigation by support team"
  }
];

const finderOffenses: OffenseDefinition[] = [
  {
    offense: "Repeated no-shows",
    strikeLevel: 2,
    applicableRoles: ["finder"],
    resolution: "Limited applications for 7 days"
  },
  {
    offense: "Toxic communication",
    strikeLevel: 2,
    applicableRoles: ["finder"],
    resolution: "Temporarily muted + counseling module"
  },
  {
    offense: "Lying about completion",
    strikeLevel: 3,
    applicableRoles: ["finder"],
    resolution: "Possible platform removal"
  },
  {
    offense: "Uploading fake proof",
    strikeLevel: 3,
    applicableRoles: ["finder"],
    resolution: "Escalated to ban on third offense"
  },
  {
    offense: "Impersonation",
    strikeLevel: 4,
    applicableRoles: ["finder"],
    resolution: "Immediate permanent ban"
  },
  {
    offense: "Offering banned/illegal items",
    strikeLevel: 4,
    applicableRoles: ["finder"],
    resolution: "Blacklist + report to authorities"
  }
];

export class StrikeService {
  /**
   * Issue a strike to a user based on offense type
   */
  async issueStrikeByOffense(
    userId: string,
    offenseType: string,
    evidence: string,
    issuedBy: string,
    userRole: string,
    contextId?: string // contract, find, or proposal ID for context
  ) {
    // Find the offense definition
    const allOffenses = [...clientOffenses, ...finderOffenses];
    const offense = allOffenses.find(o => 
      o.offense === offenseType && o.applicableRoles.includes(userRole)
    );
    
    if (!offense) {
      throw new Error(`Invalid offense type "${offenseType}" for role "${userRole}"`);
    }

    // Check current strike level
    const currentStrikes = await storage.getActiveStrikesCount(userId);
    const newStrikeLevel = currentStrikes + 1;
    
    // Issue the strike
    const strike = await storage.issueStrike({
      userId,
      strikeLevel: newStrikeLevel,
      offense: offense.offense,
      offenseType,
      evidence,
      issuedBy
    });

    // Apply consequences based on strike level
    await this.applyStrikeConsequences(userId, newStrikeLevel, offense.resolution, issuedBy);

    return {
      strike,
      consequences: strikeDefinitions.find(s => s.level === newStrikeLevel),
      nextLevel: strikeDefinitions.find(s => s.level === newStrikeLevel + 1)
    };
  }

  /**
   * Apply consequences for a strike level
   */
  private async applyStrikeConsequences(
    userId: string,
    strikeLevel: number,
    resolution: string,
    issuedBy: string
  ) {
    const definition = strikeDefinitions.find(s => s.level === strikeLevel);
    if (!definition) return;

    // Level 1: Warning only - no restrictions
    if (strikeLevel === 1) {
      return;
    }

    // Level 2-4: Apply restrictions
    if (definition.restrictionType) {
      const endDate = definition.restrictionDuration 
        ? new Date(Date.now() + definition.restrictionDuration * 60 * 60 * 1000)
        : null; // permanent for level 4

      await storage.createUserRestriction({
        userId,
        restrictionType: definition.restrictionType,
        reason: `Strike Level ${strikeLevel}: ${definition.description}`,
        endDate,
        createdBy: issuedBy
      });

      // For permanent bans, also update user record
      if (strikeLevel === 4) {
        await storage.updateUser(userId, {
          isBanned: true,
          bannedReason: `Strike Level 4: ${definition.description}`,
          bannedAt: new Date()
        });
      }
    }

    // Assign behavioral training for levels 2 and 3
    if (strikeLevel === 2 || strikeLevel === 3) {
      const moduleType = strikeLevel === 2 ? 'communication' : 'reliability';
      await storage.assignTraining({
        userId,
        moduleType
      });
    }
  }

  /**
   * Check if user has active restrictions
   */
  async getUserRestrictions(userId: string) {
    const restrictions = await storage.getUserActiveRestrictions(userId);
    const strikes = await storage.getStrikesByUserId(userId);
    const activeStrikes = strikes.filter(s => s.status === 'active');
    
    return {
      restrictions,
      activeStrikes,
      strikeLevel: activeStrikes.length,
      canPost: !restrictions.some(r => r.restrictionType === 'posting' || r.restrictionType === 'suspended' || r.restrictionType === 'banned'),
      canApply: !restrictions.some(r => r.restrictionType === 'applications' || r.restrictionType === 'suspended' || r.restrictionType === 'banned'),
      canMessage: !restrictions.some(r => r.restrictionType === 'messaging' || r.restrictionType === 'suspended' || r.restrictionType === 'banned'),
      isSuspended: restrictions.some(r => r.restrictionType === 'suspended'),
      isBanned: restrictions.some(r => r.restrictionType === 'banned')
    };
  }

  /**
   * Submit a dispute for a strike
   */
  async submitDispute(
    userId: string,
    strikeId: string,
    description: string,
    evidence?: string
  ) {
    return await storage.createDispute({
      userId,
      strikeId,
      type: 'strike_appeal',
      description,
      evidence
    });
  }

  /**
   * Award trusted badge to user
   */
  async awardTrustedBadge(userId: string, badgeType: string) {
    // Check if user qualifies for trusted badge (strike-free for 90+ days)
    const strikes = await storage.getStrikesByUserId(userId);
    const recentStrikes = strikes.filter(s => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return s.createdAt && s.createdAt > ninetyDaysAgo;
    });

    if (recentStrikes.length === 0) {
      return await storage.awardBadge({
        userId,
        badgeType
      });
    }
    
    throw new Error("User has strikes within the last 90 days");
  }

  /**
   * Get strike statistics for admin dashboard
   */
  async getStrikeStatistics() {
    // Get all active strikes
    const allUsers = await storage.getAllUsers();
    const stats = {
      totalUsers: allUsers.length,
      usersWithActiveStrikes: 0,
      strikeLevelBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0 },
      recentStrikes: 0,
      disputesInReview: 0
    };

    // Calculate statistics
    for (const user of allUsers) {
      const activeStrikes = await storage.getActiveStrikesCount(user.id);
      if (activeStrikes > 0) {
        stats.usersWithActiveStrikes++;
        stats.strikeLevelBreakdown[Math.min(activeStrikes, 4) as keyof typeof stats.strikeLevelBreakdown]++;
      }
    }

    // Get recent strikes (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    for (const user of allUsers) {
      const strikes = await storage.getStrikesByUserId(user.id);
      const recentStrikes = strikes.filter(s => s.createdAt && s.createdAt > thirtyDaysAgo);
      stats.recentStrikes += recentStrikes.length;
    }

    // Get pending disputes
    const disputes = await storage.getAllDisputes();
    stats.disputesInReview = disputes.filter(d => d.status === 'pending' || d.status === 'investigating').length;

    return stats;
  }

  /**
   * Get available offense types for a role
   */
  getOffenseTypes(role: string) {
    if (role === 'client') return clientOffenses;
    if (role === 'finder') return finderOffenses;
    return [];
  }

  /**
   * Expire old strikes and restrictions (should be run as a cron job)
   */
  async cleanupExpiredData() {
    const now = new Date();
    
    // Expire old strikes (90 days)
    const allUsers = await storage.getAllUsers();
    for (const user of allUsers) {
      const strikes = await storage.getStrikesByUserId(user.id);
      for (const strike of strikes) {
        if (strike.expiresAt && strike.expiresAt <= now && strike.status === 'active') {
          await storage.updateStrike(strike.id, { status: 'expired' });
        }
      }
    }

    // Deactivate expired restrictions
    for (const user of allUsers) {
      const restrictions = await storage.getUserActiveRestrictions(user.id);
      for (const restriction of restrictions) {
        if (restriction.endDate && restriction.endDate <= now && restriction.isActive) {
          await storage.updateUserRestriction(restriction.id, { isActive: false });
        }
      }
    }
  }
}

export const strikeService = new StrikeService();