import axios from 'axios';
import { ErrorResult } from '../controller/types/error-result';

export type Entitlement = {
    userId: string;
    entitlements: Entitlements;
};
export type Entitlements = {
    devices: Devices;
};

type Devices = {
    access_device: string;
    max_devices: number;
};

export class EntitlementClient {
    async getMaxDevices(userId: string): Promise<number | ErrorResult> {
        const apiClient = axios.create({
            baseURL:
                'https://growth-engineering-nodejs-home-assessement-dev.s3.eu-central-1.amazonaws.com',
        });

        const result = await apiClient.get<Entitlement[]>('/entitlements.json');
        //find the user with the given userId
        const user = result.data.find(user => user.userId === userId);
        if (!user) {
            return {
                errorCode: 404,
                context: 'User has no entitlements assigned',
            };
        }

        return user.entitlements.devices.max_devices;
    }
}
