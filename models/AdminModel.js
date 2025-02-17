const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Veuillez fournir une adresse email valide.']
    },
    password: {
        type: String,
        required: true,
        minlength: 4
    },
    contactNumber: { type: String,required: true, },
    whatsappLink: { type: String ,required: true,},
    role: { type: String, enum: ['admin', 'moderateur'], default: 'moderateur' ,required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, 
{
    timestamps: true
});

// Hashage du mot de passe avant enregistrement
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Méthode pour comparer les mots de passe
adminSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
