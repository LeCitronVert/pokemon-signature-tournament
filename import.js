const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/data.db');
const rawData = require('./data/raw-data.json');
const {Dex} = require('@pkmn/sim');

db.run(
    'CREATE TABLE IF NOT EXISTS pokemon (id INTEGER PRIMARY KEY, pokemonName TEXT, formName TEXT NULL, smogonName TEXT, moveName TEXT, abilityName TEXT, itemName TEXT NULL);',
    (err) => {
        if (err) {
            console.error(err);
            return;
        }

        db.run('DELETE FROM pokemon;', (err) => {
            if (err) {
                console.error(err);
                return;
            }

            rawData.forEach((pokemon) => {
                const pokemonAbilities = Dex.species.get(pokemon.smogonName).abilities;

                for ([index, ability] of Object.entries(pokemonAbilities)) {
                    const pokemonItems = pokemon.items || [null];

                    pokemonItems.forEach((item) => {
                        const stmt = db.prepare('INSERT INTO pokemon (pokemonName, formName, smogonName, moveName, abilityName, itemName) VALUES (?, ?, ?, ?, ?, ?);');
                        stmt.run(
                            pokemon.pokemonName, 
                            pokemon.formName, 
                            pokemon.smogonName, 
                            pokemon.move, 
                            ability, 
                            item
                        );
                        stmt.finalize();

                        console.log(`Inserted ${pokemon.pokemonName} (${pokemon.formName}) with ${pokemon.move} and ${ability} holding ${item || 'nothing'}`);
                    });
                }
            });
        });
    }
);
