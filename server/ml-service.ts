// Mock ML service for triage level prediction
// In production, this would interface with your actual ML model

export interface MLPredictionInput {
  sex: number; // 1 = female, 2 = male
  age: number;
  arrivalMode: number; // 1-7
  injury: number; // 1 = no, 2 = yes
  mental: number; // 1-4
  pain: number; // 0 = no, 1 = yes
  nrsPain?: number; // 1-10
  sbp: number; // systolic blood pressure
  dbp: number; // diastolic blood pressure
  hr: number; // heart rate
  rr: number; // respiratory rate
  bt: number; // body temperature
  saturation: number; // oxygen saturation
  diagnosis: string; // text for TF vectorization
}

export class MLTriageService {
  /**
   * Predicts triage level based on patient data
   * Returns 1-5 where 1 is most critical, 5 is least urgent
   */
  async predictTriageLevel(input: MLPredictionInput): Promise<number> {
    // TODO: Replace this with actual ML model integration
    // This is a rule-based approximation for demonstration
    
    let score = 3; // Default to semi-urgent
    
    // Critical indicators (Level 1 - Most Critical)
    if (
      input.mental === 4 || // Unresponsive
      input.saturation < 90 || // Critical oxygen levels
      input.sbp > 180 || input.sbp < 90 || // Critical blood pressure
      input.hr > 120 || input.hr < 50 || // Critical heart rate
      input.bt > 39 || input.bt < 35 || // Critical temperature
      input.diagnosis.toLowerCase().includes('cardiac arrest') ||
      input.diagnosis.toLowerCase().includes('stroke') ||
      input.diagnosis.toLowerCase().includes('severe trauma')
    ) {
      score = 1;
    }
    // Urgent indicators (Level 2)
    else if (
      input.mental === 3 || // Pain response only
      input.saturation < 94 ||
      (input.pain === 1 && (input.nrsPain || 0) >= 8) || // Severe pain
      input.sbp > 160 || input.sbp < 100 ||
      input.hr > 100 || input.hr < 60 ||
      input.diagnosis.toLowerCase().includes('chest pain') ||
      input.diagnosis.toLowerCase().includes('difficulty breathing') ||
      input.diagnosis.toLowerCase().includes('severe')
    ) {
      score = 2;
    }
    // Semi-urgent (Level 3)
    else if (
      input.injury === 2 || // Injury present
      (input.nrsPain || 0) >= 5 || // Moderate pain
      input.arrivalMode === 2 || input.arrivalMode === 4 || // Ambulance arrival
      input.diagnosis.toLowerCase().includes('moderate') ||
      input.diagnosis.toLowerCase().includes('fracture')
    ) {
      score = 3;
    }
    // Standard (Level 4)
    else if (
      (input.nrsPain || 0) >= 2 ||
      input.mental === 2 || // Verbal response
      input.diagnosis.toLowerCase().includes('minor') ||
      input.diagnosis.toLowerCase().includes('routine')
    ) {
      score = 4;
    }
    // Non-urgent (Level 5)
    else {
      score = 5;
    }

    return score;
  }

  /**
   * Processes diagnosis text for TF vectorization
   * In production, this would use your trained vectorizer
   */
  private preprocessDiagnosis(diagnosis: string): string {
    return diagnosis.toLowerCase().trim();
  }
}

export const mlService = new MLTriageService();
