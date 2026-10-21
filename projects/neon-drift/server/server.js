const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de conexión a PostgreSQL local
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'neon_drift_db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '12345',
  connectionTimeoutMillis: 5000,
});

app.use(cors());
app.use(express.json());

function hashPassword(password) {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

// 1. Healthcheck
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      database: 'PostgreSQL 17 (neon_drift_db)',
      time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 2. Obtener lista de usuarios
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT username FROM users ORDER BY username ASC');
    const usernames = result.rows.map((r) => r.username);
    res.json({ usernames });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2b. Obtener usuario por ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, coins, selected_car_id FROM users WHERE id = $1',
      [req.params.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hash = hashPassword(password);
    const userRes = await client.query(
      'INSERT INTO users (username, password_hash, coins, selected_car_id, created_at) VALUES ($1, $2, 1500, $3, $4) RETURNING id, username, coins, selected_car_id',
      [username.trim(), hash, 'cyber_phantom', Date.now()]
    );
    const user = userRes.rows[0];

    // Inicializar coches por defecto
    const cars = [
      { id: 'cyber_phantom', unlocked: true, color: 4278251775, underglow: 4278251775 },
      { id: 'neon_viper', unlocked: false, color: 4294902143, underglow: 4294907027 },
      { id: 'hyperion_gt', unlocked: false, color: 4294956800, underglow: 4294950656 },
      { id: 'vortex_apex', unlocked: false, color: 4286339821, underglow: 4290707711 },
    ];

    for (const car of cars) {
      await client.query(
        `INSERT INTO user_cars (user_id, car_id, is_unlocked, speed_lvl, accel_lvl, handling_lvl, nitro_lvl, body_color, underglow_color)
         VALUES ($1, $2, $3, 1, 1, 1, 1, $4, $5) ON CONFLICT DO NOTHING`,
        [user.id, car.id, car.unlocked, car.color, car.underglow]
      );
    }

    await client.query('COMMIT');
    res.json({ user });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 4. Login de usuario
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = hashPassword(password);
    const result = await pool.query(
      'SELECT id, username, coins, selected_car_id FROM users WHERE username = $1 AND password_hash = $2',
      [username.trim(), hash]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Obtener coches de un usuario
app.get('/api/cars/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT car_id, is_unlocked, speed_lvl, accel_lvl, handling_lvl, nitro_lvl, body_color, underglow_color
       FROM user_cars WHERE user_id = $1`,
      [req.params.userId]
    );
    res.json({ cars: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Seleccionar coche activo
app.post('/api/cars/select', async (req, res) => {
  const { userId, carId } = req.body;
  try {
    await pool.query('UPDATE users SET selected_car_id = $1 WHERE id = $2', [carId, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Desbloquear coche
app.post('/api/cars/unlock', async (req, res) => {
  const { userId, carId, cost } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userRes = await client.query('SELECT coins FROM users WHERE id = $1', [userId]);
    if (!userRes.rows.length || userRes.rows[0].coins < cost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Monedas insuficientes' });
    }

    await client.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [cost, userId]);
    await client.query('UPDATE user_cars SET is_unlocked = true WHERE user_id = $1 AND car_id = $2', [userId, carId]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 8. Mejorar estadística
app.post('/api/cars/upgrade', async (req, res) => {
  const { userId, carId, statType, newLevel, cost } = req.body;
  const colMap = {
    speed: 'speed_lvl',
    accel: 'accel_lvl',
    handling: 'handling_lvl',
    nitro: 'nitro_lvl',
  };
  const col = colMap[statType];
  if (!col) return res.status(400).json({ error: 'Tipo de mejora inválido' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userRes = await client.query('SELECT coins FROM users WHERE id = $1', [userId]);
    if (!userRes.rows.length || userRes.rows[0].coins < cost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Monedas insuficientes' });
    }

    await client.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [cost, userId]);
    await client.query(`UPDATE user_cars SET ${col} = $1 WHERE user_id = $2 AND car_id = $3`, [newLevel, userId, carId]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 9. Actualizar colores
app.post('/api/cars/colors', async (req, res) => {
  const { userId, carId, bodyColor, underglowColor } = req.body;
  try {
    await pool.query(
      'UPDATE user_cars SET body_color = $1, underglow_color = $2 WHERE user_id = $3 AND car_id = $4',
      [bodyColor, underglowColor, userId, carId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Añadir / Modificar monedas
app.post('/api/coins', async (req, res) => {
  const { userId, delta } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET coins = GREATEST(0, coins + $1) WHERE id = $2 RETURNING coins',
      [delta, userId]
    );
    res.json({ coins: result.rows[0]?.coins || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Progreso de circuito
app.get('/api/tracks/:userId/:trackId', async (req, res) => {
  const { userId, trackId } = req.params;
  try {
    const result = await pool.query(
      'SELECT best_time_sec, best_score, m1_done, m2_done, m3_done FROM track_progress WHERE user_id = $1 AND track_id = $2',
      [userId, trackId]
    );
    if (result.rows.length === 0) {
      return res.json({ best_time_sec: 999.0, best_score: 0, m1_done: false, m2_done: false, m3_done: false });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Guardar resultado de carrera
app.post('/api/tracks/race-result', async (req, res) => {
  const { userId, trackId, timeSec, score, m1, m2, m3 } = req.body;
  try {
    const curRes = await pool.query(
      'SELECT best_time_sec, best_score, m1_done, m2_done, m3_done FROM track_progress WHERE user_id = $1 AND track_id = $2',
      [userId, trackId]
    );
    const cur = curRes.rows[0] || { best_time_sec: 999.0, best_score: 0, m1_done: false, m2_done: false, m3_done: false };
    const newBestTime = timeSec < cur.best_time_sec ? timeSec : cur.best_time_sec;
    const newBestScore = score > cur.best_score ? score : cur.best_score;
    const newM1 = m1 || cur.m1_done;
    const newM2 = m2 || cur.m2_done;
    const newM3 = m3 || cur.m3_done;

    await pool.query(
      `INSERT INTO track_progress (user_id, track_id, best_time_sec, best_score, m1_done, m2_done, m3_done)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, track_id) DO UPDATE SET
         best_time_sec = EXCLUDED.best_time_sec,
         best_score = EXCLUDED.best_score,
         m1_done = EXCLUDED.m1_done,
         m2_done = EXCLUDED.m2_done,
         m3_done = EXCLUDED.m3_done`,
      [userId, trackId, newBestTime, newBestScore, newM1, newM2, newM3]
    );
    res.json({ success: true, bestTime: newBestTime, bestScore: newBestScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Neon Drift PostgreSQL Server] Corriendo en http://0.0.0.0:${PORT}`);
  console.log(`[Neon Drift PostgreSQL Server] Conectado a neon_drift_db en PostgreSQL 17`);
});
