import { 
  RosterPeriod, 
  RosterGenerationConfig, 
  RosterShift, 
  RosterStaff,
  RosterLocation,
  RosterSolution 
} from '@/types/roster';
import { addDays, differenceInDays, parseISO, format } from 'date-fns';

class RosterGenerator {
  private period: RosterPeriod;
  private config: RosterGenerationConfig;
  private solution: RosterShift[] = [];
  private staffWorkload: Map<number, number> = new Map();
  private locationCoverage: Map<number, Map<string, number>> = new Map();

  constructor(period: RosterPeriod, config: RosterGenerationConfig) {
    this.period = period;
    this.config = config;
    this.initializeWorkloadTracking();
  }

  private initializeWorkloadTracking(): void {
    // Initialize staff workload tracking
    this.period.staff.forEach(staff => {
      this.staffWorkload.set(staff.id, 0);
    });

    // Initialize location coverage tracking
    this.period.locations.forEach(location => {
      const shiftCounts = new Map<string, number>();
      ['morning', 'afternoon', 'night'].forEach(shift => {
        shiftCounts.set(shift, 0);
      });
      this.locationCoverage.set(location.id, shiftCounts);
    });
  }

  private calculateDateRange(): string[] {
    const startDate = parseISO(this.config.start_date);
    const endDate = parseISO(this.config.end_date);
    const days = differenceInDays(endDate, startDate) + 1;
    
    return Array.from({ length: days }, (_, i) => 
      format(addDays(startDate, i), 'yyyy-MM-dd')
    );
  }

  private isStaffAvailable(
    staff: RosterStaff, 
    date: string, 
    shift_type: string
  ): boolean {
    // Check leave dates
    if (staff.constraints?.leave_dates?.includes(date)) {
      return false;
    }

    // Check consecutive days
    const consecutiveDays = this.getConsecutiveWorkDays(staff.id, date);
    if (consecutiveDays >= (staff.preferences?.max_consecutive_days ?? this.config.rules.max_consecutive_days)) {
      return false;
    }

    // Check rest between shifts
    if (!this.hasEnoughRest(staff.id, date, shift_type)) {
      return false;
    }

    // Check weekly hours
    const weeklyShifts = this.getWeeklyShifts(staff.id, date);
    if (weeklyShifts >= this.config.rules.max_shifts_per_week) {
      return false;
    }

    return true;
  }

  private getConsecutiveWorkDays(staffId: number, date: string): number {
    let consecutiveDays = 0;
    const currentDate = parseISO(date);
    
    for (let i = 1; i <= 7; i++) {
      const checkDate = format(addDays(currentDate, -i), 'yyyy-MM-dd');
      const hasShift = this.solution.some(shift => 
        shift.staff_id === staffId && shift.date === checkDate
      );
      
      if (!hasShift) break;
      consecutiveDays++;
    }
    
    return consecutiveDays;
  }

  private hasEnoughRest(staffId: number, date: string, shiftType: string): boolean {
    const previousShift = this.solution
      .filter(shift => shift.staff_id === staffId)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    if (!previousShift) return true;

    const hoursBetween = differenceInDays(parseISO(date), parseISO(previousShift.date)) * 24;
    return hoursBetween >= this.config.rules.min_rest_between_shifts;
  }

  private getWeeklyShifts(staffId: number, date: string): number {
    const currentDate = parseISO(date);
    const weekStart = addDays(currentDate, -6);
    
    return this.solution.filter(shift => 
      shift.staff_id === staffId && 
      parseISO(shift.date) >= weekStart &&
      parseISO(shift.date) <= currentDate
    ).length;
  }

  private calculateStaffScore(
    staff: RosterStaff,
    location: RosterLocation,
    date: string,
    shiftType: string
  ): number {
    let score = 0;
    const weights = this.config.weights;

    // Staff preference score
    if (staff.preferences?.preferred_locations?.includes(location.id)) {
      score += weights.staff_preference;
    }
    if (staff.preferences?.preferred_shifts?.includes(shiftType)) {
      score += weights.staff_preference;
    }

    // Location priority score
    score += (location.priority * weights.location_priority);

    // Skill match score
    if (this.hasRequiredSkills(staff, location)) {
      score += weights.skill_match;
    }

    // Fairness score (inverse of current workload)
    const currentWorkload = this.staffWorkload.get(staff.id) || 0;
    const fairnessScore = 1 - (currentWorkload / this.config.rules.max_shifts_per_week);
    score += fairnessScore * weights.fairness;

    // Continuity score (bonus for working in the same location consecutively)
    if (this.workedInLocationRecently(staff.id, location.id)) {
      score += weights.continuity;
    }

    return score;
  }

  private hasRequiredSkills(staff: RosterStaff, location: RosterLocation): boolean {
    if (!location.constraints?.required_roles) return true;
    return location.constraints.required_roles.includes(staff.role_id);
  }

  private workedInLocationRecently(staffId: number, locationId: number): boolean {
    const recentShifts = this.solution
      .filter(shift => shift.staff_id === staffId)
      .slice(-3);
    
    return recentShifts.some(shift => shift.location_id === locationId);
  }

  private assignShift(
    date: string,
    shift_type: string,
    location: RosterLocation
  ): RosterShift | null {
    const availableStaff = this.period.staff
      .filter(staff => this.isStaffAvailable(staff, date, shift_type))
      .map(staff => ({
        staff,
        score: this.calculateStaffScore(staff, location, date, shift_type)
      }))
      .sort((a, b) => b.score - a.score);

    if (availableStaff.length === 0) return null;

    const selectedStaff = availableStaff[0].staff;
    const shift: RosterShift = {
      id: this.solution.length + 1,
      date,
      location_id: location.id,
      staff_id: selectedStaff.id,
      shift_type: shift_type as 'morning' | 'afternoon' | 'night',
      status: 'scheduled'
    };

    // Update tracking
    this.staffWorkload.set(
      selectedStaff.id,
      (this.staffWorkload.get(selectedStaff.id) || 0) + 1
    );
    
    const locationShifts = this.locationCoverage.get(location.id);
    if (locationShifts) {
      locationShifts.set(
        shift_type,
        (locationShifts.get(shift_type) || 0) + 1
      );
    }

    return shift;
  }

  private calculateMetrics(): RosterSolution['metrics'] {
    const totalShifts = this.solution.length;
    const totalRequired = this.period.locations.reduce(
      (sum, location) => sum + location.min_staff_required,
      0
    ) * 3; // 3 shifts per day

    return {
      staff_satisfaction: this.calculateStaffSatisfaction(),
      coverage: totalShifts / totalRequired,
      fairness_score: this.calculateFairnessScore(),
      constraint_violations: this.countConstraintViolations()
    };
  }

  private calculateStaffSatisfaction(): number {
    let totalSatisfaction = 0;
    let count = 0;

    this.period.staff.forEach(staff => {
      const staffShifts = this.solution.filter(shift => shift.staff_id === staff.id);
      const preferredLocationShifts = staffShifts.filter(shift => 
        staff.preferences?.preferred_locations?.includes(shift.location_id)
      );
      const preferredShiftTypeShifts = staffShifts.filter(shift =>
        staff.preferences?.preferred_shifts?.includes(shift.shift_type)
      );

      if (staffShifts.length > 0) {
        const satisfaction = (
          (preferredLocationShifts.length + preferredShiftTypeShifts.length) /
          (staffShifts.length * 2)
        );
        totalSatisfaction += satisfaction;
        count++;
      }
    });

    return count > 0 ? totalSatisfaction / count : 0;
  }

  private calculateFairnessScore(): number {
    const workloads = Array.from(this.staffWorkload.values());
    const maxWorkload = Math.max(...workloads);
    const minWorkload = Math.min(...workloads);
    
    return maxWorkload > 0 ? 1 - ((maxWorkload - minWorkload) / maxWorkload) : 1;
  }

  private countConstraintViolations(): number {
    let violations = 0;

    this.solution.forEach(shift => {
      const staff = this.period.staff.find(s => s.id === shift.staff_id);
      const location = this.period.locations.find(l => l.id === shift.location_id);

      if (staff && location) {
        // Check consecutive days violation
        if (this.getConsecutiveWorkDays(staff.id, shift.date) > 
            this.config.rules.max_consecutive_days) {
          violations++;
        }

        // Check rest between shifts violation
        if (!this.hasEnoughRest(staff.id, shift.date, shift.shift_type)) {
          violations++;
        }

        // Check weekly shifts violation
        if (this.getWeeklyShifts(staff.id, shift.date) > 
            this.config.rules.max_shifts_per_week) {
          violations++;
        }

        // Check required roles violation
        if (location.constraints?.required_roles &&
            !location.constraints.required_roles.includes(staff.role_id)) {
          violations++;
        }
      }
    });

    return violations;
  }

  public generate(): RosterSolution {
    const dates = this.calculateDateRange();
    const shiftTypes = ['morning', 'afternoon', 'night'];

    dates.forEach(date => {
      shiftTypes.forEach(shift_type => {
        this.period.locations.forEach(location => {
          const requiredStaff = location.min_staff_required;
          
          for (let i = 0; i < requiredStaff; i++) {
            const shift = this.assignShift(date, shift_type, location);
            if (shift) {
              this.solution.push(shift);
            }
          }
        });
      });
    });

    return {
      shifts: this.solution,
      metrics: this.calculateMetrics()
    };
  }
}

export default RosterGenerator; 