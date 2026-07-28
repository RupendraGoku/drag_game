import mongoose from 'mongoose';

const imageRefSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    alt: String,
    width: Number,
    height: Number
  },
  { _id: false }
);

const topCategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    colour: { type: String, default: '#2563eb' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const tierSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true, maxlength: 60 },
    backgroundColour: { type: String, default: '#f8fafc' },
    textColour: { type: String, default: '#111827' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 300 },
    alt: { type: String, default: '' },
    image: imageRefSchema,
    categoryIds: [{ type: String }],
    order: { type: Number, default: 0 }
  },
  { _id: false }
);

const genreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may contain lowercase letters, numbers and hyphens only']
    },
    heading: { type: String, default: '', trim: true, maxlength: 160 },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    coverImage: imageRefSchema,
    showAllCategory: { type: Boolean, default: true },
    topCategories: [topCategorySchema],
    tiers: [tierSchema],
    items: [itemSchema],
    version: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true
    },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    publishedAt: Date
  },
  { timestamps: true }
);

genreSchema.index({ status: 1, isActive: 1 });
genreSchema.index({ createdAt: -1 });
genreSchema.index({ updatedAt: -1 });

genreSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Genre = mongoose.model('Genre', genreSchema);
