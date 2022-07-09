import mongoose from "mongoose";
import DeviceModel from "../model/device.model";
import { DeviceInterface } from "./types/device-interface";

export class DeviceController {
    async create(device: DeviceInterface): Promise<{message: string, user: {id: string} } | {errorCode: number, context: string}> {
        try {
            const deviceModel = new DeviceModel(device);
            const result = await deviceModel.save();

            return {
                message: 'Device created successfully', 
                user: {
                    id: result.userId,
                }
            };
        } catch (error) {
            if (error instanceof mongoose.Error) {
                return {
                    errorCode: 500,
                    context: error.message,
                };
            }

            return {
                errorCode: 500,
                context: 'Error creating device',
            };
        }
    }
}