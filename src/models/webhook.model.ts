import { IWebhook } from "@/types/nuku";
import mongoose, { HydratedDocument, InferSchemaType } from "mongoose";

const WebhookSchema = new mongoose.Schema<IWebhook>(
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
    updatedAt: {
      type: Date,
      default: Date.now,
    },
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
  },
);

WebhookSchema.set("toJSON", {
  transform: function (doc, ret) {
    // ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

// export type IWebhook = InferSchemaType<typeof WebhookSchema>;
export type WebhookDocument = HydratedDocument<IWebhook>;

const Webhook = mongoose.model<IWebhook>("webhook", WebhookSchema);
export default Webhook;
