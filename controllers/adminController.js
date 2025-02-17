const Admin = require('../models/AdminModel');
const jwt = require('jsonwebtoken');

// Génération du token JWT
const generateToken = (admin) => {
    return jwt.sign(
        { id: admin._id, email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
    );
};

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, contactNumber, whatsappLink, role } = req.body;

        // Validation des champs obligatoires
        if (!name || !email || !password || !contactNumber || !whatsappLink || !role) {
            return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
        }

        // Vérification de l'unicité de l'email
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        // Création du nouvel admin
        const newAdmin = new Admin({
            name,
            email,
            password,
            contactNumber,
            whatsappLink,
            role: role || 'moderateur', // Par défaut, le rôle est 'admin'
        });

        // Enregistrement dans la base de données
        await newAdmin.save();

        // Réponse de succès
        res.status(201).json({ message: 'Admin enregistré avec succès.', adminId: newAdmin._id });
    } catch (err) {
        console.error("Erreur lors de l'enregistrement :", err);
        res.status(500).json({ message: 'Erreur du serveur.', error: err.message });
    }
};
// Connexion d'un admin
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        const token = generateToken(admin);
        res.json({ token, admin: admin.toJSON() }); // Assurez-vous que admin est bien un objet JSON
    } catch (err) {
        res.status(500).json({ message: 'Erreur du serveur.', error: err.message });
    }
};

// Obtenir tous les admins
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password'); // Exclure le mot de passe
        res.json(admins);
    } catch (err) {
        res.status(500).json({ message: 'Erreur du serveur.', error: err.message });
    }
};

// Obtenir un admin par ID
const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: 'Admin non trouvé.' });
        }
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: 'Erreur du serveur.', error: err.message });
    }
};

// Mise à jour d'un admin
const updateAdmin = async (req, res) => {
    try {
        const { name, email, contactNumber, whatsappLink, role } = req.body;

        const admin = await Admin.findByIdAndUpdate(
            req.params.id,
            { name, email, contactNumber, whatsappLink, role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!admin) {
            return res.status(404).json({ message: 'Admin non trouvé.' });
        }

        res.json({ message: 'Admin mis à jour avec succès.', admin });
    } catch (err) {
        res.status(500).json({ message: 'Erreur du serveur.', error: err.message });
    }
};


// Suppression d'un admin
const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin non trouvé.' });
        }
        res.json({ message: 'Admin supprimé avec succès.' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur du serveur.', error: err.message });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
};
