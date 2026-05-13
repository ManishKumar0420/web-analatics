import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
  },

  event_type: {
    type: String,
    required: true,
  },

  page_url: {
    type: String,
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },

  x: Number,
  y: Number,
});
EventSchema.index({ session_id: 1 });

EventSchema.index({ page_url: 1 });

EventSchema.index({ timestamp: -1 });
export default mongoose.models.Event || mongoose.model("Event", EventSchema);