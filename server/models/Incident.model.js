import mongoose from "mongoose";

const IncidentSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      required: true,
    },
    issueMessage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Incident = mongoose.model("Incident", IncidentSchema);
export default Incident;
