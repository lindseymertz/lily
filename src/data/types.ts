export interface ServiceRequest {
  requestId: string;
  accountName: string;
  vertical: 'Restaurant' | 'Fuel' | 'Grocery';
  siteCount: number;
  issueCategory: 'API Error' | 'Billing Inquiry' | 'Refund Request' | 'Network Issues' | 'Software Integration';
  requestDate: string;
  status: 'Resolved' | 'In Progress';
  urgency: 'Low' | 'Medium' | 'High';
  priority: 'Low' | 'Medium' | 'High';
  timeToRespond: number;
  timeToResolution: number;
  resolutionDate: string;
  accountHealth: 'Advocate' | 'Engaged' | 'Neutral' | 'Skeptic' | 'Churn Risk';
}

export type Vertical = ServiceRequest['vertical'];
export type Status = ServiceRequest['status'];
export type IssueCategory = ServiceRequest['issueCategory'];
export type Urgency = ServiceRequest['urgency'];
export type Priority = ServiceRequest['priority'];
export type AccountHealth = ServiceRequest['accountHealth'];
