const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db = new sqlite3.Database('./data/data.db');

db.all('SELECT * FROM pokemon;', async (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }

    const results = await Promise.all(rows.map(async row => {
        const wins = await getWins(row.id);
        const losses = await getLosses(row.id);
        const winRate = wins / (wins + losses) * 100;

        return {
            ...row,
            wins,
            losses,
            winRate,
        };
    }));

    results.sort((a, b) => b.wins - a.wins);
    fs.writeFile('./data/exported-data.json', JSON.stringify(results, null, 2), (err) => {
        if (err) {
            console.error('Error writing file', err);
            return;
        }
        
        console.log('Exported data has been saved !');
    });
});

function getWins(pokemonId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS count FROM wins WHERE winnerPokemonId = ?', [pokemonId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(Number(row.count));
        });
    });
}

function getLosses(pokemonId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS count FROM wins WHERE loserPokemonId = ?', [pokemonId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(Number(row.count));
        });
    });
}