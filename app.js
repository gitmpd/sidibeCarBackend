require('dotenv').config();
const fs = require('fs');
const path = require('path');  // Ajoute cette ligne pour importer path
const express = require('express');
const cors = require('cors');  // Importer CORS
const connectDB = require('./config/db');
const carRoutes = require('./routes/carRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middlewares/errorHandler');
const Click = require('./models/ClickModel');
const { Car } = require("./models/CarModel");
const app = express();
const uploadDir = path.join(__dirname, 'uploads');
// Middleware pour parser le corps des requêtes JSON
app.use(express.json());
// Vérifier si le dossier existe, sinon le créer
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// Connexion à la base de données
connectDB();
// Appliquer CORS à toutes les routes
app.use(cors());
// Route pour enregistrer un clic
app.post("/api/clicks", async (req, res) => {
  const { carId, action, timestamp } = req.body;  // Cela ne devrait plus causer d'erreur
  console.log(carId, action, timestamp); // Ajouter pour vérifier si les données arrivent

  if (!carId || !action || !timestamp) {
    return res.status(400).json({ message: "Données manquantes" });
  }

  try {
    const click = new Click({ carId, action, timestamp: new Date(timestamp) });
    await click.save();
    res.status(201).send("Clic enregistré");
  } catch (err) {
    res.status(500).json({ message: 'Erreur du serveur.', error: err.message });
  }
});

  app.get("/api/clicks", async (req, res) => {
    try {
        const clicks = await Click.find(); // Exclure le mot de passe
        res.json(clicks);
    } catch (err) {
        res.status(500).json({ message: 'Erreur du serveur.', error: err.message });
    }
  });
  // app.get('/api/clicks/stats', async (req, res) => {
  //   try {
  //     // Comptage des clics par jour
  //     const dailyClicks = await Click.aggregate([
  //       {
  //         $project: {
  //           date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
  //         }
  //       },
  //       {
  //         $group: {
  //           _id: "$date",
  //           totalClicks: { $sum: 1 }
  //         }
  //       },
  //       { $sort: { _id: -1 } }  // Trier par date
  //     ]);
  
  //     // Trouver la voiture la plus cliquée
  //     const mostClickedCar = await Click.aggregate([
  //       {
  //         $group: {
  //           _id: "$carId",
  //           clicks: { $sum: 1 }
  //         }
  //       },
  //       { $sort: { clicks: -1 } },
  //       { $limit: 1 }
  //     ]);
  
  //     const car = await Car.findById(mostClickedCar[0]._id);
  
  //     res.json({
  //       dailyClicks,
  //       mostClickedCar: {
  //         car: car,
  //         clicks: mostClickedCar[0].clicks
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des statistiques : ", error);
  //     res.status(500).send("Erreur serveur");
  //   }
  // });
// Servir les fichiers statiques du dossier public
app.get('/api/clicks/stats', async (req, res) => {
  try {
      // Obtenir la date du jour au format "YYYY-MM-DD"
      const today = new Date().toISOString().split("T")[0];

      // Comptage des clics par jour
      const dailyClicks = await Click.aggregate([
          {
              $project: {
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              }
          },
          {
              $group: {
                  _id: "$date",
                  totalClicks: { $sum: 1 }
              }
          },
          { $sort: { _id: -1 } }  // Trier par date décroissante
      ]);

      // 📌 **NOUVEAU : Trouver la voiture la plus cliquée aujourd’hui**
      const mostClickedCarToday = await Click.aggregate([
          {
              $project: {
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                  carId: 1
              }
          },
          { $match: { date: today } }, // 🛑 Filtrer uniquement les clics du jour
          {
              $group: {
                  _id: "$carId",
                  clicks: { $sum: 1 }
              }
          },
          { $sort: { clicks: -1 } },
          { $limit: 1 }
      ]);

      let mostClickedCar = null;
      if (mostClickedCarToday.length > 0) {
          mostClickedCar = await Car.findById(mostClickedCarToday[0]._id);
      }

      res.json({
          dailyClicks,
          mostClickedCar: mostClickedCar
              ? { car: mostClickedCar, clicks: mostClickedCarToday[0].clicks }
              : null
      });
  } catch (error) {
      console.error("Erreur lors de la récupération des statistiques : ", error);
      res.status(500).send("Erreur serveur");
  }
});

app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/uploads', express.static(uploadDir)); 
app.use(express.json());
app.use('/api/cars', carRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);

module.exports = app;
