module.exports = class Pokemon {
    data = {};

    constructor(data) {
        this.data = data;
    }

    toShowdownTeamJson() {
        return [
            {
                name: this.data.pokemonName,
                species: this.data.smogonName,
                moves: [this.data.moveName],
                ability: this.data.abilityName,
                item: this.data.itemName || '',
                evs: {
                    hp: 0,
                    atk: 0,
                    def: 0,
                    spa: 0,
                    spd: 0,
                    // For validation ; doesn't change the actual stats
                    spe: 1
                },
                nature: 'Hardy',
                level: 100,
                shiny: false,
        }
    ]}
};