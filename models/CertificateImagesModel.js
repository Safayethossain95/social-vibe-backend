// models/PartnerBrand.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const certificateImagesSchema = new Schema({
  img: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const CertificateImages = mongoose.model('CertificateImage', certificateImagesSchema);
module.exports = CertificateImages;
