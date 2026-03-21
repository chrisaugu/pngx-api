const mongoose = require("mongoose");
const { Schema } = mongoose;

const NewsSourceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, rest) {
        delete rest.__v;
        delete rest._id;
      },
    },
    timestamps: true,
  }
);

// Indexes for performance
NewsSourceSchema.index({ name: "text" });

// Static method for finding by exchange
NewsSourceSchema.statics.findBySource = function (name) {
  return this.find({ name: new RegExp(name, "i") });
};

const NewsSource = mongoose.model("news-sources", NewsSourceSchema);
module.exports = NewsSource;
