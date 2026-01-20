import { EStatusDeliveryAcftership } from 'src/common/constants/common.constants';

export interface ICheckpointPED {
  pickupDate: string;
  exportDate: string;
  deliveredDate: string;
  currentStatus: string;
}
