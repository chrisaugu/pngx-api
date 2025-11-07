import mongoose from 'mongoose';
import { IAPIUsage } from '../types/nuku';

const ApiUsageSchema = new mongoose.Schema<IAPIUsage>({
    // api_key: { type: String, required: true },
    // user_id: { type: String, required: true },
    ip_address: { type: String, required: true },
    user_agent: { type: String, required: true },
    request_id: { type: String, required: true },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    status_code: { type: Number, required: true },
    request_time: { type: Date, default: Date.now },
    response_time_ms: { type: Number, required: true }
}, {
    timestamps: true,
    collection: 'api_usage_log'
});

const ApiUsageLog = mongoose.model('ApiUsageLog', ApiUsageSchema);
export default ApiUsageLog;