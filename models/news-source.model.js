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
  },
);

// Indexes for performance
NewsSourceSchema.index({ name: "text" });

// Static method for finding by exchange
NewsSourceSchema.statics.findBySource = function (name) {
  return this.find({ name: new RegExp(name, "i") });
  // this.find({ name: { $regex: name, $options: "i" } })
  // this.find({ name: { $regex: name } })
};

const NewsSource = mongoose.model("news-sources", NewsSourceSchema);

const NewsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    summary: String,
    published: Date,
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
  },
);

// Indexes for performance
NewsSchema.index({ title: "text", summary: "text" });

// Static method for finding by exchange
NewsSchema.statics.findBySource = function (name) {
  return this.find({ name: new RegExp(name, "i") });
};

NewsSchema.statics.findNewsArticles = function (txt) {
  return this.find({ $text: { $search: txt } });

  // 1. Basic Search (Matches "mongodb" OR "database" - terms are ORed)
  // this.find({ $text: { $search: "mongodb database" } })

  // 2. Exact Phrase Search (Wrap the phrase in escaped double quotes)
  // this.find({ $text: { $search: "\"mongodb tutorial\"" } })

  // 3. Term Exclusion (Exclude documents containing "outdated" using a minus sign)
  // this.find({ $text: { $search: "mongodb -outdated" } })

  // this.find(
  //   { $text: { $search: "mongodb" } },
  //   { score: { $meta: "textScore" } }
  // ).sort({ score: { $meta: "textScore" } })
};

const News = mongoose.model("news", NewsSchema);
module.exports = {
  NewsSource,
  News,
};
