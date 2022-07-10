import { MongoServerError } from 'mongodb';
import mongoose from 'mongoose';
import DeviceModel from '../model/device.model';
import { DeviceInterface } from './types/device-type';
import { ErrorResult } from './types/error-result';
import { SucessResult, SucessRetrieveResult } from './types/sucess-result';

export class DeviceController {
    async create(device: DeviceInterface): Promise<SucessResult | ErrorResult> {
        try {
            const deviceModel = new DeviceModel(device);
            const result = await deviceModel.save();

            return {
                message: 'Device created successfully',
                device: {
                    userId: result.userId,
                },
            };
        } catch (error) {
            if (error instanceof MongoServerError && error.code === 11000) {
                return {
                    errorCode: 409,
                    context: 'Device already exists',
                };
            }

            if (error instanceof mongoose.Error) {
                return {
                    errorCode: 400,
                    context: error.message,
                };
            }

            return {
                errorCode: 500,
                context: 'Error creating device',
            };
        }
    }

    async retrieve(
        device: DeviceInterface
    ): Promise<SucessRetrieveResult | ErrorResult> {
        try {
            const result = await DeviceModel.findOne(device);
            if (!result) {
                return {
                    errorCode: 404,
                    context: 'Device not found',
                };
            }

            return {
                message: 'Device retrieved successfully',
                device: {
                    userId: result.userId,
                    name: result.name,
                    id: result._id.toString(),
                },
            };
        } catch (error) {
            if (error instanceof mongoose.Error) {
                return {
                    errorCode: 400,
                    context: error.message,
                };
            }

            return {
                errorCode: 500,
                context: 'Error retrieving device',
            };
        }
    }

    async delete(
        device: DeviceInterface
    ): Promise<SucessRetrieveResult | ErrorResult> {
        try {
            const result = await DeviceModel.findOneAndDelete(device);
            if (!result) {
                return {
                    errorCode: 404,
                    context: 'Device not found',
                };
            }

            return {
                message: 'Device deleted successfully',
                device: {
                    name: result.name,
                    userId: result.userId,
                    id: result._id.toString(),
                },
            };
        } catch (error) {
            if (error instanceof mongoose.Error) {
                return {
                    errorCode: 400,
                    context: error.message,
                };
            }

            return {
                errorCode: 500,
                context: 'Error deleting device',
            };
        }
    }
}
