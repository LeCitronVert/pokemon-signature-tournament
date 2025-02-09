const {Teams} = require('@pkmn/sim');

module.exports = class Player {
    constructor(pokemon) {
        this.pokemon = pokemon;
    }

    get playerName() {
        const species = this.pokemon.data.smogonName;
        const move = this.pokemon.data.moveName;
        const ability = this.pokemon.data.abilityName;
        const item = this.pokemon.data.itemName;

        return `${species} (${ability}) - ${move}${item ? ` @ ${item}` : ''}`;
    }

    toShowdownBattleFormat(playerNumber) {
        return {
            name: 'p'+playerNumber+this.playerName.trim(),
            team: Teams.pack(this.pokemon.toShowdownTeamJson())
        };
    }
};