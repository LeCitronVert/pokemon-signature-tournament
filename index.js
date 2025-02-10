// Actual tournament program
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/data.db');
const config = require('./data/config.json');
const Pokemon = require('./classes/Pokemon.js');
const Player = require('./classes/Player.js');
const {BattleStreams, RandomPlayerAI} = require('@pkmn/sim');

// Code proper starts here
db.run(
    'CREATE TABLE IF NOT EXISTS wins (id INTEGER PRIMARY KEY, winnerPokemonId INTEGER, loserPokemonId INTEGER);',
    (err) => {
        if (err) {
            console.error(err);
            return;
        }

        db.run('DELETE FROM wins;', (err) => {
            if (err) {
                console.error(err);
                return;
            }

            startBattles();
        });
    }
);

function startBattles() 
{
    db.all('SELECT * FROM pokemon;', async (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
    
        // Const for all battles
        const battleSpecs = {formatid: config.showdownFormat};
        const numberOfBattles = config.numberOfBattles;
    
        for (const firstPokemonRow of rows) {
            // todo : Looking back, this is stupid.
            // I should just query for all pokémons that haven't been played against each other yet
            for (const secondPokemonRow of rows) {
                if (firstPokemonRow.id === secondPokemonRow.id) {
                    console.log('Skipping mirror match.');
                    continue;
                }

                // Check if battle has already been played
                if (await battleHasAlreadyBeenPlayed(firstPokemonRow.id, secondPokemonRow.id)) {
                    console.log('Battle has already been played.');
                    continue;
                }
    
                // Repeat battle for set number of times in config
                let battles = [];
                for (let i = 0; i < numberOfBattles; i++) {
                    battles.push(new Promise((resolve, reject) => {
                        setUpBattle(firstPokemonRow, secondPokemonRow, battleSpecs, resolve, reject);
                    }));
                }

                await Promise.all(battles);
            }
        }
    
        console.log("It's fucking done yippee");
    });
}

function battleHasAlreadyBeenPlayed(firstPokemonId, secondPokemonId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('SELECT COUNT(*) AS count FROM wins WHERE (winnerPokemonId = ? AND loserPokemonId = ?) OR (winnerPokemonId = ? AND loserPokemonId = ?);');
        stmt.get(firstPokemonId, secondPokemonId, secondPokemonId, firstPokemonId, (err, row) => {
            if (err) {
                reject(err);
            }

            resolve(row.count > 0);
        });
    });
}


function setUpBattle(firstPokemonRow, secondPokemonRow, battleSpecs, resolve, reject) {
    const playerOneSpec = preparePlayer(firstPokemonRow).toShowdownBattleFormat(1);
    const playerTwoSpec = preparePlayer(secondPokemonRow).toShowdownBattleFormat(2);

    const streams = BattleStreams.getPlayerStreams(new BattleStreams.BattleStream());
    const p1 = new RandomPlayerAI(streams.p1);
    const p2 = new RandomPlayerAI(streams.p2);

    void p1.start();
    void p2.start();

    void (async () => {
    for await (const chunk of streams.omniscient) {
        if (chunk.includes('|win|')) {
            // Detect whick player won
            if (chunk.includes('|win|'+playerOneSpec.name)) {
                registerWin(firstPokemonRow.id, secondPokemonRow.id,resolve, reject);
                console.log(`#${firstPokemonRow.id} ${playerOneSpec.name.substring(2)} won against ${playerTwoSpec.name.substring(2)}`);

                break;
            }

            if (chunk.includes('|win|'+playerTwoSpec.name)) {
                registerWin(secondPokemonRow.id, firstPokemonRow.id, resolve, reject);
                console.log(`#${secondPokemonRow.id} ${playerTwoSpec.name.substring(2)} won against ${playerOneSpec.name.substring(2)}`);

                break;
            }


            reject('Battle ended without a winner ???');
        }
    }
    })();

    void streams.omniscient.write(`>start ${JSON.stringify(battleSpecs)}
>player p1 ${JSON.stringify(playerOneSpec)}
>player p2 ${JSON.stringify(playerTwoSpec)}`);
}

function preparePlayer(pokemonRow) {
    return new Player(new Pokemon(pokemonRow));
}

function registerWin(winningPokemonId, losingPokemonid, resolve, reject) {
    const stmt = db.prepare('INSERT INTO wins (winnerPokemonId, loserPokemonId) VALUES (?, ?);');
    stmt.run(winningPokemonId, losingPokemonid);
    stmt.finalize((err) => {
        if (err) {
            reject(err);
        }

        resolve();
    });
}