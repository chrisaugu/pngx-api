const mongoose = require("mongoose");

const WebhookSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    headers: {
      type: Object,
      default: {},
    },
    events: {
      type: [String], // Array of strings representing subscribed events
      required: true,
    },
    secret: {
      type: String,
      default: "", // Optional secret key for authentication
    },
    isActive: {
      type: Boolean,
      default: true, // Flag indicating if the webhook is currently active
    },
    description: {
      type: String,
      default: "", // Optional description of the webhook's purpose
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Additional considerations:
  },
  {
    toJSON: {
      transform(doc, rest) {
        delete rest.__v;
        delete rest._id;
        delete rest.createdAt;
        delete rest.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Webhook = mongoose.model("webhook", WebhookSchema);
module.exports = Webhook;
