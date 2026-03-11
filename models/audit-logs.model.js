const mongoose = require("mongoose");
const auditLog = require('audit-log');

const AuditLogSchema = new mongoose.Schema(
  {
    ip_address: { type: String, required: true },
    user_agent: { type: String, required: true },
    request_id: { type: String, required: true },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    status_code: { type: Number, required: true },
    request_time: { type: Date, default: Date.now },
    response_time_ms: { type: Number, required: true },

    timestamp: Date,
    operationType: 'insert',
    collection: 'users',
    documentId: ObjectId,
    fullDocument: {},
    updateDescription: {
      updatedFields: {},
      removedFields: []
    },
    user: {
      id: "user123",
      name: "John Johnson"
    },
    source: {
      ip: "192.168.1.10",
      app: "employee-service"
    },
    schemaVersion: Number,

    action: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, default: null },
    details: { type: Object, default: {} },
    resolution: {
      type: String,
      enum: ["unresolved", "resolved", "under-review"],
      default: "unresolved"
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "audit_log",
  }
);

const auditTrail = new mongoose.Schema({
  url: {
    type: Schema.Types.String,
    required: true
  },
  activity: {
    type: Schema.Types.String,
    required: true
  },
  params: {
    type: Schema.Types.String,
    required: true
  },
  query: {
    type: Schema.Types.String,
    required: true
  },
  payload: {
    type: Schema.Types.String,
    required: true
  },
  response: {
    type: Schema.Types.String,
    required: true
  }
}, {
  timestamps: true
});
db.auditLogs.createIndex({ documentId: 1 });
db.auditLogs.createIndex({ operationType: 1 });
db.auditLogs.createIndex({ collection: 1, documentId: 1, timestamp: -1 });
db.auditLogs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 }) // 30 days

const pluginFn = auditLog.getPlugin('mongoose', {
  modelName: 'audit_log',
  namePath: 'user'
});
AuditLogSchema.plugin(pluginFn.handler);

// quotes_update

const AuditLog = mongoose.model("audit_log", AuditLogSchema);
module.exports = AuditLog;
