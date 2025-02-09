let data = [];
document
    .querySelector('table.roundy')
    .querySelectorAll('tr')
    .forEach(trElement => {
        if ('none' === trElement.style.display || !trElement.getAttribute('style')) {
            return;
        }

        const pokemonName = trElement.querySelector('td:nth-child(3) a').textContent;
        const formName = trElement.querySelector('td:nth-child(3) small a')?.textContent || null;

        let moves = [];

        trElement.querySelectorAll('td:nth-child(n+4) span').forEach(moveElement => {
            const moveName = moveElement.textContent.trim();

            if (!moves.includes(moveName)) {
                moves.push(moveName);
            }
        });

        moves.forEach(move => {
            data.push({
                pokemonName: pokemonName,
                formName: formName ? formName.split(' ')[0] : null,
                smogonName: pokemonName + (formName ? `-${formName.split(' ')[0]}` : ''),
                move: move,
            });
        });
    })
;
console.log(JSON.stringify(data));