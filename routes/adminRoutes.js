const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const { adminSchema } = require("../utils/validationSchemas"); // Ajout de la validation
const { validate } = require("../middlewares/validateMiddleware"); // Middleware de validation

const router = express.Router();

// Routes publiques
router.post("/register", validate(adminSchema), registerAdmin); // Validation avant inscription
router.post("/login", loginAdmin); // Connexion
// Liste des admins
router.get("/:id", getAdminById); // Détails d'un admin
router.put("/:id", updateAdmin); // Validation ajoutée
router.delete("/:id", deleteAdmin); // Suppression d'un admin
// Routes protégées
// router.use(authMiddleware);

router.get("/", getAllAdmins);

module.exports = router;
