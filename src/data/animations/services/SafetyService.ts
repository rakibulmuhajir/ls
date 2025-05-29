import { SafetyConstraints, SafetyStatus } from '../types';

export class SafetyService {
  static checkSafety(
    constraints: SafetyConstraints | undefined,
    currentState: Record<string, any>
  ): SafetyStatus {
    const result: SafetyStatus = {
      isSafe: true,
      warnings: [],
      requiredEquipment: constraints?.requiredEquipment || []
    };

    if (!constraints) return result;

    // Temperature checks
    if (constraints.maxTemperature && currentState.temperature > constraints.maxTemperature) {
      result.isSafe = false;
      result.warnings.push(`Temperature exceeds safe limit (${constraints.maxTemperature}°C)`);
    }

    // Pressure checks
    if (constraints.maxPressure && currentState.pressure > constraints.maxPressure) {
      result.isSafe = false;
      result.warnings.push(`Pressure exceeds safe limit (${constraints.maxPressure}atm)`);
    }

    // Concentration checks
    if (constraints.maxConcentration && currentState.concentration > constraints.maxConcentration) {
      result.isSafe = false;
      result.warnings.push(`Concentration exceeds safe limit (${constraints.maxConcentration}M)`);
    }

    // Hazardous reaction checks
    if (
      constraints.hazardousReactions &&
      constraints.hazardousReactions.includes(currentState.reactionType)
    ) {
      result.warnings.push(`Hazardous reaction: ${currentState.reactionType}`);
    }

    return result;
  }
}
