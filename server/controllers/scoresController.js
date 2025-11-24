//server/controllers/scoresController.js
import { db } from "../db.js";

// Guarda o actualiza puntaje
export async function saveScore(req, res) {
    try {
        const {
            uid,
            username,
            photo_url,
            dificultad,
            nivel,
            esmeraldas,
            diamantes,
            tiempo_final,
            puntos
        } = req.body;

        if (!uid || !dificultad || !nivel || puntos === undefined) {
            return res.status(400).json({ error: "Datos incompletos" });
        }

        // 1. Verificar puntaje previo del usuario
        const [rows] = await db.query(
            `SELECT puntos FROM scores
             WHERE uid = ? AND dificultad = ? AND nivel = ?`,
            [uid, dificultad, nivel]
        );

        if (rows.length > 0) {
            const prev = rows[0];

            // Si el puntaje previo es igual o mayor → no actualizar
            if (prev.puntos >= puntos) {
                return res.json({
                    status: "OK",
                    message: "Puntuación no reemplazada (menor o igual que la existente)",
                    puntosActuales: prev.puntos
                });
            }

            // 2. Actualizar puntaje existente
            await db.query(
                `UPDATE scores
                 SET username = ?, photo_url = ?, esmeraldas = ?, diamantes = ?, tiempo_final = ?, puntos = ?, created_at = NOW()
                 WHERE uid = ? AND dificultad = ? AND nivel = ?`,
                [
                    username,
                    photo_url,
                    esmeraldas,
                    diamantes,
                    tiempo_final,
                    puntos,
                    uid,
                    dificultad,
                    nivel
                ]
            );

            return res.json({
                status: "OK",
                message: "Puntuación actualizada",
                puntos
            });

        } else {
            // 3. Insertar nuevo puntaje
            await db.query(
                `INSERT INTO scores 
                 (uid, username, photo_url, dificultad, nivel, esmeraldas, diamantes, tiempo_final, puntos, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    uid,
                    username,
                    photo_url,
                    dificultad,
                    nivel,
                    esmeraldas,
                    diamantes,
                    tiempo_final,
                    puntos
                ]
            );

            return res.json({
                status: "OK",
                message: "Puntuación guardada",
                puntos
            });
        }

    } catch (error) {
        console.error("Error guardando puntuación:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}


// Obtener leaderboard
export async function getLeaderboard(req, res) {
    try {
        const { dificultad, nivel } = req.params;

        const [rows] = await db.query(
            `SELECT uid, username, photo_url, esmeraldas, diamantes, tiempo_final, puntos, created_at
             FROM scores
             WHERE dificultad = ? AND nivel = ?
             ORDER BY puntos DESC
             LIMIT 20`,
            [dificultad, nivel]
        );

        return res.json(rows);

    } catch (error) {
        console.error("Error obteniendo leaderboard:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}
