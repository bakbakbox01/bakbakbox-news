import mongoose from 'mongoose';

const generateSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    image: {
      type: imageSchema,
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Author is required'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 20,
        message: 'Cannot have more than 20 tags',
      },
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative'],
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: null,
    },
    sourceName: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

newsSchema.index({ title: 'text', shortDescription: 'text', tags: 'text' });
newsSchema.index({ category: 1, status: 1, publishedAt: -1 });
newsSchema.index({ status: 1, isBreaking: 1, publishedAt: -1 });
newsSchema.index({ views: -1 });

newsSchema.pre('validate', function setSlug(next) {
  if (this.isModified('slug') && this.slug) {
    return next();
  }

  if ((this.isModified('title') || !this.slug) && this.title) {
    this.slug = generateSlug(this.title);
  }

  next();
});

newsSchema.pre('save', function setPublishedAt(next) {
  if (this.isModified('status')) {
    if (this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }
  }

  next();
});

const News = mongoose.model('News', newsSchema);

export default News;
