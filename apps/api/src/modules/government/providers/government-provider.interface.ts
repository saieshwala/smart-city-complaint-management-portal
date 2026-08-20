export interface SubmissionResult {
  success: boolean;
  externalReference?: string;
  error?: string;
}

export interface StatusCheckResult {
  status: string;
  details?: string;
}

export interface GovernmentProvider {
  submit(complaint: any, config: any): Promise<SubmissionResult>;
  checkStatus(externalReference: string, config: any): Promise<StatusCheckResult>;
}
