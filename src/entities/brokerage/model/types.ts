export type BrokerageConnectionStatus = 'connected' | 'pending' | 'failed' | 'disconnected';

export type BrokerageConnectionStep = 'select' | 'auth' | 'verify' | 'complete';

export interface BrokerageProvider {
  id: string;
  name: string;
  logoUrl: string;
  supportedFeatures: string[];
  isPopular: boolean;
}

export interface BrokerageAccount {
  id: string;
  providerId: string;
  providerName: string;
  accountNumber: string;
  status: BrokerageConnectionStatus;
  connectedAt?: string;
  lastSyncedAt?: string;
  errorMessage?: string;
}
