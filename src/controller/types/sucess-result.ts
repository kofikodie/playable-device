import { DeviceInterface } from './device-type';

export type SucessResult = {
    message: string;
    device: Omit<DeviceInterface, 'name'>;
};

export type SucessRetrieveResult = {
    message: string;
    device: DeviceInterface & { id: string };
};
