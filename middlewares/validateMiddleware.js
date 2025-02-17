const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);  // Si le schéma est invalide
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

module.exports = { validate };
