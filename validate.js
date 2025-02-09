// Run this before running the battle sim
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/data.db');
const {TeamValidator, Dex } = require('@pkmn/sim');
const config = require('./data/config.json');
const Pokemon = require('./classes/Pokemon.js');


db.all('SELECT * FROM pokemon;', (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }

    const validator = new TeamValidator(Dex.formats.get(config.showdownFormat));

    rows.forEach((row) => {
        let pokemon = new Pokemon(row);

        const problems = validator.validateTeam(pokemon.toShowdownTeamJson());

        if (problems) {
            console.log('Problems with ' + pokemon.data.smogonName);
            console.log(JSON.stringify(problems));
        }
    });
});